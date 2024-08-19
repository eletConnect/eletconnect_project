const express = require('express');

const router = express.Router();
const eletivaController = require("./eletiva.controller");

router.post('/listar', eletivaController.listarEletivas);
router.post('/cadastrar', eletivaController.cadastrarEletiva);
router.post('/editar', eletivaController.editarEletiva);
router.post('/excluir', eletivaController.excluirEletiva);

router.post('/buscar', eletivaController.buscarEletiva);

router.post('/listarAlunosEletiva', eletivaController.listarAlunosEletiva);
router.post('/matricularAluno', eletivaController.matricularAluno);
router.post('/desmatricularAluno', eletivaController.desmatricularAluno);

router.post('/listarEletivasAluno', eletivaController.listarEletivasAluno);

module.exports = router;
