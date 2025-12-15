import { toast } from 'vue-sonner';
import { useNuxtApp } from '#app';

export function showToaster(
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  translate = false,
) {
  const { $i18n } = useNuxtApp();
  const text = translate ? $i18n.t(message) : message;

  toast[type](text);
}
