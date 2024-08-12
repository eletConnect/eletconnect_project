const express = require('express');

// Importação das rotas dos módulos web
const authRoute = require('./web/auth/auth.route');
const instituicaoRoute = require('./web/instituicao/instituicao.route');
const alunoRoute = require('./web/estudantes/aluno.route');
const eletivaRoute = require('./web/eletivas/eletiva.route');

// Importação das rotas dos módulos mobile
const m_authRoute = require('./mobile/auth/auth.route');

// Criação do objeto de rotas
const router = express.Router();

// Configuração das rotas web
router.use('/auth', authRoute); // Rotas de autenticação
router.use('/instituicao', instituicaoRoute); // Rotas relacionadas a instituições
router.use('/estudantes', alunoRoute); // Rotas relacionadas a alunos
router.use('/eletivas', eletivaRoute); // Rotas relacionadas a eletivas

// Configuração das rotas mobile
router.use('/m/auth', m_authRoute); // Rotas de autenticação

module.exports = router;
