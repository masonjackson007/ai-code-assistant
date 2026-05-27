'use client';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { normalizeLanguage } from '@/lib/supported-languages';

let languagesRegistered = false;

function registerLanguages() {
  if (languagesRegistered) return;

  SyntaxHighlighter.registerLanguage('typescript', ts);
  SyntaxHighlighter.registerLanguage('python', python);
  SyntaxHighlighter.registerLanguage('rust', rust);
  languagesRegistered = true;
}

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
};

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  registerLanguages();

  const normalizedLanguage = normalizeLanguage(language);
  const trimmedCode = code.replace(/\n$/, '');

  if (!normalizedLanguage) {
    return (
      <pre
        className={`overflow-x-auto bg-zinc-950 px-4 py-3 text-sm text-zinc-100 font-mono ${className ?? ''}`}
      >
        <code>{trimmedCode}</code>
      </pre>
    );
  }

  return (
    <SyntaxHighlighter
      language={normalizedLanguage}
      style={oneDark}
      customStyle={{
        margin: 0,
        padding: '0.75rem 1rem',
        background: '#09090b',
        fontSize: '0.875rem',
      }}
      codeTagProps={{
        className: 'font-mono',
      }}
      className={className}
    >
      {trimmedCode}
    </SyntaxHighlighter>
  );
}
