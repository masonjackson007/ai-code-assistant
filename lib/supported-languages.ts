export const SUPPORTED_LANGUAGES = ['typescript', 'python', 'rust'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  javascript: 'typescript',
  js: 'typescript',
  jsx: 'typescript',
  python: 'python',
  py: 'python',
  rust: 'rust',
  rs: 'rust',
};

export function normalizeLanguage(
  language?: string,
): SupportedLanguage | null {
  if (!language) return null;

  const key = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[key] ?? null;
}
