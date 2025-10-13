import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/index';

describe('Utility Function Tests', () => {
  it('cn function combines and merges class names correctly', () => {
    const result = cn('btn', 'btn-primary', 'rounded', 'btn');
    expect(result).toBe('btn btn-primary rounded btn');
  });
});
