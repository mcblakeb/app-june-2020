import { levenshteinDistance } from '../l-distance';

describe('levenshteinDistance', () => {
  test('returns 0 for identical strings', () => {
    expect(levenshteinDistance('kitten', 'kitten')).toBe(0);
  });

  test('returns correct distance for single substitution', () => {
    expect(levenshteinDistance('kitten', 'sitten')).toBe(1);
  });

  test('returns correct distance for insertion', () => {
    expect(levenshteinDistance('kitten', 'kittens')).toBe(1);
  });

  test('returns correct distance for deletion', () => {
    expect(levenshteinDistance('kitten', 'kittn')).toBe(1);
  });

  test('returns correct distance for completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });

  test('returns length of string when compared to empty string', () => {
    expect(levenshteinDistance('abc', '')).toBe(3);
    expect(levenshteinDistance('', 'abc')).toBe(3);
  });
});
