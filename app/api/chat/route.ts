import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { analyzeCodeBugs } from '@/lib/tools';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are a code analysis assistant. When the user shares code or asks you to review code for bugs, carefully inspect it for syntax errors, logic bugs, memory leaks, resource leaks, race conditions, and common anti-patterns.

Always respond by calling the analyzeCodeBugs tool with your findings. For each issue include:
- The line number where the problem occurs
- severity: "error" for bugs that will break execution or cause data loss, "warning" for potential issues or code smells
- A clear explanation of the bug
- A corrected code snippet showing the fix

If no issues are found, call analyzeCodeBugs with an empty bugs array.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter('poolside/laguna-xs.2:free'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      analyzeCodeBugs,
    },
    toolChoice: 'auto',
  });

  return result.toUIMessageStreamResponse();
}
