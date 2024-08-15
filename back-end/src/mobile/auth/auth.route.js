const express = require('express');

const router = express.Router();
const authController = require("./auth.controller");

router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

router.get('/check-session', authController.checkSession);

module.exports = router;
