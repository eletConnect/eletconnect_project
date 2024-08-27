const express = require('express');
const router = express.Router();

// Importar os controladores
const listarAlunos = require('./controllers/listarAlunos').listarAlunos;
const consultarAluno = require('./controllers/consultarAluno').consultarAluno;
const cadastrarAluno = require('./controllers/cadastrarAluno').cadastrarAluno;
const editarAluno = require('./controllers/editarAluno').editarAluno;
const redefinirSenha = require('./controllers/redefinirSenha').redefinirSenha;
const excluirAluno = require('./controllers/excluirAluno').excluirAluno;

// Definir as rotas
router.post('/listar', listarAlunos);
router.post('/consultar', consultarAluno);
router.post('/cadastrar', cadastrarAluno);
router.post('/editar', editarAluno);
router.post('/redefinir-senha', redefinirSenha);
router.post('/excluir', excluirAluno);

module.exports = router;
