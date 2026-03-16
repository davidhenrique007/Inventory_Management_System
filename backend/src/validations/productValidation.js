const VALIDATION_RULES = {
  CODE_MIN_LENGTH: 3,
  NAME_MIN_LENGTH: 3,
  BARCODE_MIN_LENGTH: 8,
  BARCODE_MAX_LENGTH: 14,
  MAX_PRICE: 999999.99,
  ERROR_SEPARATOR: '; '
};

const ERROR_MESSAGES = {
  CODE_REQUIRED: 'Código do produto é obrigatório',
  CODE_MIN_LENGTH: (min) => `Código deve ter no mínimo ${min} caracteres`,
  CODE_INVALID: 'Código deve conter apenas letras, números e hífen',
  NAME_REQUIRED: 'Nome do produto é obrigatório',
  NAME_MIN_LENGTH: (min) => `Nome deve ter no mínimo ${min} caracteres`,
  PRICE_REQUIRED: 'Preço é obrigatório',
  PRICE_INVALID: 'Preço deve ser um número válido',
  PRICE_NEGATIVE: 'Preço não pode ser negativo',
  PRICE_TOO_HIGH: (max) => `Preço muito alto (máximo: R$ ${max.toLocaleString('pt-BR')})`,
  QUANTITY_INVALID: 'Quantidade em estoque deve ser um número',
  QUANTITY_NEGATIVE: 'Quantidade em estoque não pode ser negativa',
  QUANTITY_INTEGER: 'Quantidade em estoque deve ser um número inteiro',
  BARCODE_INVALID: (min, max) => `Código de barras deve ter entre ${min} e ${max} dígitos`,
  STOCK_MIN_MAX: 'Estoque mínimo não pode ser maior que o máximo',
  COST_PRICE_GREATER: 'Preço de custo não pode ser maior que o preço de venda'
};

// Funções auxiliares puras
const validators = {
  isPresent: (value) => value !== undefined && value !== null && value !== '',
  isCode: (code) => /^[A-Z0-9-]+$/i.test(code),
  isBarcode: (barcode) => /^\d{8,14}$/.test(barcode),
  isValidNumber: (value) => !isNaN(parseFloat(value)),
  isInteger: (value) => Number.isInteger(parseInt(value)),
  isPositive: (value) => parseFloat(value) >= 0
};

const formatters = {
  code: (code) => code?.toUpperCase().trim(),
  barcode: (barcode) => barcode?.replace(/\D/g, ''),
  name: (name) => name?.trim(),
  price: (price) => parseFloat(price)
};

const validateProduct = async (product) => {
  const errors = [];

  // Validação de código
  if (!validators.isPresent(product.code)) {
    errors.push(ERROR_MESSAGES.CODE_REQUIRED);
  } else {
    if (product.code.length < VALIDATION_RULES.CODE_MIN_LENGTH) {
      errors.push(ERROR_MESSAGES.CODE_MIN_LENGTH(VALIDATION_RULES.CODE_MIN_LENGTH));
    }
    if (!validators.isCode(product.code)) {
      errors.push(ERROR_MESSAGES.CODE_INVALID);
    }
  }

  // Validação de nome
  if (!validators.isPresent(product.name)) {
    errors.push(ERROR_MESSAGES.NAME_REQUIRED);
  } else if (product.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.push(ERROR_MESSAGES.NAME_MIN_LENGTH(VALIDATION_RULES.NAME_MIN_LENGTH));
  }

  // Validação de preço
  if (!validators.isPresent(product.price)) {
    errors.push(ERROR_MESSAGES.PRICE_REQUIRED);
  } else {
    const price = formatters.price(product.price);
    
    if (!validators.isValidNumber(price)) {
      errors.push(ERROR_MESSAGES.PRICE_INVALID);
    } else {
      if (!validators.isPositive(price)) {
        errors.push(ERROR_MESSAGES.PRICE_NEGATIVE);
      }
      if (price > VALIDATION_RULES.MAX_PRICE) {
        errors.push(ERROR_MESSAGES.PRICE_TOO_HIGH(VALIDATION_RULES.MAX_PRICE));
      }
    }
  }

  // Validação de quantidade em estoque
  if (validators.isPresent(product.stockQuantity)) {
    const quantity = parseInt(product.stockQuantity);
    
    if (!validators.isValidNumber(quantity)) {
      errors.push(ERROR_MESSAGES.QUANTITY_INVALID);
    } else {
      if (!validators.isPositive(quantity)) {
        errors.push(ERROR_MESSAGES.QUANTITY_NEGATIVE);
      }
      if (!validators.isInteger(quantity)) {
        errors.push(ERROR_MESSAGES.QUANTITY_INTEGER);
      }
    }
  }

  // Validação de código de barras
  if (validators.isPresent(product.barcode)) {
    const barcode = formatters.barcode(product.barcode);
    if (!validators.isBarcode(barcode)) {
      errors.push(ERROR_MESSAGES.BARCODE_INVALID(
        VALIDATION_RULES.BARCODE_MIN_LENGTH,
        VALIDATION_RULES.BARCODE_MAX_LENGTH
      ));
    }
  }

  // Validação de estoque mínimo vs máximo
  if (validators.isPresent(product.minStock) && validators.isPresent(product.maxStock)) {
    if (product.minStock > product.maxStock) {
      errors.push(ERROR_MESSAGES.STOCK_MIN_MAX);
    }
  }

  // Validação de preço de custo vs preço de venda
  if (validators.isPresent(product.costPrice) && validators.isPresent(product.price)) {
    if (parseFloat(product.costPrice) > parseFloat(product.price)) {
      errors.push(ERROR_MESSAGES.COST_PRICE_GREATER);
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(VALIDATION_RULES.ERROR_SEPARATOR));
    error.validationErrors = errors;
    error.statusCode = 400;
    throw error;
  }

  // Formatação dos dados
  const formattedProduct = {
    ...product,
    code: formatters.code(product.code),
    name: formatters.name(product.name),
    price: formatters.price(product.price)
  };

  if (product.barcode) {
    formattedProduct.barcode = formatters.barcode(product.barcode);
  }

  return formattedProduct;
};

const validateBulkProducts = async (products) => {
  const results = {
    valid: [],
    errors: [],
    summary: {
      total: products.length,
      valid: 0,
      invalid: 0,
      successRate: 0
    }
  };

  for (let i = 0; i < products.length; i++) {
    try {
      const validatedProduct = await validateProduct(products[i]);
      results.valid.push(validatedProduct);
      results.summary.valid++;
    } catch (error) {
      results.errors.push({
        index: i,
        product: products[i],
        errors: error.validationErrors || [error.message]
      });
      results.summary.invalid++;
    }
  }

  results.summary.successRate = (results.summary.valid / results.summary.total * 100).toFixed(2);

  return results;
};

module.exports = {
  validateProduct,
  validateBulkProducts,
  VALIDATION_RULES,
  ERROR_MESSAGES
};