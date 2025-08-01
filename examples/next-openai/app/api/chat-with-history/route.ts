import { convertToModelMessages, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { saveChat } from '@util/chat-store';
import { UIMessage } from '@ai-sdk/react';

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages }) => {
      if (chatId) {
        saveChat({ chatId, messages });
      }
    },
  });
}