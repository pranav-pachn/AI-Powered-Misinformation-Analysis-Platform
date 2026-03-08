import dns from 'dns/promises';
import { URL } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const MAX_HTML_BYTES = 4 * 1024 * 1024; // 4 MB
const MIN_TEXT_LENGTH = 200;
const FETCH_TIMEOUT_MS = 10000;

function isPrivateIp(ip) {
  if (!ip) return false;

  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('172.')) {
    const second = Number(ip.split('.')[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('127.')) return true;
  if (ip === '0.0.0.0') return true;

  // basic IPv6 locals
  if (ip === '::1') return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;

  return false;
}

export function validateAndNormalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    const error = new Error('URL is required for analysis.');
    error.statusCode = 400;
    throw error;
  }

  let urlObj;
  try {
    urlObj = new URL(rawUrl.trim());
  } catch {
    const error = new Error('Please provide a valid URL (including http/https).');
    error.statusCode = 400;
    throw error;
  }

  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    const error = new Error('Only http and https URLs are supported.');
    error.statusCode = 400;
    throw error;
  }

  const hostname = urlObj.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1'
  ) {
    const error = new Error('Localhost URLs are not allowed.');
    error.statusCode = 400;
    throw error;
  }

  return urlObj.toString();
}

export async function assertNotPrivateHost(urlString) {
  try {
    const urlObj = new URL(urlString);
    const addresses = await dns.lookup(urlObj.hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        const error = new Error('URLs pointing to private networks are not allowed.');
        error.statusCode = 400;
        throw error;
      }
    }
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }
    // If DNS lookup fails, treat as unreachable rather than internal
    const error = new Error('Unable to resolve the provided URL.');
    error.statusCode = 400;
    throw error;
  }
}

export async function fetchHtml(urlString) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(urlString, {
      redirect: 'follow',
      size: MAX_HTML_BYTES,
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; FakeNewsDetector/1.0; +https://example.com/bot)',
      },
    });

    if (!response.ok) {
      const error = new Error('Failed to fetch URL content.');
      error.statusCode = 400;
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      const error = new Error('The provided URL does not appear to be an HTML page.');
      error.statusCode = 400;
      throw error;
    }

    return await response.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('Fetching the URL took too long. Please try a different page.');
      error.statusCode = 408;
      throw error;
    }

    if (err.statusCode) {
      throw err;
    }

    const error = new Error('Unable to fetch content from the provided URL.');
    error.statusCode = 400;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function extractArticleText(html) {
  const $ = cheerio.load(html);

  $('script, style, nav, footer, header, aside, noscript').remove();

  let text = '';
  const article = $('article');

  if (article.length > 0) {
    text = article.text();
  } else {
    text = $('main').text() || $('body').text();
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized || normalized.length < MIN_TEXT_LENGTH) {
    const error = new Error(
      'Could not extract a meaningful article from this URL. Try pasting the text instead.',
    );
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

