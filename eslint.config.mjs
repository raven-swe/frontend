// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import pluginRegex from 'eslint-plugin-regex';

export default withNuxt({
  ignores: ['eslint.config.mjs', '.output', '.nuxt', 'node_modules'],
  plugins: {
    regex: pluginRegex,
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'vue/no-bare-strings-in-template': 'error',
    'vue/html-self-closing': 'off',
    'vue/multiword-component-names': 'off',
    'regex/invalid': [
      'error',
      [
        {
          id: 'no-ltr-tailwind',
          message:
            'Avoid left/right-based Tailwind classes. Use logical ones (ms/me, ps/pe, start/end).',
          regex: String.raw`(?<=\bclass(?:Name)?=["'][^"']*)\b(?:ml|mr|pl|pr|left|right|inset-(?:l|r))(?:-[^\s"'>]+)?\b`,
        },
      ],
    ],
  },
});
