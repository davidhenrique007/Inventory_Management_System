const Joi = require('joi');

/**
 * Schema para criação de movimento de entrada
 */
const entryMovementSchema = Joi.object({
  productId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do produto inválido',
      'any.required': 'ID do produto é obrigatório'
    }),
  
  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Quantidade deve ser um número',
      'number.integer': 'Quantidade deve ser um número inteiro',
      'number.positive': 'Quantidade deve ser maior que zero',
      'any.required': 'Quantidade é obrigatória'
    }),
  
  unitPrice: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Preço unitário deve ser um número',
      'number.positive': 'Preço unitário deve ser maior que zero'
    }),
  
  referenceId: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .trim(),
  
  referenceType: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .trim(),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .trim()
});

/**
 * Schema para movimento de saída
 */
const exitMovementSchema = Joi.object({
  productId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do produto inválido',
      'any.required': 'ID do produto é obrigatório'
    }),
  
  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Quantidade deve ser um número',
      'number.integer': 'Quantidade deve ser um número inteiro',
      'number.positive': 'Quantidade deve ser maior que zero',
      'any.required': 'Quantidade é obrigatória'
    }),
  
  unitPrice: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  
  referenceId: Joi.string()
    .max(50)
    .optional()
    .allow('', null),
  
  referenceType: Joi.string()
    .max(50)
    .optional()
    .allow('', null),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
});

/**
 * Schema para ajuste de estoque
 */
const adjustmentMovementSchema = Joi.object({
  productId: Joi.string()
    .uuid()
    .required(),
  
  newStock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Novo estoque deve ser um número',
      'number.integer': 'Novo estoque deve ser um número inteiro',
      'number.min': 'Novo estoque não pode ser negativo',
      'any.required': 'Novo estoque é obrigatório'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
});

/**
 * Schema para histórico por produto
 */
const productHistorySchema = Joi.object({
  productId: Joi.string()
    .uuid()
    .required(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
});

/**
 * Valida entrada de estoque
 */
const validateEntryMovement = (data) => {
  const { error, value } = entryMovementSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    const err = new Error('Erro de validação');
    err.status = 400;
    err.errors = errors;
    throw err;
  }
  
  return value;
};

/**
 * Valida saída de estoque
 */
const validateExitMovement = (data) => {
  const { error, value } = exitMovementSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    const err = new Error('Erro de validação');
    err.status = 400;
    err.errors = errors;
    throw err;
  }
  
  return value;
};

/**
 * Valida ajuste de estoque
 */
const validateAdjustmentMovement = (data) => {
  const { error, value } = adjustmentMovementSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    const err = new Error('Erro de validação');
    err.status = 400;
    err.errors = errors;
    throw err;
  }
  
  return value;
};

/**
 * Valida parâmetros de histórico
 */
const validateProductHistory = (params, query) => {
  const schema = Joi.object({
    productId: Joi.string().uuid().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50)
  });
  
  const { error, value } = schema.validate({ ...params, ...query });
  
  if (error) {
    const err = new Error('Erro de validação');
    err.status = 400;
    err.errors = [{ field: error.details[0].path[0], message: error.details[0].message }];
    throw err;
  }
  
  return value;
};

module.exports = {
  validateEntryMovement,
  validateExitMovement,
  validateAdjustmentMovement,
  validateProductHistory,
  entryMovementSchema,
  exitMovementSchema,
  adjustmentMovementSchema
};