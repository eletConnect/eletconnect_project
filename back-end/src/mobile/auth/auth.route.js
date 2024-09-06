const express = require('express');
const router = express.Router();

const login = require('./controllers/login').login;
const changePassword = require('./controllers/changePassword').changePassword;
const logout = require('./controllers/logout').logout;
const checkSession = require('./controllers/checkSession').checkSession;
const updateSession = require('./controllers/updateSession').updateSession;

router.post('/login', login);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.get('/check-session', checkSession);
router.get('/update-session', updateSession);

module.exports = router;
