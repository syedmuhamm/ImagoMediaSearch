import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5173-syedmuhamm-imagomediase-2dhunufqken.ws-eu120.gitpod.io'],
    host: true,
    port: 5173,
  },
})
