const express = require('express');

const router = express.Router();
const authController = require("./auth.controller");

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/confirm-registration', authController.confirmRegistration);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);

router.post('/atualizar', authController.atualizar);

router.get('/check-session', authController.checkSession);

module.exports = router;
