'use client';

import { useChat } from '@ai-sdk/react';
import { isToolUIPart } from 'ai';
import { useState } from 'react';
import { BugReportPanel } from '@/components/bug-report-panel';
import type { AnalyzeCodeBugsResult } from '@/lib/tools';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-3xl py-24 mx-auto stretch px-4">
      {messages.map(message => (
        <div key={message.id} className="mb-6 whitespace-pre-wrap">
          <p className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </p>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return (
                  <div key={`${message.id}-${i}`} className="text-sm leading-6">
                    {part.text}
                  </div>
                );
              default:
                if (
                  isToolUIPart(part) &&
                  part.type === 'tool-analyzeCodeBugs' &&
                  part.state === 'output-available'
                ) {
                  return (
                    <BugReportPanel
                      key={`${message.id}-${i}`}
                      result={part.output as AnalyzeCodeBugsResult}
                    />
                  );
                }

                if (
                  isToolUIPart(part) &&
                  part.type === 'tool-analyzeCodeBugs' &&
                  part.state === 'input-streaming'
                ) {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className="my-3 text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      Analyzing code...
                    </div>
                  );
                }

                return null;
            }
          })}
        </div>
      ))}

      <form
        className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl gap-2 p-4">
          <input
            className="flex-1 rounded-lg border border-zinc-300 bg-white p-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={input}
            placeholder="Paste code or ask for a bug review..."
            onChange={e => setInput(e.currentTarget.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
