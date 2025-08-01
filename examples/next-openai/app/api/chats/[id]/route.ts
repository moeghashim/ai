import { loadChat } from '@util/chat-store';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const messages = await loadChat(chatId);
    return Response.json(messages);
  } catch (error) {
    console.error('Error loading chat:', error);
    return Response.json({ error: 'Failed to load chat' }, { status: 500 });
  }
}