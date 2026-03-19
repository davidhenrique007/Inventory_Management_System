const { pick } = require('lodash');

/**
 * Middleware para validar requisições usando Joi
 * @param {Object} schema - Schema Joi para validação
 * @param {String} property - Propriedade a validar (body, query, params)
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Validar a propriedade específica da requisição
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        errors: {
          wrap: { label: false }
        }
      });

      if (error) {
        // Formatar erros de validação
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          message: 'Os dados fornecidos são inválidos',
          details: errors
        });
      }

      // Substituir a propriedade original pelos valores validados
      req[property] = value;
      next();

    } catch (err) {
      next(err);
    }
  };
};

/**
 * Valida múltiplas partes da requisição
 * @param {Object} schemas - { body, query, params } com schemas Joi
 */
const validateAll = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validar cada parte
    Object.entries(schemas).forEach(([property, schema]) => {
      if (!schema) return;

      const { error } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        error.details.forEach(detail => {
          errors.push({
            field: `${property}.${detail.path.join('.')}`,
            message: detail.message
          });
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        message: 'Os dados fornecidos são inválidos',
        details: errors
      });
    }

    next();
  };
};

/**
 * Sanitiza dados da requisição (remove espaços extras, etc)
 */
const sanitizeRequest = (req, res, next) => {
  // Sanitizar body strings
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar query strings
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

module.exports = {
  validateRequest,
  validateAll,
  sanitizeRequest
};