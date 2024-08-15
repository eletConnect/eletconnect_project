const express = require('express');

const router = express.Router();
const eletivaController = require("./eletiva.controller");

router.post('/listar', eletivaController.listarEletivas);
router.post('/cadastrar', eletivaController.cadastrarEletiva);
router.post('/editar', eletivaController.editarEletiva);
router.post('/excluir', eletivaController.excluirEletiva);

router.post('/buscar', eletivaController.buscarEletiva);

module.exports = router;
