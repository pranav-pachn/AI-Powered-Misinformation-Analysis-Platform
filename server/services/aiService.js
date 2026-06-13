import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const BACKOFF_MULTIPLIER = 2;

function getCurrentDateContext() {
  const now = new Date();
  return `${now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} at ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })} UTC`;
}

const systemPrompt = `You are a professional AI fact-checker and media analysis engine with real-time context awareness.

**IMPORTANT - Current Date and Time: ${getCurrentDateContext()}**

Your tasks for each article:
1. Determine whether the article is Fake or Real based on factual consistency and credibility signals.
2. Estimate an overall confidence score from 0 to 100.
3. Detect propaganda patterns (e.g., one-sided framing, scapegoating, repetition, loaded language).
4. Detect emotional manipulation and classify the dominant emotional tone
   (Fear / Anger / Neutral / Optimistic or similar).
5. Classify political/ideological bias:
   - Left-Leaning
   - Right-Leaning
   - Neutral
6. Provide a bias intensity score between 0 and 1 (0 = no bias, 1 = extremely biased).
7. Extract 3-5 factual claims with verdicts and confidence scores.
8. Perform sentence-level risk analysis across the article, classifying each notable sentence as:
   - SAFE
   - MISLEADING
   - HIGH_RISK
9. Detect propaganda patterns and emotional manipulation cues when risk is MISLEADING or HIGH_RISK.

CRITICAL CONTEXT GUIDELINES:
- **Recent Events**: If the article discusses events from today, yesterday, or the past week, analyze the STRUCTURE and LANGUAGE PATTERNS rather than relying solely on knowledge cutoff limitations.
- **Plausibility**: Assess whether events described are logically plausible given context, even if you lack specific details.
- **News Indicators**: Look for proper journalistic structure, attributed sources, and logical progression of events as indicators of authenticity.
- **Red Flags**: Focus on detecting sensationalism, false attributions, internal contradictions, and propaganda markers regardless of recency.

IMPORTANT NOTES:
- The input text may be extracted from web pages and could contain formatting artifacts.
- Focus ONLY on the main article content; ignore advertisements, navigation elements, or boilerplate text.
- Discard sentences that are clearly metadata, timestamps, author info, or non-article content.
- Extract only substantive factual claims from the actual article body.
- Base analysis on the core narrative and factual assertions present in the text.

You MUST respond with STRICT, VALID JSON ONLY in this exact structure (no comments, no extra text):
{
  "overall_result": "Fake" or "Real",
  "overall_confidence": number between 0 and 100,
  "explanation": "short natural-language explanation of the decision",
  "bias": {
    "type": "Left-Leaning" or "Right-Leaning" or "Neutral",
    "score": number between 0 and 1,
    "emotional_tone": "Fear" or "Anger" or "Neutral" or "Optimistic" or similar single-word label
  },
  "claims": [
    {
      "claim_text": "Claim text here",
      "verdict": "True" or "False" or "Misleading",
      "confidence": number between 0 and 100,
      "explanation": "short rationale for the verdict"
    }
  ],
  "sentence_analysis": [
    {
      "sentence_text": "Sentence from the article",
      "risk_level": "SAFE" or "MISLEADING" or "HIGH_RISK"
    }
  ]
}`;

function parseApiKeys(...values) {
  return values
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

const openRouterApiKeys = parseApiKeys(
  process.env.OPENROUTER_API_KEYS,
  process.env.OPENROUTER_API_KEY
);
const groqApiKeys = parseApiKeys(process.env.GROQ_API_KEYS, process.env.GROQ_API_KEY);
const geminiApiKeys = parseApiKeys(
  process.env.GEMINI_API_KEYS,
  process.env.GEMINI_API_KEY,
  process.env.GOOGLE_API_KEY
);

const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const openRouterFallbackModel =
  process.env.OPENROUTER_FALLBACK_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const groqFallbackModel = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-120b';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiFallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-pro';

const openRouterSiteUrl = process.env.OPENROUTER_SITE_URL || process.env.CLIENT_URL || 'http://localhost:5173';
const openRouterAppName = process.env.OPENROUTER_APP_NAME || 'Fake News Detection';

let geminiModelInstances = [];

function ensureGeminiModelInstances() {
  if (geminiModelInstances.length > 0) {
    return geminiModelInstances;
  }

  if (geminiApiKeys.length === 0) {
    return [];
  }

  geminiModelInstances = geminiApiKeys.map((apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return {
      primary: genAI.getGenerativeModel({
        model: geminiModel,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.2 },
      }),
      fallback: genAI.getGenerativeModel({
        model: geminiFallbackModel,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.2 },
      }),
    };
  });

  console.log(`Loaded ${geminiModelInstances.length} Gemini API key(s)`);
  return geminiModelInstances;
}

function createUnavailableAiError() {
  const error = new Error(
    'AI analysis is not configured. Set OPENROUTER_API_KEY or GROQ_API_KEY in server/.env. Gemini keys are also supported as a legacy fallback.'
  );
  error.statusCode = 503;
  return error;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff(apiCall, operationName = 'API call') {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await apiCall();
    } catch (err) {
      const isServiceUnavailable = err.status === 503 || err.status >= 500;
      const isRateLimit = err.status === 429;

      if ((isServiceUnavailable || isRateLimit) && attempt < MAX_RETRIES) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
        console.warn(
          `${operationName} - Attempt ${attempt} failed (${err.status || 'unknown'}). Retrying in ${delayMs}ms...`
        );
        await sleep(delayMs);
        continue;
      }

      throw err;
    }
  }
}

function createHttpError(status, message, payload) {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  error.payload = payload;
  return error;
}

async function parseErrorResponse(response) {
  const rawText = await response.text();

  try {
    const payload = JSON.parse(rawText);
    const message =
      payload?.error?.message ||
      payload?.message ||
      payload?.detail ||
      `Request failed with status ${response.status}`;
    return createHttpError(response.status, message, payload);
  } catch {
    return createHttpError(
      response.status,
      rawText || `Request failed with status ${response.status}`,
      null
    );
  }
}

function extractChatContent(payload) {
  if (typeof payload?.choices?.[0]?.message?.content === 'string') {
    return payload.choices[0].message.content;
  }

  if (Array.isArray(payload?.choices?.[0]?.message?.content)) {
    return payload.choices[0].message.content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('');
  }

  if (typeof payload?.choices?.[0]?.text === 'string') {
    return payload.choices[0].text;
  }

  return '';
}

async function callOpenRouterChat(apiKey, model, userPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': openRouterSiteUrl,
      'X-Title': openRouterAppName,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 2200,
    }),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

async function callGroqChat(apiKey, model, userPrompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 2200,
    }),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

function shouldTryNextKey(err) {
  return err.status === 401 || err.status === 402 || err.status === 403 || err.status === 429 || err.status >= 500;
}

function shouldTryFallbackModel(err) {
  return (
    err.status === 404 ||
    err.status === 429 ||
    err.status === 502 ||
    err.status === 503 ||
    err.status >= 500
  );
}

async function callProviderWithRotation({
  providerName,
  apiKeys,
  primaryModel,
  fallbackModel,
  callPrimary,
  callFallback,
}) {
  if (apiKeys.length === 0) {
    return null;
  }

  let lastError = null;

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];

    try {
      console.log(
        `Analyze News - Using ${providerName} key ${keyIndex + 1}/${apiKeys.length} with model ${primaryModel}`
      );

      return await retryWithBackoff(
        () => callPrimary(apiKey),
        `Analyze News (${providerName} primary)`
      );
    } catch (primaryErr) {
      lastError = primaryErr;

      if (fallbackModel && shouldTryFallbackModel(primaryErr)) {
        try {
          console.warn(
            `Analyze News - ${providerName} primary model failed (${primaryErr.status || 'unknown'}), trying fallback model ${fallbackModel}`
          );

          return await retryWithBackoff(
            () => callFallback(apiKey),
            `Analyze News (${providerName} fallback)`
          );
        } catch (fallbackErr) {
          lastError = fallbackErr;
        }
      }

      if (shouldTryNextKey(lastError) && keyIndex < apiKeys.length - 1) {
        console.warn(
          `Analyze News - ${providerName} key ${keyIndex + 1} failed (${lastError.status || 'unknown'}), trying next key...`
        );
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error(`${providerName} request failed.`);
}

async function callGeminiWithRotation(userPrompt, usePrimary = true) {
  const instances = ensureGeminiModelInstances();

  if (instances.length === 0) {
    return null;
  }

  let lastError = null;

  for (let keyIndex = 0; keyIndex < instances.length; keyIndex++) {
    const model = usePrimary ? instances[keyIndex].primary : instances[keyIndex].fallback;
    const modelLabel = usePrimary ? geminiModel : geminiFallbackModel;

    try {
      console.log(
        `Analyze News - Using Gemini key ${keyIndex + 1}/${instances.length} with model ${modelLabel}`
      );
      return await retryWithBackoff(
        () => model.generateContent(userPrompt),
        `Analyze News (Gemini ${usePrimary ? 'primary' : 'fallback'})`
      );
    } catch (err) {
      lastError = err;
      if (shouldTryNextKey(err) && keyIndex < instances.length - 1) {
        console.warn(
          `Analyze News - Gemini key ${keyIndex + 1} failed (${err.status || 'unknown'}), trying next key...`
        );
        continue;
      }

      throw err;
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeResult(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'fake') return 'Fake';
  if (normalized === 'real') return 'Real';
  return null;
}

function normalizeBiasType(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('left')) return 'Left-Leaning';
  if (normalized.includes('right')) return 'Right-Leaning';
  if (normalized.includes('neutral')) return 'Neutral';
  return null;
}

function validateAnalysisResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('AI response is malformed.');
    error.statusCode = 502;
    throw error;
  }

  const overallResultRaw = payload.overall_result ?? payload.result;
  const overallResult = normalizeResult(overallResultRaw);

  const overallConfidenceRaw =
    typeof payload.overall_confidence !== 'undefined'
      ? payload.overall_confidence
      : payload.confidence;
  const overallConfidence = Number(overallConfidenceRaw);

  const explanation =
    typeof payload.explanation === 'string' ? payload.explanation.trim() : '';

  if (
    !overallResult ||
    Number.isNaN(overallConfidence) ||
    overallConfidence < 0 ||
    overallConfidence > 100
  ) {
    const error = new Error('AI response is missing or has invalid top-level fields.');
    error.statusCode = 502;
    throw error;
  }

  const biasPayload = payload.bias && typeof payload.bias === 'object' ? payload.bias : {};
  const biasType = normalizeBiasType(biasPayload.type);
  const biasScore =
    typeof biasPayload.score === 'number' && !Number.isNaN(biasPayload.score)
      ? Math.min(Math.max(biasPayload.score, 0), 1)
      : null;
  const emotionalTone =
    typeof biasPayload.emotional_tone === 'string'
      ? biasPayload.emotional_tone.trim()
      : null;

  const claims = Array.isArray(payload.claims)
    ? payload.claims
        .map((claim) => {
          const claimText =
            typeof claim?.claim_text === 'string'
              ? claim.claim_text.trim()
              : typeof claim?.claim === 'string'
                ? claim.claim.trim()
                : '';
          const verdict = typeof claim?.verdict === 'string' ? claim.verdict.trim() : '';
          const confidenceRaw = Number(claim?.confidence);
          const confidence = Number.isNaN(confidenceRaw) ? null : Math.round(confidenceRaw);
          const claimExplanation =
            typeof claim?.explanation === 'string' ? claim.explanation.trim() : '';

          if (!claimText || !verdict || confidence === null) return null;

          return {
            claim_text: claimText,
            verdict,
            confidence: Math.min(Math.max(confidence, 0), 100),
            explanation: claimExplanation,
          };
        })
        .filter(Boolean)
    : [];

  const sentenceAnalysis = Array.isArray(payload.sentence_analysis)
    ? payload.sentence_analysis
    : [];

  return {
    overall_result: overallResult,
    overall_confidence: Math.round(overallConfidence),
    explanation,
    bias: {
      type: biasType,
      score: biasScore,
      emotional_tone: emotionalTone,
    },
    claims,
    sentence_analysis: sentenceAnalysis,
  };
}

function normalizeProviderError(err) {
  let errorMessage = err.message || 'Failed to analyze news article. Please try again later.';
  let statusCode = err.statusCode || err.status || 502;

  if (err.status === 429) {
    errorMessage = 'AI provider rate limit reached. Please try again in a few minutes or add additional API keys.';
    statusCode = 429;
  }

  if (
    err.status === 404 &&
    (
      err.message?.includes('not found for API version') ||
      err.message?.toLowerCase().includes('model')
    )
  ) {
    errorMessage =
      'The configured AI model is not supported by the current provider. Update OPENROUTER_MODEL or GROQ_MODEL to a supported model.';
    statusCode = 502;
  }

  const error = new Error(errorMessage);
  error.statusCode = statusCode;
  return error;
}

export async function analyzeNews(text) {
  const hasAiProvider =
    openRouterApiKeys.length > 0 || groqApiKeys.length > 0 || geminiApiKeys.length > 0;

  if (!hasAiProvider) {
    throw createUnavailableAiError();
  }

  const userPrompt = `Article to analyze:\n\n${text}`;

  try {
    let content = '';

    try {
      const openRouterResponse = await callProviderWithRotation({
        providerName: 'OpenRouter',
        apiKeys: openRouterApiKeys,
        primaryModel: openRouterModel,
        fallbackModel: openRouterFallbackModel,
        callPrimary: (apiKey) => callOpenRouterChat(apiKey, openRouterModel, userPrompt),
        callFallback: (apiKey) => callOpenRouterChat(apiKey, openRouterFallbackModel, userPrompt),
      });

      if (openRouterResponse) {
        content = extractChatContent(openRouterResponse);
      }
    } catch (openRouterErr) {
      console.warn('OpenRouter analyzeNews failed, falling back:', openRouterErr.message);

      try {
        const groqResponse = await callProviderWithRotation({
          providerName: 'Groq',
          apiKeys: groqApiKeys,
          primaryModel: groqModel,
          fallbackModel: groqFallbackModel,
          callPrimary: (apiKey) => callGroqChat(apiKey, groqModel, userPrompt),
          callFallback: (apiKey) => callGroqChat(apiKey, groqFallbackModel, userPrompt),
        });

        if (groqResponse) {
          content = extractChatContent(groqResponse);
        }
      } catch (groqErr) {
        console.warn('Groq analyzeNews failed, falling back:', groqErr.message);

        try {
          const geminiPrimary = await callGeminiWithRotation(userPrompt, true);
          if (geminiPrimary) {
            content = geminiPrimary?.response?.text?.() || '';
          }
        } catch (geminiPrimaryErr) {
          const canTryGeminiFallback =
            geminiPrimaryErr.status === 404 ||
            geminiPrimaryErr.status === 429 ||
            geminiPrimaryErr.status === 503 ||
            geminiPrimaryErr.message?.includes('Service Unavailable');

          if (canTryGeminiFallback) {
            const geminiFallback = await callGeminiWithRotation(userPrompt, false);
            content = geminiFallback?.response?.text?.() || '';
          } else {
            throw geminiPrimaryErr;
          }
        }
      }
    }

    const json = extractJson(content);
    const validated = validateAnalysisResponse(json);
    return validated;
  } catch (err) {
    console.error('AI analyzeNews error:', err);
    throw normalizeProviderError(err);
  }
}
