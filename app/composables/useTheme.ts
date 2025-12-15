export function useTheme() {
  const themeCookie = useCookie('theme-mode', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    default: () => 'light',
  });

  const primaryCookie = useCookie('theme-primary', {
    maxAge: 60 * 60 * 24 * 365,
    default: () => '#1d9bf0',
  });

  const setTheme = (mode: 'light' | 'dark') => {
    themeCookie.value = mode;
  };

  const setPrimary = (color: string) => {
    primaryCookie.value = color;
  };

  useHead(() => ({
    htmlAttrs: {
      class: themeCookie.value === 'dark' ? 'dark' : '',
      style: {
        '--primary': primaryCookie.value,
      },
    },
  }));

  return { themeCookie, setTheme, primaryCookie, setPrimary };
}
