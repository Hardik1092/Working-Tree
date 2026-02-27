const axios = require('axios');
const { getRedis } = require('../config/redis');
const logger = require('../config/logger');
const { getNewsConfig } = require('../modules/news/news.config');

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

const inMemoryCache = new Map();
const pendingRequests = new Map();

function setMemoryCache(key, value, ttlSeconds) {
  inMemoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getMemoryCache(key) {
  const entry = inMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function buildCacheKey(kind, params) {
  const base = `news:${kind}`;
  if (!params) return base;
  const safe = Object.keys(params)
    .sort()
    .map((k) => `${k}=${String(params[k]).slice(0, 100)}`)
    .join('&');
  return safe ? `${base}:${safe}` : base;
}

function normalizeArticles(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      title: item.title || 'No title',
      description: item.description || item.content || null,
      url: item.url || item.link || null,
      image:
        item.image ||
        item.image_url ||
        item.urlToImage ||
        null,
      source:
        (item.source && (item.source.name || item.source.id)) ||
        item.source_id ||
        item.publisher ||
        null,
      publishedAt:
        item.publishedAt ||
        item.published_at ||
        item.pubDate ||
        item.date ||
        null,
    }))
    .filter((a) => a.title && a.url);
}

function normalizeError(err) {
  if (err.code === 'ECONNABORTED') {
    return {
      success: false,
      statusCode: 504,
      message: 'News service timeout',
      errorCode: 'TIMEOUT',
    };
  }

  if (err.response) {
    const { status } = err.response;
    if (status === 401 || status === 403) {
      return {
        success: false,
        statusCode: 502,
        message: 'News service authentication failed',
        errorCode: 'AUTH_FAILED',
      };
    }
    if (status === 429) {
      return {
        success: false,
        statusCode: 429,
        message: 'News service rate limit exceeded',
        errorCode: 'RATE_LIMIT',
      };
    }
    if (status >= 400 && status < 500) {
      return {
        success: false,
        statusCode: 502,
        message: 'News service request rejected',
        errorCode: 'UPSTREAM_4XX',
      };
    }
    if (status >= 500) {
      return {
        success: false,
        statusCode: 503,
        message: 'News service temporarily unavailable',
        errorCode: 'UPSTREAM_5XX',
      };
    }
  }

  if (err.request) {
    return {
      success: false,
      statusCode: 503,
      message: 'News service unreachable',
      errorCode: 'NETWORK_ERROR',
    };
  }

  return {
    success: false,
    statusCode: 500,
    message: 'Unexpected news service error',
    errorCode: 'UNKNOWN',
  };
}

async function getClient() {
  const { baseURL, apiKey, timeoutMs } = getNewsConfig();

  const url = new URL(baseURL);
  if (url.protocol !== 'https:') {
    throw new Error('NEWS_API_BASE_URL must use https');
  }

  return axios.create({
    baseURL: url.origin + url.pathname,
    timeout: timeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

async function fetchNews(kind, params = {}, cacheKey, cacheTtlSeconds = CACHE_TTL_SECONDS) {
  const redis = getRedis();

  if (cacheKey) {
    if (redis) {
      try {
        const hit = await redis.get(cacheKey);
        if (hit) {
          const parsed = JSON.parse(hit);
          return parsed;
        }
      } catch (err) {
        logger.warn('[news.service] Redis get failed', err.message);
      }
    }

    const memHit = getMemoryCache(cacheKey);
    if (memHit) return memHit;
  }

  if (cacheKey && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const exec = (async () => {
    try {
      const client = await getClient();
      const query = {
        language: 'en',
        ...params,
      };

      const response = await client.get('', { params: query });
      const body = response.data || {};
      const rawArticles = body.articles || body.data || body.results || [];
      const normalized = normalizeArticles(rawArticles);
      const totalItems = Number(body.totalResults || body.total || normalized.length || 0);
      const page = Number(body.page || query.page || 1);
      const limit = Number(body.pageSize || body.limit || query.limit || normalized.length || 20);

      const payload = {
        success: true,
        statusCode: 200,
        data: normalized,
        totalItems,
        page,
        limit,
      };

      if (cacheKey && normalized.length) {
        const serialized = JSON.stringify(payload);
        if (redis) {
          try {
            await redis.setEx(cacheKey, cacheTtlSeconds, serialized);
          } catch (err) {
            logger.warn('[news.service] Redis set failed', err.message);
          }
        }
        setMemoryCache(cacheKey, payload, cacheTtlSeconds);
      }

      return payload;
    } catch (err) {
      const normalizedError = normalizeError(err);
      logger.warn('[news.service] fetchNews error', {
        code: normalizedError.errorCode,
        statusCode: normalizedError.statusCode,
        message: normalizedError.message,
      });
      return normalizedError;
    } finally {
      if (cacheKey) pendingRequests.delete(cacheKey);
    }
  })();

  if (cacheKey) pendingRequests.set(cacheKey, exec);

  return exec;
}

async function getAgricultureNews(options = {}) {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 20);
  const cacheKey = buildCacheKey('agriculture', { page, limit });

  return fetchNews(
    'agriculture',
    {
      q: 'agriculture OR farming OR crops OR irrigation OR rural development',
      page,
      page_size: limit,
    },
    cacheKey,
    CACHE_TTL_SECONDS,
  );
}

async function getTrendingNews(options = {}) {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 20);
  const cacheKey = buildCacheKey('trending', { page, limit });

  return fetchNews(
    'trending',
    {
      q: options.q || 'agriculture OR farming OR crops',
      page,
      page_size: limit,
    },
    cacheKey,
    CACHE_TTL_SECONDS,
  );
}

async function getNewsByCategory(category, options = {}) {
  const safeCategory = String(category || '').toLowerCase().trim();
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 20);
  const cacheKey = buildCacheKey('category', { category: safeCategory, page, limit });

  return fetchNews(
    'category',
    {
      q: safeCategory || 'agriculture',
      page,
      page_size: limit,
    },
    cacheKey,
    CACHE_TTL_SECONDS,
  );
}

async function searchNews(query, options = {}) {
  const q = String(query || '').trim();
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 20);
  const cacheKey = q ? buildCacheKey('search', { q, page, limit }) : null;

  return fetchNews(
    'search',
    {
      q: q || 'agriculture',
      page,
      page_size: limit,
    },
    cacheKey,
    CACHE_TTL_SECONDS,
  );
}

module.exports = {
  getAgricultureNews,
  getTrendingNews,
  getNewsByCategory,
  searchNews,
  normalizeArticles,
  normalizeError,
};
