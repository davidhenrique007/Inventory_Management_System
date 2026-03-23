const multer = require('multer');
const { uploadSingle, uploadMultiple, removeImage } = require('../config/multer');

/**
 * Middleware para upload de imagem única
 * @param {string} fieldName - Nome do campo no formulário
 */
const handleSingleUpload = (fieldName = 'image') => {
  return (req, res, next) => {
    uploadSingle(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Arquivo muito grande',
              message: 'O arquivo não pode exceder 5MB'
            });
          }
          return res.status(400).json({
            success: false,
            error: 'Erro no upload',
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Erro no upload',
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Middleware para upload múltiplo
 * @param {string} fieldName - Nome do campo no formulário
 * @param {number} maxCount - Número máximo de arquivos
 */
const handleMultipleUpload = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    uploadMultiple(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Arquivo muito grande',
              message: 'Os arquivos não podem exceder 5MB cada'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              error: 'Muitos arquivos',
              message: `Máximo de ${maxCount} arquivos permitidos`
            });
          }
          return res.status(400).json({
            success: false,
            error: 'Erro no upload',
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Erro no upload',
          message: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  handleSingleUpload,
  handleMultipleUpload
};