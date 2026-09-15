import { describe, expect, test } from 'vitest';
import { getInitials } from '@/lib/utils';

describe('getInitials', () => {
  test('returns the first letter of the first two words', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
  });

  test('returns a single initial when there is one word', () => {
    expect(getInitials('Ada')).toBe('A');
  });

  test('ignores extra words beyond the first two', () => {
    expect(getInitials('Ada Augusta Lovelace')).toBe('AA');
  });

  test('returns an empty string for blank values', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
    expect(getInitials(null)).toBe('');
    expect(getInitials(undefined)).toBe('');
  });
});
