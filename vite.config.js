import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  //部署到github pages，開發中與生產環境不同路徑處理
  base:process.env.NODE_ENV === 'production' ? '/react_task_week2_20260112/' : '/',
  plugins: [react()],
})
