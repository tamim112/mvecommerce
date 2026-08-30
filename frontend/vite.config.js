import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // এই প্লাগইনটি ম্যাজিকের মতো কোড বিল্ড করবে
  ],
})
