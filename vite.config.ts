import { fileURLToPath, URL } from 'node:url'
import path from "path";
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import { resolve } from 'path'

// https://vitejs.dev/config/
const appConfig = defineConfig({
  // Application Configuration
  plugins: [vue2(), vue2Jsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "@package": path.resolve(__dirname, './package'),
    }
  }
})

const libraryConfig =  defineConfig({
  build:{
    lib:{
      entry: resolve(__dirname, 'package/main.ts'),
      name: 'TextParse',
      // the proper extensions will be added
      fileName: 'text-parse',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    vue2(),
    vue2Jsx()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "@package": path.resolve(__dirname, './package'),
    }
  }
})
console.log("import.meta.url:::",__dirname)
// 根据环境变量判断使用哪种配置
const isLibraryMode = process.env.BUILD_MODE === 'lib';

export default isLibraryMode ? libraryConfig : appConfig;