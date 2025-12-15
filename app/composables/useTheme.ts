import { ref, watchEffect, onMounted } from 'vue';

const mode = ref<'light' | 'dark'>('light');
const primary = ref<string>('#1d9bf0');

export function useTheme() {
  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
    if (import.meta.client) {
      localStorage.setItem('theme', mode.value);
    }
  };

  const setPrimary = (color: string) => {
    primary.value = color;
    if (import.meta.client) {
      localStorage.setItem('theme-primary', color);
    }
    document.documentElement.style.setProperty('--primary', color);
  };

  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        mode.value = saved;
      }

      const savedPrimary = localStorage.getItem('theme-primary');
      if (savedPrimary) {
        primary.value = savedPrimary;
        document.documentElement.style.setProperty('--primary', savedPrimary);
      }

      const html = document.documentElement;
      html.classList.toggle('dark', mode.value === 'dark');

      watchEffect(() => {
        html.classList.toggle('dark', mode.value === 'dark');
      });
    }
  });

  if (import.meta.client) {
    watchEffect(() => {
      document.documentElement.style.setProperty('--primary', primary.value);
    });
  }

  return { mode, toggleTheme, primary, setPrimary };
}
