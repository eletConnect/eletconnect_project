require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const os = require('os');
const fs = require('fs'); // Importando o módulo fs para usar existsSync

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

// Função para obter o endereço IP local
function obterEnderecoIPLocal() {
  const interfaces = os.networkInterfaces();
  for (const nomeInterface of Object.keys(interfaces)) {
    for (const iface of interfaces[nomeInterface]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Configuração do CORS
const IPLocal = obterEnderecoIPLocal();
app.use(cors({
  origin: [
    'http://localhost:5173',
    `http://${IPLocal}:5173`,
  ],
  credentials: true,
}));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Limitação de requisições por IP - menos restritiva no desenvolvimento
const limitadorStatus = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
});

// Aplicando rate limiter no endpoint de status apenas
app.use('/status', limitadorStatus);

// Configuração da sessão usando o armazenamento padrão na memória
app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Desativado para desenvolvimento em HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
}));

// Log da sessão para depuração
app.use((req, res, next) => {
  console.log('Sessão:', req.session); // Logando a sessão para verificar se está sendo criada corretamente
  next();
});

// Servir arquivos estáticos da build do React
const staticPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  console.error('Caminho para arquivos estáticos não encontrado:', staticPath);
}

// Endpoint de status
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor está funcionando corretamente',
  });
});

// Importação das rotas
app.use(require('./src/routes'));

// Rota para servir o index.html para qualquer outra rota (para compatibilidade com o React Router)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html não encontrado.');
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    erro: {
      mensagem: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
});

// Inicialização do servidor
app.listen(PORT, HOST, () => {
  const IPLocal = obterEnderecoIPLocal();
  console.log(`Servidor rodando em http://${IPLocal}:${PORT} (ou http://localhost:${PORT})`);
});
