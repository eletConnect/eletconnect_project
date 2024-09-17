const express = require('express');
const router = express.Router();

// Importar os controladores
const listarEletivas = require('./controllers/listarEletivas').listarEletivas;
const cadastrarEletiva = require('./controllers/cadastrarEletiva').cadastrarEletiva;
const editarEletiva = require('./controllers/editarEletiva').editarEletiva;
const excluirEletiva = require('./controllers/excluirEletiva').excluirEletiva;
const buscarEletiva = require('./controllers/buscarEletiva').buscarEletiva;
const listarAlunosEletiva = require('./controllers/listarAlunosEletiva').listarAlunosEletiva;
const matricularAluno = require('./controllers/matricularAluno').matricularAluno;
const desmatricularAluno = require('./controllers/desmatricularAluno').desmatricularAluno;
const listarEletivasAluno = require('./controllers/listarEletivasAluno').listarEletivasAluno;
const definirPeriodo = require('./controllers/definirPeriodo').definirPeriodo;
const obterPeriodo = require('./controllers/obterPeriodo').obterPeriodo;

// Definir as rotas
router.post('/listar', listarEletivas);
router.post('/cadastrar', cadastrarEletiva);
router.post('/editar', editarEletiva);
router.post('/excluir', excluirEletiva);
router.post('/buscar', buscarEletiva);
router.post('/listar-alunos-eletiva', listarAlunosEletiva);
router.post('/matricular-aluno', matricularAluno);
router.post('/desmatricular-aluno', desmatricularAluno);
router.post('/listar-eletivas-aluno', listarEletivasAluno);
router.post('/definir-periodo', definirPeriodo);
router.post('/obter-periodo', obterPeriodo);

module.exports = router;
