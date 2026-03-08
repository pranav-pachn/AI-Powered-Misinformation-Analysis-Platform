import pool from '../config/db.js';
import { analyzeNews } from '../services/aiService.js';
import {
  validateAndNormalizeUrl,
  assertNotPrivateHost,
  fetchHtml,
  extractArticleText,
} from '../services/urlExtractService.js';
import { checkMultipleClaims, analyzeCredibility } from '../services/factCheckService.js';

function validateText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    const error = new Error('Text is required for analysis.');
    error.statusCode = 400;
    throw error;
  }
}

export async function predictNews(req, res, next) {
  try {
    const { text } = req.body;
    const userId = req.user.userId;
    validateText(text);

    // Verify user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Analyze article with advanced AI response
    const aiResult = await analyzeNews(text);

    const {
      overall_result,
      overall_confidence,
      explanation,
      bias = {},
      claims = [],
      sentence_analysis = [],
    } = aiResult || {};

    if (!overall_result || typeof overall_confidence !== 'number') {
      const error = new Error('AI analysis failed to produce valid results.');
      error.statusCode = 502;
      throw error;
    }

    const biasType = typeof bias.type === 'string' ? bias.type : null;
    const biasScore =
      typeof bias.score === 'number' && !Number.isNaN(bias.score) ? bias.score : null;
    const emotionalTone =
      typeof bias.emotional_tone === 'string' ? bias.emotional_tone : null;

    // Insert into news table
    const insertNewsSql = `
      INSERT INTO news (user_id, content, source_url, overall_result, overall_confidence, bias_type, bias_score, emotional_tone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const newsValues = [
      userId,
      text,
      null,
      overall_result,
      overall_confidence,
      biasType,
      biasScore,
      emotionalTone,
    ];

    const [newsResult] = await pool.execute(insertNewsSql, newsValues);
    const newsId = newsResult.insertId;

    // Insert claims and sentence-level analysis
    await insertClaimsAndSentences(newsId, claims, sentence_analysis);

    // Perform real-time fact-checking on claims (non-blocking)
    let factCheckResults = { claims: [], credibilityWarning: null };
    try {
      const factChecks = await checkMultipleClaims(claims);
      const credibility = analyzeCredibility(factChecks);
      if (credibility.warning) {
        factCheckResults.credibilityWarning = credibility.warning;
      }
      factCheckResults.claims = factChecks;
    } catch (error) {
      console.warn('Fact-check failed gracefully:', error.message);
      // Continue without fact-checks - they're supplementary
    }

    res.json({
      news_id: newsId,
      content: text,
      overall_result,
      overall_confidence,
      explanation: explanation || '',
      bias: {
        type: biasType,
        score: biasScore,
        emotional_tone: emotionalTone,
      },
      claims,
      sentence_analysis,
      fact_check_warning: factCheckResults.credibilityWarning,
      // Backwards-compatible fields for existing frontend components
      result: overall_result,
      confidence: overall_confidence,
    });
  } catch (error) {
    next(error);
  }
}

async function insertClaimsAndSentences(newsId, claims, sentence_analysis) {
  // Insert claims
  if (Array.isArray(claims) && claims.length > 0) {
    const insertClaimSql =
      'INSERT INTO claims (news_id, claim_text, explanation, verdict, confidence) VALUES (?, ?, ?, ?, ?)';

    for (const claim of claims) {
      const claimText =
        typeof claim.claim_text === 'string'
          ? claim.claim_text
          : typeof claim.claim === 'string'
            ? claim.claim
            : '';
      const explanation =
        typeof claim.explanation === 'string' && claim.explanation.trim()
          ? claim.explanation.trim()
          : null;
      const verdict = typeof claim.verdict === 'string' ? claim.verdict : null;
      const claimConfidence =
        typeof claim.confidence === 'number' && !Number.isNaN(claim.confidence)
          ? claim.confidence
          : null;

      if (!claimText || !verdict || claimConfidence === null) continue;

      await pool.execute(insertClaimSql, [newsId, claimText, explanation, verdict, claimConfidence]);
    }
  }

  // Insert sentence-level analysis
  if (Array.isArray(sentence_analysis) && sentence_analysis.length > 0) {
    const insertSentenceSql =
      'INSERT INTO sentence_analysis (news_id, sentence_text, risk_level) VALUES (?, ?, ?)';

    for (const item of sentence_analysis) {
      const sentenceText =
        typeof item.sentence_text === 'string' ? item.sentence_text : '';
      const riskLevel =
        typeof item.risk_level === 'string' ? item.risk_level : null;

      if (!sentenceText || !riskLevel) continue;

      await pool.execute(insertSentenceSql, [newsId, sentenceText, riskLevel]);
    }
  }
}

export async function predictNewsFromUrl(req, res, next) {
  try {
    const { url } = req.body;
    const userId = req.user.userId;

    // Verify user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const normalizedUrl = validateAndNormalizeUrl(url);
    await assertNotPrivateHost(normalizedUrl);
    const html = await fetchHtml(normalizedUrl);
    const extractedText = extractArticleText(html);

    const aiResult = await analyzeNews(extractedText);

    const {
      overall_result,
      overall_confidence,
      explanation,
      bias = {},
      claims = [],
      sentence_analysis = [],
    } = aiResult || {};

    if (!overall_result || typeof overall_confidence !== 'number') {
      const error = new Error('AI analysis failed to produce valid results.');
      error.statusCode = 502;
      throw error;
    }

    const biasType = typeof bias.type === 'string' ? bias.type : null;
    const biasScore =
      typeof bias.score === 'number' && !Number.isNaN(bias.score) ? bias.score : null;
    const emotionalTone =
      typeof bias.emotional_tone === 'string' ? bias.emotional_tone : null;

    const insertNewsSql = `
      INSERT INTO news (user_id, content, source_url, overall_result, overall_confidence, bias_type, bias_score, emotional_tone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const newsValues = [
      userId,
      extractedText,
      normalizedUrl,
      overall_result,
      overall_confidence,
      biasType,
      biasScore,
      emotionalTone,
    ];

    const [newsResult] = await pool.execute(insertNewsSql, newsValues);
    const newsId = newsResult.insertId;

    await insertClaimsAndSentences(newsId, claims, sentence_analysis);

    // Perform real-time fact-checking on claims (non-blocking)
    let factCheckResults = { claims: [], credibilityWarning: null };
    try {
      const factChecks = await checkMultipleClaims(claims);
      const credibility = analyzeCredibility(factChecks);
      if (credibility.warning) {
        factCheckResults.credibilityWarning = credibility.warning;
      }
      factCheckResults.claims = factChecks;
    } catch (error) {
      console.warn('Fact-check failed gracefully:', error.message);
      // Continue without fact-checks - they're supplementary
    }

    res.json({
      news_id: newsId,
      content: extractedText,
      source_url: normalizedUrl,
      overall_result,
      overall_confidence,
      explanation: explanation || '',
      bias: {
        type: biasType,
        score: biasScore,
        emotional_tone: emotionalTone,
      },
      claims,
      sentence_analysis,
      fact_check_warning: factCheckResults.credibilityWarning,
      result: overall_result,
      confidence: overall_confidence,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT
        id,
        content,
        source_url,
        overall_result AS result,
        overall_confidence AS confidence,
        bias_type,
        bias_score,
        emotional_tone,
        created_at
      FROM news
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function getArticleWithClaims(req, res, next) {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // Get article
    const articleQuery = `
      SELECT
        id,
        content,
        source_url,
        overall_result AS result,
        overall_confidence AS confidence,
        bias_type,
        bias_score,
        emotional_tone,
        created_at
      FROM news
      WHERE id = ? AND user_id = ?
    `;
    const [articles] = await pool.execute(articleQuery, [articleId, userId]);

    if (articles.length === 0) {
      const error = new Error('Article not found.');
      error.statusCode = 404;
      throw error;
    }

    const article = articles[0];

    // Get claims
    const claimsQuery = `
      SELECT claim_text, explanation, verdict, confidence
      FROM claims
      WHERE news_id = ?
      ORDER BY created_at ASC
    `;
    const [claims] = await pool.execute(claimsQuery, [articleId]);

    // Get sentence-level analysis
    const sentenceQuery = `
      SELECT sentence_text, risk_level
      FROM sentence_analysis
      WHERE news_id = ?
      ORDER BY created_at ASC
    `;
    const [sentences] = await pool.execute(sentenceQuery, [articleId]);

    res.json({
      ...article,
      claims: claims.map((c) => ({
        claim_text: c.claim_text,
        explanation: c.explanation,
        verdict: c.verdict,
        confidence: c.confidence,
      })),
      sentence_analysis: sentences.map((s) => ({
        sentence_text: s.sentence_text,
        risk_level: s.risk_level,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const userId = req.user.userId;

    // Total articles and Fake/Real counts
    const [resultCounts] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN overall_result = 'Fake' THEN 1 ELSE 0 END) AS fake_count,
        SUM(CASE WHEN overall_result = 'Real' THEN 1 ELSE 0 END) AS real_count,
        SUM(CASE WHEN source_url IS NOT NULL THEN 1 ELSE 0 END) AS url_based_count
      FROM news
      WHERE user_id = ?
    `,
      [userId],
    );

    const countsRow = resultCounts[0] || {
      total: 0,
      fake_count: 0,
      real_count: 0,
      url_based_count: 0,
    };

    // Bias distribution
    const [biasRows] = await pool.execute(
      `
      SELECT bias_type, COUNT(*) AS count
      FROM news
      WHERE user_id = ?
        AND bias_type IS NOT NULL
      GROUP BY bias_type
    `,
      [userId],
    );

    const biasDistribution = {
      'Left-Leaning': 0,
      'Right-Leaning': 0,
      Neutral: 0,
    };

    for (const row of biasRows) {
      if (!row.bias_type) continue;
      if (biasDistribution[row.bias_type] !== undefined) {
        biasDistribution[row.bias_type] = row.count;
      }
    }

    // Daily trend
    const [trendRows] = await pool.execute(
      `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM news
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
      [userId],
    );

    const dailyTrend = trendRows.map((row) => ({
      date: row.date,
      count: row.count,
    }));

    res.json({
      total_articles: countsRow.total,
      fake_count: countsRow.fake_count,
      real_count: countsRow.real_count,
      url_based_count: countsRow.url_based_count || 0,
      bias_distribution: biasDistribution,
      daily_trend: dailyTrend,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(req, res, next) {
  try {
    const userId = req.user.userId;

    // Verify user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Delete all news records for the user (cascades to claims and sentence_analysis)
    const deleteQuery = 'DELETE FROM news WHERE user_id = ?';
    const [result] = await pool.execute(deleteQuery, [userId]);

    res.json({
      message: 'History cleared successfully.',
      deleted_count: result.affectedRows,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // Verify article exists and belongs to user
    const [articles] = await pool.execute(
      'SELECT id FROM news WHERE id = ? AND user_id = ?',
      [articleId, userId]
    );

    if (articles.length === 0) {
      const error = new Error('Article not found or you do not have permission to delete it.');
      error.statusCode = 404;
      throw error;
    }

    // Delete the article (cascades to claims and sentence_analysis)
    const deleteQuery = 'DELETE FROM news WHERE id = ? AND user_id = ?';
    const [result] = await pool.execute(deleteQuery, [articleId, userId]);

    res.json({
      message: 'Article deleted successfully.',
      deleted_id: articleId,
    });
  } catch (error) {
    next(error);
  }
}

