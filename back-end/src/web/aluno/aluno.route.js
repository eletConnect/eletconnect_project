const express = require('express');

const router = express.Router();
const authController = require("./aluno.controller");

router.post('/listar', authController.listarAlunos);
router.post('/cadastrar', authController.cadastrarAluno);
router.post('/editar', authController.editarAluno);
router.post('/redefinir-senha', authController.redefinirSenha);
router.post('/excluir', authController.excluirAluno);

router.post('/consultar', authController.consultarAluno);

module.exports = router;
