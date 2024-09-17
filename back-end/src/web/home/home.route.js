const express = require('express');
const router = express.Router();

// Importar os controladores
const quantidades = require('./controllers/quantidades').quantidades;

// Definir as rotas
router.post('/qnt', quantidades);
 
module.exports = router;
