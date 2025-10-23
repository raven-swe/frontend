import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { relativeTime } from '@/utils/time';

// Helper to generate an ISO string offset by N seconds from a fixed base time
const base = new Date('2025-10-22T12:00:00.000Z');
const isoShift = (seconds: number) => new Date(base.getTime() - seconds * 1000).toISOString();

describe('Time Utils: relativeTime', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(base);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns seconds for differences under a minute', () => {
    expect(relativeTime(isoShift(0))).toBe('0s');
    expect(relativeTime(isoShift(30))).toBe('30s');
    expect(relativeTime(isoShift(59))).toBe('59s');
  });

  it('returns minutes for differences under an hour', () => {
    expect(relativeTime(isoShift(60))).toBe('1m');
    expect(relativeTime(isoShift(2 * 60))).toBe('2m');
    expect(relativeTime(isoShift(59 * 60))).toBe('59m');
  });

  it('returns hours for differences under a day', () => {
    expect(relativeTime(isoShift(60 * 60))).toBe('1h');
    expect(relativeTime(isoShift(23 * 60 * 60))).toBe('23h');
  });

  it('returns days for differences under a month (30d)', () => {
    expect(relativeTime(isoShift(24 * 60 * 60))).toBe('1d');
    expect(relativeTime(isoShift(29 * 24 * 60 * 60))).toBe('29d');
  });

  it('returns months for differences of 30 days or more', () => {
    // 30 days treated as a month via 30*24*60*60 = 2,592,000 seconds
    expect(relativeTime(isoShift(30 * 24 * 60 * 60))).toBe('1mo');
    expect(relativeTime(isoShift(60 * 24 * 60 * 60))).toBe('2mo');
  });

  it('clamps future times to 0 seconds', () => {
    // Pass an ISO in the future (10s ahead of now) => diff negative => returns 0s
    const futureIso = new Date(base.getTime() + 10_000).toISOString();
    expect(relativeTime(futureIso)).toBe('0s');
  });
});
