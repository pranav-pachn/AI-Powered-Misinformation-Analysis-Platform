const GOOGLE_FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY;
const FACT_CHECK_TIMEOUT = 5000; // 5 seconds timeout

/**
 * Search for fact-check claims related to a statement
 * Uses Google Fact Check API (free tier up to 100 requests/day)
 */
export async function searchFactChecks(query) {
  // Skip if no API key provided
  if (!GOOGLE_FACT_CHECK_API_KEY) {
    return {};
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FACT_CHECK_TIMEOUT);
    let claims = [];

    try {
      const params = new URLSearchParams({
        query: query.substring(0, 255), // API limit is 255 chars
        languageCode: 'en-US',
        key: GOOGLE_FACT_CHECK_API_KEY,
      });

      const response = await fetch(
        `https://factchecktools.googleapis.com/v1alpha1/claims:search?${params.toString()}`,
        {
          method: 'GET',
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Fact-check API request failed with status ${response.status}`);
      }

      const data = await response.json();
      claims = data.claims || [];
    } finally {
      clearTimeout(timeout);
    }
    
    if (claims.length === 0) {
      return {
        found: false,
        claims: [],
      };
    }

    // Extract relevant fact-check data
    const factChecks = claims.slice(0, 3).map((claim) => ({
      claimReview: claim.claimReview?.[0]?.textualRating || claim.claimReview?.[0]?.rating || 'UNKNOWN',
      reviewer: claim.claimReview?.[0]?.reviewer?.name || 'Unknown',
      url: claim.claimReview?.[0]?.url || '',
      publishedDate: claim.claimReview?.[0]?.publishDate || '',
    }));

    return {
      found: true,
      claims: factChecks,
    };
  } catch (error) {
    // Log but don't fail - fact-check is supplementary
    if (error.name !== 'AbortError') {
      console.warn('Fact-check API error:', error.message);
    }
    return {
      found: false,
      claims: [],
      error: error.message,
    };
  }
}

/**
 * Check multiple claims and aggregate results
 */
export async function checkMultipleClaims(claims) {
  if (!Array.isArray(claims) || claims.length === 0) {
    return [];
  }

  // Limit to 5 claims to avoid rate limiting
  const claimsToCheck = claims.slice(0, 5);
  
  try {
    const results = await Promise.allSettled(
      claimsToCheck.map(async (claim) => {
        const claimText = typeof claim === 'string' ? claim : claim.claim_text || claim.claim;
        if (!claimText) return null;

        const factCheck = await searchFactChecks(claimText);
        return {
          claim: claimText,
          factCheck,
        };
      })
    );

    return results
      .filter((result) => result.status === 'fulfilled' && result.value !== null)
      .map((result) => result.value);
  } catch (error) {
    console.warn('Error checking multiple claims:', error.message);
    return [];
  }
}

/**
 * Analyze credibility based on fact-check data
 */
export function analyzeCredibility(factCheckResults) {
  if (!Array.isArray(factCheckResults) || factCheckResults.length === 0) {
    return {
      credibilityScore: 0.5, // Neutral
      warning: null,
    };
  }

  let falseCount = 0;
  let misledCount = 0;
  let trueCount = 0;

  for (const result of factCheckResults) {
    if (!result.factCheck?.found) continue;

    for (const claim of result.factCheck.claims) {
      const rating = claim.claimReview?.toLowerCase() || '';
      
      if (rating.includes('false') || rating.includes('incorrect')) {
        falseCount++;
      } else if (rating.includes('misleading') || rating.includes('partial')) {
        misledCount++;
      } else if (rating.includes('true') || rating.includes('correct')) {
        trueCount++;
      }
    }
  }

  const totalChecked = falseCount + misledCount + trueCount;
  
  if (totalChecked === 0) {
    return {
      credibilityScore: 0.5,
      warning: null,
    };
  }

  // Calculate credibility score (0-1)
  const credibilityScore = (trueCount - misledCount - falseCount) / totalChecked;
  
  let warning = null;
  if (falseCount > 0) {
    warning = `⚠️ ALERT: ${falseCount} claim(s) fact-checked as FALSE`;
  } else if (misledCount > trueCount) {
    warning = `⚠️ WARNING: Multiple claims marked as MISLEADING`;
  }

  return {
    credibilityScore: Math.max(-1, Math.min(1, credibilityScore)), // Clamp -1 to 1
    warning,
    stats: {
      trueCount,
      misledCount,
      falseCount,
      totalChecked,
    },
  };
}
