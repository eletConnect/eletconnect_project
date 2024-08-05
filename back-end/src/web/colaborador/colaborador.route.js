const express = require('express');

const router = express.Router();
const colaboradorController = require("./colaborador.controller");

router.post('listar', colaboradorController.listarColaboradores);
 
module.exports = router;
