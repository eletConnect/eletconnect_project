const express = require('express');

const authRoute = require('./web/auth/auth.route');
const instituicaoRoute = require('./web/instituicao/instituicao.route');
const alunoRoute = require('./web/aluno/aluno.route');
const colaboradorRoute = require('./web/colaborador/colaborador.route');

const router = express.Router();

// Rotas web
router.use('/auth', authRoute);
router.use('/instituicao', instituicaoRoute);
router.use('/aluno', alunoRoute);
router.use('/colaborador', colaboradorRoute);

// Rotas mobile

module.exports = router;
