export default defineI18nConfig(() => ({
  legacy: false,
  pluralRules: {
    'en-US': (choice: number, choicesLength: number): number => {
      return Math.max(0, Math.min(choice, choicesLength - 1));
    },
    'ar-EG': (choice: number, choicesLength: number): number => {
      return Math.max(0, Math.min(choice, choicesLength - 1));
    },
  },
}));
