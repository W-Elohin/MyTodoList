import { defineConfig } from 'vite'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// 建置時產生 version.json 到 public
function versionPlugin() {
  return {
    name: 'version',
    buildStart() {
      writeFileSync(
        path.resolve('./public/version.json'),
        JSON.stringify({ version: pkg.version })
      )
    },
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    versionPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  worker: {
    format: 'es',
  },

  build: {
    rollupOptions: {
      output: {
        // 效能（設計章程支柱 8）：把穩定的大型 vendor 拆成可長期快取的獨立 chunk。
        // App 程式碼變動時這些 chunk 的 hash 不變，回訪者免重新下載。
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-motion': ['motion'],
        },
      },
    },
  },
})
