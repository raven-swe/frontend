import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['@/assets/css/main.css', 'video.js/dist/video-js.css'],
  runtimeConfig: {
    public: {
      useMocks: process.env.NUXT_PUBLIC_USE_MOCKS === 'true',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      backendUrl: process.env.BACKEND_URL || '',
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || '',
      githubRedirectUri: process.env.NUXT_PUBLIC_GITHUB_REDIRECT_URI || '',
      githubScope: process.env.NUXT_PUBLIC_GITHUB_SCOPE || '',
      googleRedirectUri: process.env.NUXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
      googleScope: process.env.NUXT_PUBLIC_GOOGLE_SCOPE || '',
      siteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:5173',
      dmWebSocketUrl: process.env.NUXT_PUBLIC_DM_WS_URL || 'wss://api.raven.cmp27.space/ws/dm',
      dmSseUrl: process.env.NUXT_PUBLIC_DM_SSE_URL || '',
    },
  },
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
  app: {
    head: {
      title: 'Raven',
      link: [
        { rel: 'preconnect', href: 'https://www.google.com' },
        { rel: 'preconnect', href: 'https://www.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/png', href: 'https://cdn.raven.cmp27.space/favicon.png' },
      ],
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
    '@nuxt/image-edge',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en-US',
    locales: [
      { code: 'en-US', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ar-EG', iso: 'ar-EG', name: 'العربية', file: 'ar.json', dir: 'rtl' },
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
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google', // Load from Google Fonts
        weights: [400, 500, 600, 700],
        styles: ['normal', 'oblique', 'italic'],
      },
    ],
  },
});
