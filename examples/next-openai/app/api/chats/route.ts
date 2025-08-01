import { getAllChats, deleteChat, createChat } from '@util/chat-store';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const chats = await getAllChats();
    return Response.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return Response.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const chatId = await createChat();
    return Response.json({ chatId });
  } catch (error) {
    console.error('Error creating chat:', error);
    return Response.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');
    
    if (!chatId) {
      return Response.json({ error: 'Chat ID is required' }, { status: 400 });
    }
    
    await deleteChat(chatId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return Response.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}