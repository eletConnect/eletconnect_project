const express = require('express');

const router = express.Router();
const alunoController = require("./aluno.controller");

router.post('/listar', alunoController.listarAlunos);
router.post('/cadastrar', alunoController.cadastrarAluno);
router.post('/editar', alunoController.editarAluno);
router.post('/redefinir-senha', alunoController.redefinirSenha);
router.post('/excluir', alunoController.excluirAluno);

router.post('/consultar', alunoController.consultarAluno);

module.exports = router;
