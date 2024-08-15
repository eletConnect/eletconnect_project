const express = require('express');

const router = express.Router();
const eletivaController = require("./eletiva.controller");

router.post('/listar', eletivaController.listarEletivas);

module.exports = router;
