const express = require('express');

// Importação das rotas dos módulos
const authRoute = require('./web/auth/auth.route');
const instituicaoRoute = require('./web/instituicao/instituicao.route');
const alunoRoute = require('./web/aluno/aluno.route');

const router = express.Router();

// Configuração das rotas web
router.use('/auth', authRoute); // Rotas de autenticação
router.use('/instituicao', instituicaoRoute); // Rotas relacionadas a instituições
router.use('/aluno', alunoRoute); // Rotas relacionadas a alunos

// Configuração das rotas mobile

module.exports = router;
