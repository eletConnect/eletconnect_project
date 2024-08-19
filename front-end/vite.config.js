import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0', // Escuta em todas as interfaces de rede
    port: parseInt(process.env.VITE_PORT) || 5173,
  },
});
