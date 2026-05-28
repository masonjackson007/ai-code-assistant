import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

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

import { MarkdownContent } from './markdown-content';

describe('MarkdownContent — plain text (no fenced blocks)', () => {
  it('renders the content as plain text when there are no code fences', () => {
    render(<MarkdownContent content="Just regular prose, nothing to highlight." />);
    expect(
      screen.getByText('Just regular prose, nothing to highlight.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('code-block')).toBeNull();
  });

  it('applies className to the wrapper in the plain-text branch', () => {
    const { container } = render(
      <MarkdownContent content="plain" className="my-wrapper" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-wrapper');
    expect(wrapper).toHaveClass('whitespace-pre-wrap');
  });

  it('preserves empty strings without crashing', () => {
    const { container } = render(<MarkdownContent content="" />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByTestId('code-block')).toBeNull();
  });
});

describe('MarkdownContent — single fenced block', () => {
  it('extracts a single fenced code block with its language', () => {
    const content = [
      'Here is some code:',
      '```typescript',
      'const x = 1;',
      '```',
      'And some trailing prose.',
    ].join('\n');

    render(<MarkdownContent content={content} />);

    const block = screen.getByTestId('code-block');
    expect(block).toHaveAttribute('data-language', 'typescript');
    expect(block.textContent).toContain('const x = 1;');

    expect(screen.getByText(/Here is some code:/)).toBeInTheDocument();
    expect(
      screen.getByText(/And some trailing prose\./),
    ).toBeInTheDocument();
  });

  it('passes language=undefined when the fence has no language tag', () => {
    const content = '```\nsome code\n```';
    render(<MarkdownContent content={content} />);
    const block = screen.getByTestId('code-block');
    expect(block).toHaveAttribute('data-language', '');
    expect(block.textContent).toContain('some code');
  });

  it('renders only the code block when the content has no surrounding prose', () => {
    const content = '```python\nprint("hi")\n```';
    render(<MarkdownContent content={content} />);

    const blocks = screen.getAllByTestId('code-block');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toHaveAttribute('data-language', 'python');
    expect(blocks[0].textContent).toContain('print("hi")');
  });
});

describe('MarkdownContent — multiple fenced blocks', () => {
  it('renders all blocks in order with their respective languages', () => {
    const content = [
      'First snippet:',
      '```typescript',
      'const a = 1;',
      '```',
      'Then:',
      '```python',
      'b = 2',
      '```',
      'Done.',
    ].join('\n');

    render(<MarkdownContent content={content} />);

    const blocks = screen.getAllByTestId('code-block');
    expect(blocks).toHaveLength(2);

    expect(blocks[0]).toHaveAttribute('data-language', 'typescript');
    expect(blocks[0].textContent).toContain('const a = 1;');

    expect(blocks[1]).toHaveAttribute('data-language', 'python');
    expect(blocks[1].textContent).toContain('b = 2');

    expect(screen.getByText(/First snippet:/)).toBeInTheDocument();
    expect(screen.getByText(/Then:/)).toBeInTheDocument();
    expect(screen.getByText(/Done\./)).toBeInTheDocument();
  });

  it('preserves the relative ordering of prose between blocks', () => {
    const content =
      'A\n```ts\nfoo\n```\nB\n```rs\nbar\n```\nC';
    const { container } = render(<MarkdownContent content={content} />);

    const wrapperChildren = Array.from(
      (container.firstChild as HTMLElement).childNodes,
    );

    const textOf = (node: ChildNode) =>
      (node.textContent ?? '').replace(/\s+/g, ' ').trim();

    const order = wrapperChildren.map(textOf);
    const firstA = order.findIndex((t) => t.includes('A'));
    const firstFoo = order.findIndex((t) => t.includes('foo'));
    const firstB = order.findIndex((t) => t.includes('B'));
    const firstBar = order.findIndex((t) => t.includes('bar'));
    const firstC = order.findIndex((t) => t.includes('C'));

    expect(firstA).toBeLessThan(firstFoo);
    expect(firstFoo).toBeLessThan(firstB);
    expect(firstB).toBeLessThan(firstBar);
    expect(firstBar).toBeLessThan(firstC);
  });
});

describe('MarkdownContent — className on the fenced-branch wrapper', () => {
  it('applies the className when there are code blocks', () => {
    const content = '```ts\nx\n```';
    const { container } = render(
      <MarkdownContent content={content} className="outer-class" />,
    );
    expect(container.firstChild).toHaveClass('outer-class');
  });
});
