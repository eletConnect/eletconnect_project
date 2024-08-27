const express = require('express');
const router = express.Router();

// Importar os controladores
const listarColaboradores = require('./controllers/listarColaboradores').listarColaboradores;
const cadastrarColaborador = require('./controllers/cadastrarColaborador').cadastrarColaborador;

// Definir as rotas
router.post('/listar', listarColaboradores);
router.post('/cadastrar', cadastrarColaborador);

module.exports = router;
