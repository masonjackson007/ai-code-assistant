import { tool } from 'ai';
import { z } from 'zod';

export const bugReportSchema = z.object({
  line: z.number().describe('The line number where the bug is located'),
  severity: z.enum(['error', 'warning']),
  message: z.string().describe('Explanation of the bug'),
  fix: z.string().describe('The corrected code snippet'),
});

export const analyzeCodeBugsInputSchema = z.object({
  bugs: z
    .array(bugReportSchema)
    .describe('Structured list of detected syntax errors, memory leaks, or bugs'),
});

export type BugReport = z.infer<typeof bugReportSchema>;
export type AnalyzeCodeBugsResult = {
  status: 'success';
  detectedBugs: BugReport[];
};

export const analyzeCodeBugs = tool({
  description:
    'Analyze code text and return a structured list of syntax errors, memory leaks, or bugs.',
  inputSchema: analyzeCodeBugsInputSchema,
  execute: async ({ bugs }): Promise<AnalyzeCodeBugsResult> => {
    return { status: 'success', detectedBugs: bugs };
  },
});
