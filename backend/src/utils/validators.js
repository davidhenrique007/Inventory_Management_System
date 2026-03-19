/**
 * Valida se um valor é um número positivo
 * @param {any} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo (para mensagem de erro)
 * @returns {number|null} - Número validado ou null
 */
const validatePositiveInteger = (value, fieldName = 'valor') => {
  if (value === undefined || value === null) return null;
  
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    throw new Error(`${fieldName} deve ser um número válido`);
  }
  
  if (num <= 0) {
    throw new Error(`${fieldName} deve ser maior que zero`);
  }
  
  return num;
};

/**
 * Valida se um valor é um UUID válido
 * @param {string} value - UUID a ser validado
 * @param {string} fieldName - Nome do campo
 * @returns {string} - UUID validado
 */
const validateUUID = (value, fieldName = 'ID') => {
  if (!value) return null;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(value)) {
    throw new Error(`${fieldName} inválido`);
  }
  
  return value;
};

/**
 * Valida e sanitiza string
 * @param {string} value - String a ser validada
 * @param {Object} options - Opções de validação
 * @returns {string} - String sanitizada
 */
const validateString = (value, options = {}) => {
  const { minLength = 1, maxLength = 255, fieldName = 'campo' } = options;
  
  if (!value) return null;
  
  const sanitized = value.trim();
  
  if (sanitized.length < minLength) {
    throw new Error(`${fieldName} deve ter no mínimo ${minLength} caracteres`);
  }
  
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
  }
  
  return sanitized;
};

/**
 * Valida parâmetros de paginação
 * @param {Object} query - Query params
 * @returns {Object} - Parâmetros validados
 */
const validatePagination = (query) => {
  const page = validatePositiveInteger(query.page, 'Página') || 1;
  const limit = validatePositiveInteger(query.limit, 'Limite') || 10;
  
  // Limitar o limite máximo para evitar sobrecarga
  const maxLimit = 100;
  const finalLimit = limit > maxLimit ? maxLimit : limit;
  
  return {
    page,
    limit: finalLimit,
    offset: (page - 1) * finalLimit
  };
};

/**
 * Valida e extrai filtros de produtos
 * @param {Object} query - Query params
 * @returns {Object} - Filtros validados
 */
const validateProductFilters = (query) => {
  const filters = {};
  
  // Filtro por categoria (UUID)
  if (query.category) {
    filters.categoryId = validateUUID(query.category, 'Categoria');
  }
  
  // Filtro por código de barras
  if (query.code) {
    filters.code = validateString(query.code, {
      minLength: 3,
      maxLength: 50,
      fieldName: 'Código do produto'
    });
  }
  
  // Filtro por nome (busca parcial)
  if (query.name) {
    filters.name = validateString(query.name, {
      minLength: 2,
      maxLength: 100,
      fieldName: 'Nome do produto'
    });
  }
  
  // Filtro por status ativo
  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === 'true';
  }
  
  // Filtro por estoque baixo
  if (query.lowStock === 'true') {
    filters.lowStock = true;
  }
  
  return filters;
};

/**
 * Valida ordenação
 * @param {Object} query - Query params
 * @returns {Object} - Ordenação validada
 */
const validateSorting = (query) => {
  const allowedFields = ['name', 'code', 'price', 'stockQuantity', 'createdAt'];
  const sortBy = query.sortBy && allowedFields.includes(query.sortBy) 
    ? query.sortBy 
    : 'name';
  
  const order = query.order === 'DESC' ? 'DESC' : 'ASC';
  
  return { sortBy, order };
};

module.exports = {
  validatePositiveInteger,
  validateUUID,
  validateString,
  validatePagination,
  validateProductFilters,
  validateSorting
};