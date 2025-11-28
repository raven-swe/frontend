import { describe, it, expect, afterEach } from 'vitest';
import { buildTweetLink } from '../../../app/utils/tweetLink';

describe('buildTweetLink', () => {
  const prevWindow = (globalThis as unknown as { window?: unknown }).window;

  afterEach(() => {
    (globalThis as unknown as { window?: unknown }).window = prevWindow;
  });

  it('uses provided origin when given', () => {
    const link = buildTweetLink('user', '1', 'https://example.com');
    expect(link).toBe('https://example.com/profile/user/status/1');
  });

  it('falls back to window.location.origin when origin not provided and window exists', () => {
    (globalThis as unknown as { window?: { location: { origin: string } } }).window = {
      location: { origin: 'https://site.test' },
    };
    const link = buildTweetLink('me', '2');
    expect(link).toBe('https://site.test/profile/me/status/2');
  });

  it('uses relative link when no origin provided and window is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    const link = buildTweetLink('ssr', '3');
    expect(link).toBe('/profile/ssr/status/3');
  });
});
