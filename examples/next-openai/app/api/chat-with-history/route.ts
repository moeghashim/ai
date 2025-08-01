import { OpenAIStream, StreamingTextResponse } from 'ai';
import { openai } from '@ai-sdk/openai';
import { saveChat } from '@util/chat-store';

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages are required', { status: 400 });
    }

    // Create OpenAI chat completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

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

    // Convert the response to a streaming text response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}