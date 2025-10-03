import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['@/assets/css/main.css'],
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/test-utils'],
  vite: {
    plugins: [tailwindcss()],
  },
});
