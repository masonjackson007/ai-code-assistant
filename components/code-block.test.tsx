import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

// vi.mock factories are hoisted above local `const` declarations, so anything
// the factory references must be set up with vi.hoisted().
const { registerLanguageMock } = vi.hoisted(() => ({
  registerLanguageMock: vi.fn(),
}));

vi.mock('react-syntax-highlighter', async () => {
  const ReactImport = await import('react');
  function PrismLight({
    children,
    language,
    className,
  }: {
    children?: React.ReactNode;
    language?: string;
    className?: string;
    style?: unknown;
    customStyle?: unknown;
    codeTagProps?: unknown;
  }) {
    return ReactImport.createElement(
      'pre',
      {
        'data-testid': 'prism',
        'data-language': language ?? '',
        className,
      },
      children,
    );
  }
  PrismLight.registerLanguage = registerLanguageMock;
  return { PrismLight };
});

vi.mock('react-syntax-highlighter/dist/esm/languages/prism/typescript', () => ({
  default: { __lang: 'typescript' },
}));
vi.mock('react-syntax-highlighter/dist/esm/languages/prism/python', () => ({
  default: { __lang: 'python' },
}));
vi.mock('react-syntax-highlighter/dist/esm/languages/prism/rust', () => ({
  default: { __lang: 'rust' },
}));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: { __style: 'oneDark' },
}));

import { CodeBlock } from './code-block';

describe('CodeBlock — known languages use the syntax highlighter', () => {
  it.each([
    ['typescript', 'typescript'],
    ['ts', 'typescript'],
    ['javascript', 'typescript'],
    ['js', 'typescript'],
    ['python', 'python'],
    ['py', 'python'],
    ['rust', 'rust'],
    ['rs', 'rust'],
  ] as const)(
    'renders Prism with normalized language %s -> %s',
    (input, expected) => {
      render(<CodeBlock code="const x = 1;" language={input} />);
      const prism = screen.getByTestId('prism');
      expect(prism).toHaveAttribute('data-language', expected);
      expect(prism).toHaveTextContent('const x = 1;');
    },
  );

  it('passes a custom className through to the highlighter', () => {
    render(
      <CodeBlock
        code="x"
        language="typescript"
        className="my-custom-class"
      />,
    );
    expect(screen.getByTestId('prism')).toHaveClass('my-custom-class');
  });

  it('registers the supported languages with Prism on first render', async () => {
    // code-block.tsx caches registration in a module-level singleton, so we
    // need a fresh module evaluation to observe the registerLanguage calls.
    vi.resetModules();
    registerLanguageMock.mockClear();
    const { CodeBlock: FreshCodeBlock } = await import('./code-block');

    render(<FreshCodeBlock code="x" language="typescript" />);

    const languagesRegistered = registerLanguageMock.mock.calls.map(
      ([name]) => name,
    );
    expect(languagesRegistered).toEqual(
      expect.arrayContaining(['typescript', 'python', 'rust']),
    );
  });
});

describe('CodeBlock — unknown / missing languages fall back to <pre>', () => {
  it('renders a plain <pre><code> when language is undefined', () => {
    const { container } = render(<CodeBlock code="hello world" />);
    expect(screen.queryByTestId('prism')).toBeNull();
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')).toHaveTextContent('hello world');
  });

  it('renders a plain <pre><code> when language is unsupported', () => {
    const { container } = render(
      <CodeBlock code="System.out.println();" language="java" />,
    );
    expect(screen.queryByTestId('prism')).toBeNull();
    expect(container.querySelector('code')).toHaveTextContent(
      'System.out.println();',
    );
  });

  it('applies a custom className to the fallback <pre>', () => {
    const { container } = render(
      <CodeBlock code="x" language="java" className="extra" />,
    );
    expect(container.querySelector('pre')).toHaveClass('extra');
  });
});

describe('CodeBlock — trailing newline trim', () => {
  it('strips a single trailing newline in the highlighter branch', () => {
    render(<CodeBlock code={'foo\n'} language="typescript" />);
    expect(screen.getByTestId('prism').textContent).toBe('foo');
  });

  it('strips a single trailing newline in the fallback <pre> branch', () => {
    const { container } = render(<CodeBlock code={'bar\n'} />);
    expect(container.querySelector('code')?.textContent).toBe('bar');
  });

  it('only strips the final newline, not earlier ones', () => {
    const { container } = render(<CodeBlock code={'a\nb\n'} />);
    expect(container.querySelector('code')?.textContent).toBe('a\nb');
  });

  it('leaves code without a trailing newline untouched', () => {
    const { container } = render(<CodeBlock code={'baz'} />);
    expect(container.querySelector('code')?.textContent).toBe('baz');
  });
});
