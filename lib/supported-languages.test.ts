import { describe, it, expect } from 'vitest';
import { normalizeLanguage, SUPPORTED_LANGUAGES } from './supported-languages';

describe('SUPPORTED_LANGUAGES', () => {
  it('exposes the three first-class languages', () => {
    expect([...SUPPORTED_LANGUAGES]).toEqual(['typescript', 'python', 'rust']);
  });
});

describe('normalizeLanguage', () => {
  describe('canonical names', () => {
    it.each([
      ['typescript', 'typescript'],
      ['python', 'python'],
      ['rust', 'rust'],
    ] as const)('maps %s to %s', (input, expected) => {
      expect(normalizeLanguage(input)).toBe(expected);
    });
  });

  describe('aliases', () => {
    it.each([
      ['ts', 'typescript'],
      ['tsx', 'typescript'],
      ['javascript', 'typescript'],
      ['js', 'typescript'],
      ['jsx', 'typescript'],
      ['py', 'python'],
      ['rs', 'rust'],
    ] as const)('maps alias %s to %s', (input, expected) => {
      expect(normalizeLanguage(input)).toBe(expected);
    });
  });

  describe('input normalization', () => {
    it('is case-insensitive', () => {
      expect(normalizeLanguage('TS')).toBe('typescript');
      expect(normalizeLanguage('Python')).toBe('python');
      expect(normalizeLanguage('RUST')).toBe('rust');
    });

    it('trims surrounding whitespace', () => {
      expect(normalizeLanguage('  python  ')).toBe('python');
      expect(normalizeLanguage('\tts\n')).toBe('typescript');
    });

    it('combines trimming and lowercasing', () => {
      expect(normalizeLanguage('  Rust  ')).toBe('rust');
    });
  });

  describe('unknown / empty input', () => {
    it('returns null for undefined', () => {
      expect(normalizeLanguage()).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(normalizeLanguage('')).toBeNull();
    });

    it('returns null for whitespace-only input', () => {
      expect(normalizeLanguage('   ')).toBeNull();
    });

    it('returns null for an unknown language', () => {
      expect(normalizeLanguage('java')).toBeNull();
      expect(normalizeLanguage('go')).toBeNull();
      expect(normalizeLanguage('csharp')).toBeNull();
    });
  });
});
