const Joi = require('joi');
const ApiError = require('../../utils/ApiError');

const paginationSchema = {
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
};

const listSchema = Joi.object({
  ...paginationSchema,
});

const searchSchema = Joi.object({
  q: Joi.string().trim().min(2).max(200).required(),
  ...paginationSchema,
});

const categoryParamsSchema = Joi.object({
  category: Joi.string().trim().min(2).max(50).regex(/^[a-z0-9\-]+$/i)
    .required(),
});

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const msg = error.details.map((d) => d.message).join('; ') || 'Validation failed';
      throw new ApiError(400, msg);
    }
    req.query = value;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const msg = error.details.map((d) => d.message).join('; ') || 'Validation failed';
      throw new ApiError(400, msg);
    }
    req.params = value;
    next();
  };
}

module.exports = {
  listSchema,
  searchSchema,
  categoryParamsSchema,
  validateQuery,
  validateParams,
};

