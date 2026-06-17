import { defineConfig } from 'vite'

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : ''

export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
})
