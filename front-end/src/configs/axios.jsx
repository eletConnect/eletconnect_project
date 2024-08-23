import axios from 'axios';

const LOCALHOST_API = import.meta.env.VITE_API_LOCAL || 'http://localhost:3001';
const IP_API = import.meta.env.VITE_API_IP || `http://${window.location.hostname}:3001`;

const instance = axios.create({
  baseURL: LOCALHOST_API, // Inicialmente tenta com localhost
});

// Função para verificar se o localhost está acessível
async function verificarLocalhost() {
  try {
    // Faz uma requisição simples para testar o localhost
    await instance.get('/status'); // Supondo que existe um endpoint '/status' para verificar
  } catch (error) {
    // Se houver erro, troca a baseURL para o IP
    instance.defaults.baseURL = IP_API;
    console.warn('Localhost não acessível, mudando para IP:', IP_API);
  }
}

// Executa a verificação assim que o módulo é carregado
verificarLocalhost();

export default instance;
