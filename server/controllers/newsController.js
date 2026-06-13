import { ObjectId, getCollection } from '../config/db.js';
import { analyzeNews } from '../services/aiService.js';
import {
  validateAndNormalizeUrl,
  assertNotPrivateHost,
  fetchHtml,
  extractArticleText,
} from '../services/urlExtractService.js';
import { checkMultipleClaims, analyzeCredibility } from '../services/factCheckService.js';

function toObjectId(id, label = 'id') {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} is invalid.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

async function getCollections() {
  return {
    users: await getCollection('users'),
    news: await getCollection('news'),
    claims: await getCollection('claims'),
    sentenceAnalysis: await getCollection('sentence_analysis'),
  };
}

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
    validateText(text);

    const userId = req.user.userId;
    const userObjectId = toObjectId(userId, 'userId');
    const { users, news } = await getCollections();

    const user = await users.findOne({ _id: userObjectId });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

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

    const newsDoc = {
      userId: userObjectId,
      content: text,
      sourceUrl: null,
      overallResult: overall_result,
      overallConfidence: overall_confidence,
      biasType,
      biasScore,
      emotionalTone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newsResult = await news.insertOne(newsDoc);
    const newsId = newsResult.insertedId;

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
      news_id: newsId.toString(),
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
  const { claims: claimsCollection, sentenceAnalysis } = await getCollections();

  if (Array.isArray(claims) && claims.length > 0) {
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

      await claimsCollection.insertOne({
        newsId,
        claimText,
        explanation,
        verdict,
        confidence: claimConfidence,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  if (Array.isArray(sentence_analysis) && sentence_analysis.length > 0) {
    for (const item of sentence_analysis) {
      const sentenceText =
        typeof item.sentence_text === 'string' ? item.sentence_text : '';
      const riskLevel =
        typeof item.risk_level === 'string' ? item.risk_level : null;

      if (!sentenceText || !riskLevel) continue;

      await sentenceAnalysis.insertOne({
        newsId,
        sentenceText,
        riskLevel,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export async function predictNewsFromUrl(req, res, next) {
  try {
    const { url } = req.body;
    const userId = req.user.userId;
    const userObjectId = toObjectId(userId, 'userId');
    const { users, news } = await getCollections();

    const user = await users.findOne({ _id: userObjectId });
    if (!user) {
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

    const newsDoc = {
      userId: userObjectId,
      content: extractedText,
      sourceUrl: normalizedUrl,
      overallResult: overall_result,
      overallConfidence: overall_confidence,
      biasType,
      biasScore,
      emotionalTone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newsResult = await news.insertOne(newsDoc);
    const newsId = newsResult.insertedId;

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
      news_id: newsId.toString(),
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
    const userObjectId = toObjectId(req.user.userId, 'userId');
    const { news } = await getCollections();

    const rows = await news
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(rows.map((row) => ({
      id: row._id.toString(),
      text: row.content,
      content: row.content,
      source_url: row.sourceUrl,
      result: row.overallResult,
      confidence: row.overallConfidence,
      bias_type: row.biasType,
      bias_score: row.biasScore,
      emotional_tone: row.emotionalTone,
      created_at: row.createdAt,
    })));
  } catch (error) {
    next(error);
  }
}

export async function getArticleWithClaims(req, res, next) {
  try {
    const { articleId } = req.params;
    const userObjectId = toObjectId(req.user.userId, 'userId');
    const newsObjectId = toObjectId(articleId, 'articleId');
    const { news, claims, sentenceAnalysis } = await getCollections();

    const article = await news.findOne({ _id: newsObjectId, userId: userObjectId });

    if (!article) {
      const error = new Error('Article not found.');
      error.statusCode = 404;
      throw error;
    }

    const claimRows = await claims.find({ newsId: newsObjectId }).sort({ createdAt: 1 }).toArray();
    const sentenceRows = await sentenceAnalysis.find({ newsId: newsObjectId }).sort({ createdAt: 1 }).toArray();

    res.json({
      id: article._id.toString(),
      content: article.content,
      text: article.content,
      source_url: article.sourceUrl,
      result: article.overallResult,
      confidence: article.overallConfidence,
      bias_type: article.biasType,
      bias_score: article.biasScore,
      emotional_tone: article.emotionalTone,
      created_at: article.createdAt,
      claims: claimRows.map((claim) => ({
        claim_text: claim.claimText,
        explanation: claim.explanation,
        verdict: claim.verdict,
        confidence: claim.confidence,
      })),
      sentence_analysis: sentenceRows.map((sentence) => ({
        sentence_text: sentence.sentenceText,
        risk_level: sentence.riskLevel,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const userObjectId = toObjectId(req.user.userId, 'userId');
    const { news } = await getCollections();

    const totalArticles = await news.countDocuments({ userId: userObjectId });
    const fakeCount = await news.countDocuments({ userId: userObjectId, overallResult: 'Fake' });
    const realCount = await news.countDocuments({ userId: userObjectId, overallResult: 'Real' });
    const urlBasedCount = await news.countDocuments({ userId: userObjectId, sourceUrl: { $ne: null } });

    const biasAggregation = await news.aggregate([
      { $match: { userId: userObjectId, biasType: { $ne: null } } },
      { $group: { _id: '$biasType', count: { $sum: 1 } } },
    ]).toArray();

    const biasDistribution = {
      'Left-Leaning': 0,
      'Right-Leaning': 0,
      Neutral: 0,
    };

    for (const row of biasAggregation) {
      if (row._id && biasDistribution[row._id] !== undefined) {
        biasDistribution[row._id] = row.count;
      }
    }

    const trendRows = await news.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    const dailyTrend = trendRows.map((row) => ({
      date: row._id,
      count: row.count,
    }));

    res.json({
      total_articles: totalArticles,
      fake_count: fakeCount,
      real_count: realCount,
      url_based_count: urlBasedCount,
      bias_distribution: biasDistribution,
      daily_trend: dailyTrend,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(req, res, next) {
  try {
    const userObjectId = toObjectId(req.user.userId, 'userId');
    const { news, claims, sentenceAnalysis } = await getCollections();

    const newsIds = await news.find({ userId: userObjectId }).project({ _id: 1 }).toArray();
    const newsObjectIds = newsIds.map((row) => row._id);

    if (newsObjectIds.length === 0) {
      res.json({ message: 'History cleared successfully.', deleted_count: 0 });
      return;
    }

    await Promise.all([
      claims.deleteMany({ newsId: { $in: newsObjectIds } }),
      sentenceAnalysis.deleteMany({ newsId: { $in: newsObjectIds } }),
      news.deleteMany({ userId: userObjectId }),
    ]);

    res.json({
      message: 'History cleared successfully.',
      deleted_count: newsObjectIds.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const { articleId } = req.params;
    const userObjectId = toObjectId(req.user.userId, 'userId');
    const newsObjectId = toObjectId(articleId, 'articleId');
    const { news, claims, sentenceAnalysis } = await getCollections();

    const article = await news.findOne({ _id: newsObjectId, userId: userObjectId });

    if (!article) {
      const error = new Error('Article not found.');
      error.statusCode = 404;
      throw error;
    }

    await Promise.all([
      claims.deleteMany({ newsId: newsObjectId }),
      sentenceAnalysis.deleteMany({ newsId: newsObjectId }),
      news.deleteOne({ _id: newsObjectId, userId: userObjectId }),
    ]);

    res.json({
      message: 'Article deleted successfully.',
      deleted_id: articleId,
    });
  } catch (error) {
    next(error);
  }
}

