import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/components' // This tells Vite to look for components in the root components folder
    },
  },
  server: {
    port: 3000, // Change the port to 3000
  },
})
