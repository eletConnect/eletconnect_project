const express = require('express');

const router = express.Router();
const escolaController = require("./instituicao.controller");

router.post('/verificar', escolaController.verificarEscolaUSER);
router.post('/verificar-mobile', escolaController.verificarEscolaALUNO);
router.post('/entrar', escolaController.entrarEscolaCODE);

router.post('/cadastrar', escolaController.cadastrarEscola);
router.post('/alterar', escolaController.editarEscola);
 
module.exports = router;
