// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  
  typescript: {
    typeCheck: false,
    shim: false,
    tsConfig: {
      compilerOptions: {
        skipLibCheck: true,
      }
    }
  },

  vite: {
    build: {
      sourcemap: false,
    }
  },

  devServer: {
    port: 3001
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
    }
  },
  compatibilityDate: '2026-04-18'
})