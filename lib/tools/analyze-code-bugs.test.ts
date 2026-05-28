import { describe, it, expect } from 'vitest';
import {
  analyzeCodeBugs,
  analyzeCodeBugsInputSchema,
  bugReportSchema,
  type BugReport,
} from './analyze-code-bugs';

const validBug: BugReport = {
  line: 5,
  severity: 'error',
  message: 'Unused variable foo',
  fix: 'Remove the declaration',
  language: 'typescript',
};

describe('bugReportSchema', () => {
  it('accepts a well-formed report', () => {
    expect(bugReportSchema.safeParse(validBug).success).toBe(true);
  });

  it.each(['error', 'warning'] as const)('accepts severity %s', (severity) => {
    expect(bugReportSchema.safeParse({ ...validBug, severity }).success).toBe(
      true,
    );
  });

  it('rejects unknown severity values', () => {
    const r = bugReportSchema.safeParse({ ...validBug, severity: 'critical' });
    expect(r.success).toBe(false);
  });

  it.each(['typescript', 'python', 'rust'] as const)(
    'accepts language %s',
    (language) => {
      expect(
        bugReportSchema.safeParse({ ...validBug, language }).success,
      ).toBe(true);
    },
  );

  it('rejects unknown languages', () => {
    const r = bugReportSchema.safeParse({ ...validBug, language: 'java' });
    expect(r.success).toBe(false);
  });

  it('rejects a non-numeric line number', () => {
    const r = bugReportSchema.safeParse({ ...validBug, line: '5' });
    expect(r.success).toBe(false);
  });

  it.each(['line', 'severity', 'message', 'fix', 'language'] as const)(
    'rejects when %s is missing',
    (field) => {
      const partial = { ...validBug } as Record<string, unknown>;
      delete partial[field];
      const r = bugReportSchema.safeParse(partial);
      expect(r.success).toBe(false);
    },
  );
});

describe('analyzeCodeBugsInputSchema', () => {
  it('accepts an empty bugs array', () => {
    expect(analyzeCodeBugsInputSchema.safeParse({ bugs: [] }).success).toBe(
      true,
    );
  });

  it('accepts a list of valid bug reports', () => {
    const r = analyzeCodeBugsInputSchema.safeParse({
      bugs: [
        validBug,
        { ...validBug, line: 10, severity: 'warning', language: 'rust' },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejects when bugs is missing', () => {
    expect(analyzeCodeBugsInputSchema.safeParse({}).success).toBe(false);
  });

  it('rejects when bugs is not an array', () => {
    expect(
      analyzeCodeBugsInputSchema.safeParse({ bugs: 'nope' }).success,
    ).toBe(false);
  });

  it('rejects when any bug in the array is invalid', () => {
    const r = analyzeCodeBugsInputSchema.safeParse({
      bugs: [validBug, { ...validBug, severity: 'fatal' }],
    });
    expect(r.success).toBe(false);
  });
});

describe('analyzeCodeBugs.execute', () => {
  // The ai SDK's tool() helper wraps execute with a slightly opinionated signature
  // (input, options). We don't care about the options shape here — the executor
  // only uses the input — so we keep the assertion focused on pass-through behavior.
  type ExecuteFn = (
    input: { bugs: BugReport[] },
    options: unknown,
  ) => Promise<{ status: 'success'; detectedBugs: BugReport[] }>;

  const execute = analyzeCodeBugs.execute as unknown as ExecuteFn;

  it('returns the bugs unchanged with a success status', async () => {
    const bugs: BugReport[] = [validBug];
    const result = await execute({ bugs }, {});
    expect(result).toEqual({ status: 'success', detectedBugs: bugs });
  });

  it('returns an empty detectedBugs list when no bugs are provided', async () => {
    const result = await execute({ bugs: [] }, {});
    expect(result).toEqual({ status: 'success', detectedBugs: [] });
  });

  it('preserves the bug array reference (pass-through)', async () => {
    const bugs: BugReport[] = [validBug];
    const result = await execute({ bugs }, {});
    expect(result.detectedBugs).toBe(bugs);
  });
});
