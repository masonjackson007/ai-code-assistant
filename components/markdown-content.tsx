'use client';

import { CodeBlock } from '@/components/code-block';

const FENCED_CODE_BLOCK = /```([\w-+#.]*)\n([\s\S]*?)```/g;

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  FENCED_CODE_BLOCK.lastIndex = 0;

  for (const match of content.matchAll(FENCED_CODE_BLOCK)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push(
        <span key={key++} className="whitespace-pre-wrap">
          {content.slice(lastIndex, matchIndex)}
        </span>,
      );
    }

    parts.push(
      <div
        key={key++}
        className="my-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
      >
        <CodeBlock
          code={match[2]}
          language={match[1] || undefined}
        />
      </div>,
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (parts.length === 0) {
    return (
      <div className={`whitespace-pre-wrap ${className ?? ''}`}>{content}</div>
    );
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={key++} className="whitespace-pre-wrap">
        {content.slice(lastIndex)}
      </span>,
    );
  }

  return <div className={className}>{parts}</div>;
}
