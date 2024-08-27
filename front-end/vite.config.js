import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

// Detecta o ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress', // Usa Brotli, que geralmente oferece melhor compressão
      ext: '.br', // Define a extensão do arquivo comprimido
      deleteOriginalAssets: false, // Mantém os arquivos originais
    }),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza automaticamente o service worker
      manifest: {
        name: 'eletConnect',
        short_name: 'eletConnect',
        description: 'Aplicação web para gestão e participação em eletivas escolares.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'], // Padrões de arquivos para cache
        cleanupOutdatedCaches: true, // Limpa caches antigos
        clientsClaim: true, // Faz o service worker tomar controle imediatamente
      },
      devOptions: {
        enabled: !isProduction, // Habilita o PWA em desenvolvimento fora de produção
        navigateFallback: 'index.html', // Fallback para o PWA
      },
    })
  ],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0', // Escuta em todas as interfaces de rede
    port: parseInt(process.env.VITE_PORT) || 5173, // Porta do servidor de desenvolvimento
  },
  build: {
    minify: isProduction, // Minifica em produção, desabilita em desenvolvimento
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
