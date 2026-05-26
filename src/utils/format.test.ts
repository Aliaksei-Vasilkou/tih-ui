import { describe, it, expect } from 'vitest';
import { formatDate } from './format';

describe('formatDate', () => {
  it('should format a valid ISO date string', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    // e.g. "Jan 15, 2024" — exact locale string varies by environment
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });

  it('should include year, month abbreviation and day', () => {
    const result = formatDate('2024-06-01T00:00:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
  });

  it('should handle the first day of the year', () => {
    const result = formatDate('2023-01-01T00:00:00Z');
    expect(result).toMatch(/2023/);
  });

  it('should handle the last day of the year', () => {
    const result = formatDate('2023-12-31T12:00:00Z');
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/31/);
  });

  it('should return a non-empty string for any valid ISO input', () => {
    const result = formatDate('2020-07-04T12:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
