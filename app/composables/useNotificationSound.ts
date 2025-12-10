import { ref } from 'vue';

interface Options {
  minInterval?: number; // ms between sounds
  volume?: number; // 0–1
}

let audio: HTMLAudioElement | null = null;
const lastPlayedAt = ref(0);
const SOUND_SRC = '/sounds/Raven.mp3';

export function useNotificationSound(options: Options = {}) {
  const { minInterval = 800, volume = 1 } = options;

  // Load audio once on client
  if (import.meta.client && !audio) {
    audio = new Audio(SOUND_SRC);
    audio.volume = volume;
    audio.preload = 'auto';
  }

  const play = () => {
    if (!import.meta.client || !audio) return;

    const now = Date.now();
    const diff = now - lastPlayedAt.value;

    // prevent spam
    if (diff < minInterval) return;

    lastPlayedAt.value = now;

    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  return {
    play,
  };
}
