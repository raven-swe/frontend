import { ref, watchEffect, onMounted } from 'vue';

const mode = ref<'light' | 'dark'>('light');

export function useTheme() {
  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
    if (import.meta.client) {
      localStorage.setItem('theme', mode.value);
    }
  };

  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        mode.value = saved;
      }

      const html = document.documentElement;
      html.classList.toggle('dark', mode.value === 'dark');

      watchEffect(() => {
        html.classList.toggle('dark', mode.value === 'dark');
      });
    }
  });

  return { mode, toggleTheme };
}
