const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Renovar access token
 * @access  Public (mas requer refresh token válido)
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout (apenas para consistência)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token atual
 * @access  Private
 */
router.get('/verify', authenticate, authController.verifyToken);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;