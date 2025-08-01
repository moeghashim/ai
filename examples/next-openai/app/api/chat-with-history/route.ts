import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { saveChat } from '@util/chat-store';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  // Save chat after completion (simplified)
  if (chatId) {
    setTimeout(() => {
      try {
        saveChat({ chatId, messages: [...messages, { role: 'assistant', content: 'Response saved' }] });
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    }, 100);
  }

  return result.toAIStreamResponse();
}