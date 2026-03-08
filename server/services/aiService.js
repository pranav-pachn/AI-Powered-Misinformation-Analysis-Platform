import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000; // 1 second
const BACKOFF_MULTIPLIER = 2; // exponential backoff

// Get current date in readable format for AI context
function getCurrentDateContext() {
  const now = new Date();
  return `${now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })} at ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
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
7. Extract 3–5 factual claims with verdicts and confidence scores.
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

// Load API keys - supports both comma-separated and single key
const apiKeysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;

if (!apiKeysString) {
  throw new Error('GEMINI_API_KEYS or GEMINI_API_KEY is not set.');
}

// Parse API keys (comma-separated)
const apiKeys = apiKeysString.split(',').map(key => key.trim()).filter(key => key.length > 0);

if (apiKeys.length === 0) {
  throw new Error('No valid API keys found.');
}

console.log(`Loaded ${apiKeys.length} Gemini API key(s)`);

// Default to Gemini 1.5 Flash; can be overridden via GEMINI_MODEL
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-pro';

// Create model instances for each API key
const modelInstances = apiKeys.map(apiKey => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return {
    apiKey: apiKey.substring(0, 10) + '...', // For logging purposes
    primary: genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.2 },
    }),
    fallback: genAI.getGenerativeModel({
      model: fallbackModelName,
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.2 },
    }),
  };
});

// Legacy references (use first key)
const model = modelInstances[0].primary;
const fallbackModel = modelInstances[0].fallback;

// Helper function to sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff(apiCall, operationName = 'API call') {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await apiCall();
    } catch (err) {
      const isServiceUnavailable = err.status === 503 || err.message?.includes('Service Unavailable');
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

// Helper to attempt with multiple API keys, rotating when rate limited
async function callAIModelWithRotation(text, operationName = 'API call', usePrimary = true) {
  const exhaustedKeys = new Set();
  
  for (let keyIndex = 0; keyIndex < modelInstances.length; keyIndex++) {
    const modelInstance = modelInstances[keyIndex];
    const modelToUse = usePrimary ? modelInstance.primary : modelInstance.fallback;
    const modelType = usePrimary ? 'primary' : 'fallback';
    
    if (exhaustedKeys.has(keyIndex)) {
      continue;
    }
    
    try {
      console.log(`${operationName} - Using API key ${keyIndex + 1}/${modelInstances.length} (${modelType} model)`);
      
      return await retryWithBackoff(
        () => modelToUse.generateContent(text),
        `${operationName} [Key ${keyIndex + 1}]`
      );
    } catch (err) {
      const isRateLimit = err.status === 429;
      const isServiceUnavailable = err.status === 503 || err.message?.includes('Service Unavailable');
      
      if (isRateLimit) {
        console.warn(`${operationName} - API key ${keyIndex + 1} hit rate limit (429), trying next key...`);
        exhaustedKeys.add(keyIndex);
        
        // Try next key if available
        if (keyIndex < modelInstances.length - 1) {
          continue;
        }
        
        // All keys exhausted
        console.error(`${operationName} - All ${modelInstances.length} API keys exhausted`);
        throw err;
      }
      
      if (isServiceUnavailable) {
        console.warn(`${operationName} - Service unavailable (503) with key ${keyIndex + 1}`);
        exhaustedKeys.add(keyIndex);
        
        // Try next key if available
        if (keyIndex < modelInstances.length - 1) {
          continue;
        }
      }
      
      throw err;
    }
  }
  
  throw new Error('All API keys exhausted or unavailable');
}

// Helper to attempt main model, fallback to secondary model if unavailable
async function callAIModel(primaryModel, fallbackModelFn, text, operationName = 'API call') {
  try {
    return await retryWithBackoff(
      () => primaryModel.generateContent(text),
      `${operationName} (primary model)`
    );
  } catch (primaryErr) {
    const isPrimaryUnavailable = primaryErr.status === 503 || primaryErr.message?.includes('Service Unavailable');

    if (isPrimaryUnavailable) {
      console.warn(`${operationName} - Primary model unavailable, attempting with fallback model...`);
      try {
        return await retryWithBackoff(
          () => fallbackModelFn(),
          `${operationName} (fallback model)`
        );
      } catch (fallbackErr) {
        console.error(`${operationName} - Both primary and fallback models failed:`, fallbackErr);
        throw fallbackErr;
      }
    }

    throw primaryErr;
  }
}

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;

  // Try strict parse first
  try {
    const direct = JSON.parse(text);
    return direct;
  } catch {
    // Fallback: extract first JSON object from content
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

  // Overall result & confidence (support both old and new keys)
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

  // Bias section
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

  // Normalize claims so the frontend can render consistently
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
          const explanation =
            typeof claim?.explanation === 'string' ? claim.explanation.trim() : '';

          if (!claimText || !verdict || confidence === null) return null;

          return {
            claim_text: claimText,
            verdict,
            confidence: Math.min(Math.max(confidence, 0), 100),
            explanation,
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

export async function analyzeNews(text) {
  try {
    const userPrompt = `Article to analyze:\n\n${text}`;

    // Try primary model with key rotation
    let response;
    try {
      response = await callAIModelWithRotation(userPrompt, 'Analyze News', true);
    } catch (primaryErr) {
      const isPrimaryUnavailable = primaryErr.status === 503 || primaryErr.message?.includes('Service Unavailable');
      const allKeysExhausted = primaryErr.message?.includes('All API keys exhausted');
      
      // If primary model fails across all keys (but not rate limited), try fallback model
      if (isPrimaryUnavailable && !allKeysExhausted) {
        console.warn('All primary models unavailable, attempting fallback model with key rotation...');
        response = await callAIModelWithRotation(userPrompt, 'Analyze News (Fallback)', false);
      } else {
        throw primaryErr;
      }
    }

    const content = response?.response?.text?.() || '';
    const json = extractJson(content);
    const validated = validateAnalysisResponse(json);

    return validated;
  } catch (err) {
    console.error('Gemini analyzeNews error:', err);

    // Provide specific error messages based on the error type
    let errorMessage = 'Failed to analyze news article. Please try again later.';
    let statusCode = 502;
    
    if (err.status === 429 || err.message?.includes('All API keys exhausted')) {
      errorMessage = `API rate limit reached. All ${modelInstances.length} API key(s) have been exhausted. Please try again in a few minutes or add more API keys.`;
      statusCode = 429;
    }

    const error = new Error(errorMessage);
    error.statusCode = statusCode;
    throw error;
  }
}
