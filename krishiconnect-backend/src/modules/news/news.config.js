const Joi = require('joi');

let cachedConfig = null;

const schema = Joi.object({
  NEWS_API_BASE_URL: Joi.string().uri({ scheme: ['https'] }).required(),
  NEWS_API_KEY: Joi.string().min(10).required(),
  NEWS_API_TIMEOUT: Joi.number().integer().min(1000).max(30000).default(5000),
}).unknown(true);

function validateNewsEnv() {
  if (cachedConfig) return cachedConfig;

  const { value, error } = schema.validate(process.env);
  if (error) {
    throw new Error(`News API environment invalid: ${error.message}`);
  }

  cachedConfig = {
    baseURL: value.NEWS_API_BASE_URL.replace(/\/$/, ''),
    apiKey: value.NEWS_API_KEY,
    timeoutMs: Number(value.NEWS_API_TIMEOUT || 5000),
  };

  return cachedConfig;
}

function getNewsConfig() {
  if (!cachedConfig) {
    validateNewsEnv();
  }
  return cachedConfig;
}

module.exports = {
  validateNewsEnv,
  getNewsConfig,
};

