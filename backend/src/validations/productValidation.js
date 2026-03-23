const Joi = require('joi');
const { validateUUID } = require('../utils/validators');

/**
 * Schema para criação de produto
 */
const createProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .trim()
    .messages({
      'string.empty': 'Nome do produto é obrigatório',
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
  
  code: Joi.string()
    .min(3)
    .max(50)
    .required()
    .uppercase()
    .trim()
    .pattern(/^[A-Z0-9-]+$/)
    .messages({
      'string.empty': 'Código do produto é obrigatório',
      'string.min': 'Código deve ter no mínimo 3 caracteres',
      'string.max': 'Código deve ter no máximo 50 caracteres',
      'string.pattern.base': 'Código deve conter apenas letras, números e hífen'
    }),
  
  barcode: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .trim(),
  
  categoryId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID da categoria inválido',
      'any.required': 'Categoria é obrigatória'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .trim(),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Preço deve ser um número',
      'number.positive': 'Preço deve ser maior que zero',
      'any.required': 'Preço é obrigatório'
    }),
  
  costPrice: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .default(0),
  
  stockQuantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .default(0)
    .messages({
      'number.base': 'Quantidade em estoque deve ser um número',
      'number.min': 'Quantidade em estoque não pode ser negativa'
    }),
  
  minStock: Joi.number()
    .integer()
    .min(0)
    .default(5),
  
  maxStock: Joi.number()
    .integer()
    .min(0)
    .default(100),
  
  location: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .trim(),
  
  isActive: Joi.boolean()
    .default(true)
});

/**
 * Schema para atualização de produto
 */
const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .trim(),
  
  code: Joi.string()
    .min(3)
    .max(50)
    .uppercase()
    .trim()
    .pattern(/^[A-Z0-9-]+$/),
  
  barcode: Joi.string()
    .max(50)
    .allow('', null)
    .trim(),
  
  categoryId: Joi.string()
    .uuid(),
  
  description: Joi.string()
    .max(1000)
    .allow('', null)
    .trim(),
  
  price: Joi.number()
    .positive()
    .precision(2),
  
  costPrice: Joi.number()
    .positive()
    .precision(2),
  
  stockQuantity: Joi.number()
    .integer()
    .min(0),
  
  minStock: Joi.number()
    .integer()
    .min(0),
  
  maxStock: Joi.number()
    .integer()
    .min(0),
  
  location: Joi.string()
    .max(50)
    .allow('', null)
    .trim(),
  
  isActive: Joi.boolean()
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

/**
 * Schema para parâmetros de listagem
 */
const productQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  category: Joi.string()
    .uuid(),
  
  code: Joi.string()
    .min(3)
    .max(50),
  
  name: Joi.string()
    .min(2)
    .max(100),
  
  isActive: Joi.boolean(),
  
  lowStock: Joi.boolean(),
  
  sortBy: Joi.string()
    .valid('name', 'code', 'price', 'stockQuantity', 'createdAt')
    .default('name'),
  
  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('ASC')
});

/**
 * Schema para parâmetro ID
 */
const productIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do produto inválido',
      'any.required': 'ID do produto é obrigatório'
    })
});

/**
 * Valida criação de produto
 */
const validateCreateProduct = (data) => {
  const { error, value } = createProductSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { status: 400, errors };
  }
  
  return value;
};

/**
 * Valida atualização de produto
 */
const validateUpdateProduct = (data) => {
  const { error, value } = updateProductSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { status: 400, errors };
  }
  
  return value;
};

/**
 * Valida parâmetros de listagem
 */
const validateProductQuery = (query) => {
  const { error, value } = productQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { status: 400, errors };
  }
  
  return value;
};

/**
 * Valida ID do produto
 */
const validateProductId = (id) => {
  const { error, value } = productIdSchema.validate({ id });
  
  if (error) {
    throw { status: 400, errors: [{ field: 'id', message: error.message }] };
  }
  
  return value.id;
};

/**
 * ALIAS para compatibilidade com o model Product.js
 * O model Product.js está chamando validateProduct
 * Esta função serve como wrapper para manter compatibilidade
 */
const validateProduct = (product) => {
  // Esta função é usada pelos hooks do model Product
  // Ela valida os dados antes de criar/atualizar
  const errors = [];
  
  // Validações básicas
  if (!product.name) {
    errors.push('Nome do produto é obrigatório');
  } else if (product.name.length < 3) {
    errors.push('Nome deve ter no mínimo 3 caracteres');
  }
  
  if (!product.code) {
    errors.push('Código do produto é obrigatório');
  } else if (product.code.length < 3) {
    errors.push('Código deve ter no mínimo 3 caracteres');
  }
  
  if (product.price !== undefined) {
    if (product.price < 0) {
      errors.push('Preço não pode ser negativo');
    }
  }
  
  if (product.stockQuantity !== undefined && product.stockQuantity < 0) {
    errors.push('Quantidade em estoque não pode ser negativa');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  // Formatação
  if (product.code) {
    product.code = product.code.toUpperCase().trim();
  }
  
  if (product.name) {
    product.name = product.name.trim();
  }
  
  return true;
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
  validateProductId,
  validateProduct  // <-- ADICIONADO: alias para compatibilidade com o model
};