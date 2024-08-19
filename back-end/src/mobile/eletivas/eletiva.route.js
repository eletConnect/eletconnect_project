const express = require('express');

const router = express.Router();
const eletivaController = require("./eletiva.controller");

router.post('/listar', eletivaController.listarEletivas);
router.post('/minhas-eletivas', eletivaController.minhasEletivas);

router.post('/participar', eletivaController.participarEletiva);


module.exports = router;
