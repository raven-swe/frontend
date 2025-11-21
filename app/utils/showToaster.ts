import { toast } from 'vue-sonner';
import { useNuxtApp } from '#app';

const typeConfig = {
  success: {
    icon: '✔️',
    bg: 'var(--toaster-bg-success)',
    color: 'var(--toaster-text-success)',
  },
  error: {
    icon: '❌',
    bg: 'var(--toaster-bg-error)',
    color: 'var(--toaster-text-error)',
  },
  warning: {
    icon: '⚠️',
    bg: 'var(--toaster-bg-warning)',
    color: 'var(--toaster-text-warning)',
  },
  info: {
    icon: 'ℹ️',
    bg: 'var(--toaster-bg-info)',
    color: 'var(--toaster-text-info)',
  },
} as const;

type ToastType = keyof typeof typeConfig;

export function showToaster(type: ToastType, message: string) {
  const { icon, bg, color } = typeConfig[type];
  const { $i18n } = useNuxtApp();
  const translatedMessage = $i18n.t(message);

  toast(`${icon} ${translatedMessage}`, {
    style: {
      background: bg,
      color: color,
      padding: '10px 14px',
      borderRadius: '20px',
    },
  });
}
