import { CodeBlock } from '@/components/code-block';
import type { AnalyzeCodeBugsResult, BugReport } from '@/lib/tools';

type BugReportPanelProps = {
  result: AnalyzeCodeBugsResult;
};

function BugItem({ bug }: { bug: BugReport }) {
  const isError = bug.severity === 'error';

  return (
    <li className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div
        className={`flex items-start gap-3 px-4 py-3 ${
          isError
            ? 'bg-red-50 dark:bg-red-950/30'
            : 'bg-amber-50 dark:bg-amber-950/30'
        }`}
      >
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
            isError
              ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100'
              : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
          }`}
        >
          {bug.severity}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Line {bug.line}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {bug.message}
          </p>
        </div>
      </div>
      <CodeBlock code={bug.fix} language={bug.language} />
    </li>
  );
}

export function BugReportPanel({ result }: BugReportPanelProps) {
  const { detectedBugs } = result;

  if (detectedBugs.length === 0) {
    return (
      <div className="my-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        No bugs detected.
      </div>
    );
  }

  return (
    <div className="my-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h3 className="text-sm font-semibold">Bug Analysis</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {detectedBugs.length} issue{detectedBugs.length === 1 ? '' : 's'} found
        </p>
      </div>
      <ul className="flex flex-col gap-3 p-4">
        {detectedBugs.map((bug, index) => (
          <BugItem key={`${bug.line}-${index}`} bug={bug} />
        ))}
      </ul>
    </div>
  );
}
