import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages用: baseをリポジトリ名に合わせて設定
const repoName = '4x4x4'; // あなたのリポジトリ名に合わせて変更

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
})
