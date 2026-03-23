const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    cb(null, fileName);
  }
});

// Filtro de arquivos (apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG, GIF e WEBP são permitidos.'), false);
  }
};

// Limite de tamanho (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Criar instância do multer
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware para upload único
const uploadSingle = (fieldName = 'image') => upload.single(fieldName);

// Middleware para upload múltiplo
const uploadMultiple = (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount);

// Função para remover imagem
const removeImage = (imageUrl) => {
  if (!imageUrl) return;
  
  const filename = path.basename(imageUrl);
  const filePath = path.join(uploadDir, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Função para obter URL da imagem
const getImageUrl = (filename, req) => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/products/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  removeImage,
  getImageUrl,
  uploadDir
};