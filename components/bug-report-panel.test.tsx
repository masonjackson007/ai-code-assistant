import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import * as React from 'react';
import type { AnalyzeCodeBugsResult, BugReport } from '@/lib/tools';

vi.mock('@/components/code-block', () => ({
  CodeBlock: ({
    code,
    language,
  }: {
    code: string;
    language?: string;
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'code-block',
        'data-language': language ?? '',
      },
      code,
    ),
}));

import { BugReportPanel } from './bug-report-panel';

const errorBug: BugReport = {
  line: 12,
  severity: 'error',
  message: 'Null pointer dereference',
  fix: 'if (ptr !== null) { ptr.use(); }',
  language: 'typescript',
};

const warningBug: BugReport = {
  line: 47,
  severity: 'warning',
  message: 'Unused import',
  fix: '// remove import',
  language: 'python',
};

function panel(detectedBugs: BugReport[]): AnalyzeCodeBugsResult {
  return { status: 'success', detectedBugs };
}

describe('BugReportPanel — empty state', () => {
  it('renders the "No bugs detected." message when the list is empty', () => {
    render(<BugReportPanel result={panel([])} />);
    expect(screen.getByText('No bugs detected.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByText(/Bug Analysis/)).toBeNull();
  });
});

describe('BugReportPanel — populated state', () => {
  it('renders the heading and a summary count', () => {
    render(<BugReportPanel result={panel([errorBug, warningBug])} />);
    expect(screen.getByRole('heading', { name: /Bug Analysis/i })).toBeInTheDocument();
    expect(screen.getByText('2 issues found')).toBeInTheDocument();
  });

  it('uses the singular form when there is exactly one bug', () => {
    render(<BugReportPanel result={panel([errorBug])} />);
    expect(screen.getByText('1 issue found')).toBeInTheDocument();
  });

  it('renders one <li> per bug', () => {
    render(<BugReportPanel result={panel([errorBug, warningBug])} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('renders the line number, message, and severity label for each bug', () => {
    render(<BugReportPanel result={panel([errorBug, warningBug])} />);

    expect(screen.getByText('Line 12')).toBeInTheDocument();
    expect(screen.getByText('Null pointer dereference')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();

    expect(screen.getByText('Line 47')).toBeInTheDocument();
    expect(screen.getByText('Unused import')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('passes the fix and language through to CodeBlock for each bug', () => {
    render(<BugReportPanel result={panel([errorBug, warningBug])} />);

    const blocks = screen.getAllByTestId('code-block');
    expect(blocks).toHaveLength(2);

    expect(blocks[0]).toHaveAttribute('data-language', 'typescript');
    expect(blocks[0].textContent).toContain(errorBug.fix);

    expect(blocks[1]).toHaveAttribute('data-language', 'python');
    expect(blocks[1].textContent).toContain(warningBug.fix);
  });
});

describe('BugReportPanel — severity styling', () => {
  it('applies red styling to the error severity badge and container', () => {
    render(<BugReportPanel result={panel([errorBug])} />);
    const item = screen.getByRole('listitem');
    const badge = within(item).getByText('error');

    expect(badge.className).toMatch(/red/);
    expect(badge.className).not.toMatch(/amber/);

    const container = badge.parentElement as HTMLElement;
    expect(container.className).toMatch(/red/);
    expect(container.className).not.toMatch(/amber/);
  });

  it('applies amber styling to the warning severity badge and container', () => {
    render(<BugReportPanel result={panel([warningBug])} />);
    const item = screen.getByRole('listitem');
    const badge = within(item).getByText('warning');

    expect(badge.className).toMatch(/amber/);
    expect(badge.className).not.toMatch(/red/);

    const container = badge.parentElement as HTMLElement;
    expect(container.className).toMatch(/amber/);
    expect(container.className).not.toMatch(/red/);
  });

  it('keeps error and warning styles isolated when both are present', () => {
    render(<BugReportPanel result={panel([errorBug, warningBug])} />);
    const items = screen.getAllByRole('listitem');

    const errorBadge = within(items[0]).getByText('error');
    expect(errorBadge.className).toMatch(/red/);
    expect(errorBadge.className).not.toMatch(/amber/);

    const warningBadge = within(items[1]).getByText('warning');
    expect(warningBadge.className).toMatch(/amber/);
    expect(warningBadge.className).not.toMatch(/red/);
  });
});
