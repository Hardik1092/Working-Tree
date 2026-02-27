const newsService = require('../../services/news.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../config/logger');

function buildSuccess(res, result, defaultMessage) {
  const items = Array.isArray(result.data) ? result.data : [];
  const totalItems = typeof result.totalItems === 'number' ? result.totalItems : items.length;
  const page = result.page || 1;
  const limit = result.limit || items.length || 20;

  return res.status(200).json(
    new ApiResponse(200, items, defaultMessage, {
      totalItems,
      page,
      limit,
    }),
  );
}

function buildFailure(res, result) {
  const statusCode = result.statusCode || 502;
  const message = result.message || 'Unable to load news. Please try again later.';
  const payload = new ApiResponse(statusCode, [], message);
  return res.status(statusCode).json(payload);
}

const getAgricultureNews = asyncHandler(async (req, res) => {
  try {
    const result = await newsService.getAgricultureNews(req.query);
    if (!result || typeof result !== 'object') {
      return buildFailure(res, { statusCode: 502, message: 'News service temporarily unavailable' });
    }
    if (!result.success) {
      return buildFailure(res, result);
    }
    return buildSuccess(res, result, 'Agriculture news');
  } catch (err) {
    logger.error('[news.controller] getAgricultureNews error:', err?.message || err);
    return buildFailure(res, { statusCode: 500, message: 'Unable to load news. Please try again later.' });
  }
});

const getTrendingNews = asyncHandler(async (req, res) => {
  try {
    const result = await newsService.getTrendingNews(req.query);
    if (!result || typeof result !== 'object') {
      return buildFailure(res, { statusCode: 502, message: 'News service temporarily unavailable' });
    }
    if (!result.success) {
      return buildFailure(res, result);
    }
    return buildSuccess(res, result, 'Trending news');
  } catch (err) {
    logger.error('[news.controller] getTrendingNews error:', err?.message || err);
    return buildFailure(res, { statusCode: 500, message: 'Unable to load news. Please try again later.' });
  }
});

const getNewsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  try {
    const result = await newsService.getNewsByCategory(category, req.query);
    if (!result || typeof result !== 'object') {
      return buildFailure(res, { statusCode: 502, message: 'News service temporarily unavailable' });
    }
    if (!result.success) {
      return buildFailure(res, result);
    }
    return buildSuccess(res, result, 'Category news');
  } catch (err) {
    logger.error('[news.controller] getNewsByCategory error:', err?.message || err);
    return buildFailure(res, { statusCode: 500, message: 'Unable to load news. Please try again later.' });
  }
});

const searchNews = asyncHandler(async (req, res) => {
  const { q } = req.query;
  try {
    const result = await newsService.searchNews(q, req.query);
    if (!result || typeof result !== 'object') {
      return buildFailure(res, { statusCode: 502, message: 'News service temporarily unavailable' });
    }
    if (!result.success) {
      return buildFailure(res, result);
    }
    return buildSuccess(res, result, 'News search results');
  } catch (err) {
    logger.error('[news.controller] searchNews error:', err?.message || err);
    return buildFailure(res, { statusCode: 500, message: 'Unable to load news. Please try again later.' });
  }
});

module.exports = {
  getAgricultureNews,
  getTrendingNews,
  getNewsByCategory,
  searchNews,
};
