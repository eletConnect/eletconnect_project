require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares para parsing de requisições JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do CORS para permitir requisições do front-end
app.use(cors({
  origin: 'http://localhost:5173', // Domínio da aplicação React
  credentials: true // Permite o envio de cookies
}));

// Logger HTTP para requisições
app.use(morgan('dev'));

// Segurança básica com cabeçalhos HTTP
app.use(helmet());

// Limitação de requisições por IP para prevenir abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo de 15 minutos
  max: 100, // Máximo de 100 requisições por IP
});
app.use(limiter);

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // `true` para HTTPS em produção
    maxAge: 24 * 60 * 60 * 1000 // Duração do cookie: 1 dia
  }
}));

// Importa e usa as rotas definidas em arquivos separados
const routes = require('./src/routes');
app.use(routes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
