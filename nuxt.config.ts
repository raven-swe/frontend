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
  typescript: {
    strict: true,
    sharedTsConfig: {
      include: ['../shared/types/**/*.ts', '../mocks/**/*.ts', '../test/**/*.ts'],
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@nuxt/test-utils/module',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    strategy: 'prefix_and_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' },
    ],
  },
  hooks: {
    'pages:extend'(pages) {
      // Remove playground pages in production
      if (process.env.NODE_ENV === 'production') {
        const filteredPages = pages.filter((page) => !page.file?.includes('/pages/playground/'));
        pages.length = 0;
        pages.push(...filteredPages);
      }
    },
  },
});
