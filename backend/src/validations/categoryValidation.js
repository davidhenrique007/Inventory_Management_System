const Joi = require('joi');

// Schema base para categoria
const categoryBaseSchema = {
  name: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z0-9\sáéíóúâêîôûãõàèìòùç\-]+$/)
    .messages({
      'string.base': 'Nome deve ser uma string',
      'string.empty': 'Nome não pode estar vazio',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'string.pattern.base': 'Nome contém caracteres inválidos',
      'any.required': 'Nome é obrigatório'
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.base': 'Descrição deve ser uma string',
      'string.max': 'Descrição deve ter no máximo {#limit} caracteres'
    })
};

// Schema para criação de categoria
const categorySchema = Joi.object({
  name: categoryBaseSchema.name.required(),
  description: categoryBaseSchema.description
});

// Schema para atualização de categoria
const categoryUpdateSchema = Joi.object({
  name: categoryBaseSchema.name,
  description: categoryBaseSchema.description
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para parâmetros de listagem (query params)
const categoryQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.integer': 'Página deve ser um número inteiro',
      'number.min': 'Página deve ser maior ou igual a {#limit}'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limite deve ser um número',
      'number.integer': 'Limite deve ser um número inteiro',
      'number.min': 'Limite deve ser maior ou igual a {#limit}',
      'number.max': 'Limite deve ser menor ou igual a {#limit}'
    }),

  name: Joi.string()
    .trim()
    .min(1)
    .max(100),

  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt')
    .default('name'),

  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('ASC')
});

// Schema para parâmetros de rota (ID)
const categoryIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID de categoria inválido',
      'any.required': 'ID da categoria é obrigatório'
    })
});

// Schema para slug
const categorySlugSchema = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Slug inválido',
      'any.required': 'Slug é obrigatório'
    })
});

module.exports = {
  categorySchema,
  categoryUpdateSchema,
  categoryQuerySchema,
  categoryIdSchema,
  categorySlugSchema,
  categoryBaseSchema
};