import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.client before any imports
const mockClient = { value: true };
vi.stubGlobal('import.meta', { client: mockClient });

// Mock the Audio element
const playMock = vi.fn(() => Promise.resolve());
const audioMock = {
  play: playMock,
  volume: 1,
  preload: 'auto',
  currentTime: 0,
};

vi.stubGlobal(
  'Audio',
  vi.fn(() => audioMock),
);

describe('useNotificationSound', () => {
  beforeEach(() => {
    // Reset mocks and timers before each test
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Reset audio mock properties
    audioMock.volume = 1;
    audioMock.preload = 'auto';
    audioMock.currentTime = 0;

    // Reset modules to clear module-level state
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize audio once on the client', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    useNotificationSound();
    expect(Audio).toHaveBeenCalledTimes(1);
    expect(Audio).toHaveBeenCalledWith('/sounds/Raven.mp3');

    // Call it again, should not create a new Audio object
    useNotificationSound();
    expect(Audio).toHaveBeenCalledTimes(1);
  });

  it('should set default volume and preload properties', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    useNotificationSound();
    expect(audioMock.volume).toBe(1);
    expect(audioMock.preload).toBe('auto');
  });

  it('should use provided volume option', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    useNotificationSound({ volume: 0.5 });
    expect(audioMock.volume).toBe(0.5);
  });

  it('should play the sound', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    const { play } = useNotificationSound();
    play();
    expect(audioMock.currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('should prevent spamming the play function based on minInterval', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    const { play } = useNotificationSound({ minInterval: 1000 });

    // First play
    play();
    expect(playMock).toHaveBeenCalledTimes(1);

    // Try to play again within the interval
    vi.advanceTimersByTime(500);
    play();
    expect(playMock).toHaveBeenCalledTimes(1); // Should not have been called again

    // Try to play again after the interval has passed
    vi.advanceTimersByTime(501);
    play();
    expect(playMock).toHaveBeenCalledTimes(2); // Should be called now
  });

  it('should reset currentTime before playing', async () => {
    mockClient.value = true;

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    const { play } = useNotificationSound();
    audioMock.currentTime = 10; // Simulate partially played sound
    play();
    expect(audioMock.currentTime).toBe(0);
    expect(playMock).toHaveBeenCalled();
  });

  it('should handle play promise rejection gracefully', async () => {
    mockClient.value = true;

    playMock.mockRejectedValueOnce(new Error('Playback failed'));

    const { useNotificationSound } = await import('~/composables/useNotificationSound');

    const { play } = useNotificationSound();
    expect(() => play()).not.toThrow();
  });
});
