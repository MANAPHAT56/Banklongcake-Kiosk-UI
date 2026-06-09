import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite' // 👈 1. เพิ่มตัวอ่านสไตล์ Tailwind v4 เข้ามา
import { tanstackRouter } from '@tanstack/router-plugin/vite' // 👈 2. เพิ่มตัวจัดการเส้นทางของ TanStack เข้ามา

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    tanstackRouter(), // 💡 ต้องวางไว้ก่อน react() เพื่อให้ระบบสร้างไฟล์ route อัตโนมัติได้ถูกต้อง
    react(), 
    tailwindcss(),    // 👈 3. ใส่ปลั๊กอิน Tailwind เข้าไปในระบบบิวด์
    tsconfigPaths()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_API_TARGET || 'http://backend:3000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})