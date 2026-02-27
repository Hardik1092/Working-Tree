const express = require('express');

const router = express.Router();
const newsController = require('./news.controller');
const { listSchema, searchSchema, categoryParamsSchema, validateQuery, validateParams } = require('./news.validation');
const { newsLimiter } = require('../../middlewares/rateLimit.middleware');

router.get(
  '/agriculture',
  newsLimiter,
  validateQuery(listSchema),
  newsController.getAgricultureNews,
);

router.get(
  '/trending',
  newsLimiter,
  validateQuery(listSchema),
  newsController.getTrendingNews,
);

router.get(
  '/category/:category',
  newsLimiter,
  validateParams(categoryParamsSchema),
  validateQuery(listSchema),
  newsController.getNewsByCategory,
);

router.get(
  '/search',
  newsLimiter,
  validateQuery(searchSchema),
  newsController.searchNews,
);

module.exports = router;
