import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query' // 👈 1. import ตัวครอบมา
import { router, queryClient } from './router' // 👈 2. ดึง queryClient มาด้วย
import './styles.css'

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      {/* 3. นำ QueryClientProvider มาครอบ RouterProvider ไว้อีกชั้นหนึ่ง */}
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}