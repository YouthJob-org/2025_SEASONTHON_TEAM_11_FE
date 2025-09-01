// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // envPrefix: 'VITE_', // 이 줄은 있어도 되고 없어도 됩니다(기본이 'VITE_')
})
