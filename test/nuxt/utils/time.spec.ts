import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { relativeTime, birthDateFormat, formatDate } from '@/utils/time';

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

  // Arabic locale tests
  describe('Arabic locale relativeTime', () => {
    it('returns Arabic seconds for differences under a minute', () => {
      expect(relativeTime(isoShift(0), 'ar-EG')).toBe('٠ ث');
      expect(relativeTime(isoShift(30), 'ar-EG')).toBe('٣٠ ث');
      expect(relativeTime(isoShift(59), 'ar-EG')).toBe('٥٩ ث');
      // Additional digit coverage: include digits 2,7 and 4,8 and 1,0
      expect(relativeTime(isoShift(27), 'ar-EG')).toBe('٢٧ ث');
      expect(relativeTime(isoShift(48), 'ar-EG')).toBe('٤٨ ث');
      expect(relativeTime(isoShift(10), 'ar-EG')).toBe('١٠ ث');
    });

    it('returns Arabic minutes for differences under an hour', () => {
      expect(relativeTime(isoShift(60), 'ar-EG')).toBe('١ د');
      expect(relativeTime(isoShift(2 * 60), 'ar-EG')).toBe('٢ د');
      expect(relativeTime(isoShift(59 * 60), 'ar-EG')).toBe('٥٩ د');
      // Multi-digit minute with digits 4 and 8
      expect(relativeTime(isoShift(48 * 60), 'ar-EG')).toBe('٤٨ د');
    });

    it('returns Arabic hours for differences under a day', () => {
      expect(relativeTime(isoShift(60 * 60), 'ar-EG')).toBe('١ س');
      expect(relativeTime(isoShift(23 * 60 * 60), 'ar-EG')).toBe('٢٣ س');
      // Additional hour with two digits 12
      expect(relativeTime(isoShift(12 * 60 * 60), 'ar-EG')).toBe('١٢ س');
    });

    it('returns calendar date in Arabic for >= 1 day', () => {
      const oneDayIso = isoShift(24 * 60 * 60); // 1 day ago
      const twoDaysIso = isoShift(2 * 24 * 60 * 60); // 2 days ago
      const fmt = (iso: string) =>
        new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(new Date(iso));
      expect(relativeTime(oneDayIso, 'ar-EG')).toBe(fmt(oneDayIso));
      expect(relativeTime(twoDaysIso, 'ar-EG')).toBe(fmt(twoDaysIso));
    });

    it('clamps future times to 0 Arabic seconds', () => {
      const futureIso = new Date(base.getTime() + 10_000).toISOString();
      expect(relativeTime(futureIso, 'ar-EG')).toBe('٠ ث');
    });
  });
});

describe('birthDateFormat', () => {
  it('returns empty string for empty input', () => {
    expect(birthDateFormat('', 'en-US')).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(birthDateFormat('not-a-date', 'en-US')).toBe('');
  });

  it('formats valid date in English', () => {
    // Note: Month short form may vary by locale; rely on Intl directly
    const iso = '1990-11-16T00:00:00.000Z';
    const expected = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso));
    expect(birthDateFormat(iso, 'en-US')).toBe(expected);
  });

  it('formats valid date in Arabic with Arabic-Indic digits', () => {
    const iso = '1990-11-16T00:00:00.000Z';
    const expected = new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso));
    expect(birthDateFormat(iso, 'ar-EG')).toBe(expected);
    // Ensure Arabic-Indic digits present (check a digit from the year)
    expect(birthDateFormat(iso, 'ar-EG')).toMatch(/[٠-٩]/);
  });

  it('uses default locale when locale omitted', () => {
    const iso = '1990-11-16T00:00:00.000Z';
    const expected = birthDateFormat(iso, 'en-US');
    expect(birthDateFormat(iso)).toBe(expected);
  });
});

describe('formatDate', () => {
  it('formats date-time in English', () => {
    const iso = '2025-10-22T12:34:00.000Z';
    const out = formatDate(iso, 'en-US');
    expect(out).toMatch(/Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep/); // month short
    expect(out).toMatch(/2025/);
  });

  it('formats date-time in Arabic with Arabic-Indic digits', () => {
    const iso = '2025-10-22T12:34:00.000Z';
    const out = formatDate(iso, 'ar-EG');
    // Month long or short depending on locale conventions
    expect(out).toMatch(/١٢|١٣|١٤|١٥|١٦|١٧|١٨|١٩|٢٢|٣٤/); // contains Arabic digits from hour/minute/day
    expect(out).toMatch(/[٠-٩]/); // at least one Arabic digit
  });

  it('uses default locale when locale omitted', () => {
    const iso = '2025-10-22T12:34:00.000Z';
    const expected = formatDate(iso, 'en-US');
    expect(formatDate(iso)).toBe(expected);
  });
});
