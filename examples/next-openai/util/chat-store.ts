import { generateId, UIMessage } from 'ai';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import path from 'path';

// example implementation for demo purposes
// in a real app, you would save the chat to a database
// and use the id from the database entry

export async function createChat(): Promise<string> {
  const id = generateId();
  await writeFile(getChatFile(id), '[]');
  return id;
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  await writeFile(getChatFile(chatId), JSON.stringify(messages, null, 2));
}

export async function appendMessageToChat({
  chatId,
  message,
}: {
  chatId: string;
  message: UIMessage;
}): Promise<void> {
  const file = getChatFile(chatId);
  const messages = await loadChat(chatId);
  messages.push(message);
  await writeFile(file, JSON.stringify(messages, null, 2));
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  try {
    const content = await readFile(getChatFile(id), 'utf8');
    if (!content.trim()) {
      return [];
    }
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading chat ${id}:`, error);
    return [];
  }
}

function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), '.chats');

  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });

  const chatFile = path.join(chatDir, `${id}.json`);

  if (!existsSync(chatFile)) {
    writeFile(chatFile, '[]');
  }

  return chatFile;
}

export async function appendStreamId({
  chatId,
  streamId,
}: {
  chatId: string;
  streamId: string;
}) {
  const file = getStreamsFile(chatId);
  const streams = await loadStreams(chatId);
  streams.push(streamId);
  await writeFile(file, JSON.stringify(streams, null, 2));
}

export async function loadStreams(chatId: string): Promise<string[]> {
  const file = getStreamsFile(chatId);
  if (!existsSync(file)) return [];
  return JSON.parse(await readFile(file, 'utf8'));
}

function getStreamsFile(chatId: string): string {
  const chatDir = path.join(process.cwd(), '.streams');
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${chatId}.json`);
}

export interface ChatSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export async function getAllChats(): Promise<ChatSummary[]> {
  const chatDir = path.join(process.cwd(), '.chats');
  
  if (!existsSync(chatDir)) {
    return [];
  }

  const files = await readdir(chatDir);
  const chatFiles = files.filter(file => file.endsWith('.json'));
  
  const chats: ChatSummary[] = [];
  
  for (const file of chatFiles) {
    try {
      const id = path.basename(file, '.json');
      const messages = await loadChat(id);
      
      if (messages.length === 0) continue;
      
      const filePath = path.join(chatDir, file);
      const stats = await stat(filePath);
      
      const lastMessage = messages[messages.length - 1];
      const firstMessage = messages.find(m => m.role === 'user');
      
      // Handle different UIMessage formats - check if message has content or parts
      const getMessageText = (message: any) => {
        if (typeof message.content === 'string') {
          return message.content;
        }
        if (message.parts && Array.isArray(message.parts)) {
          return message.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join(' ');
        }
        return '';
      };

      const firstMessageText = getMessageText(firstMessage);
      const title = firstMessageText.slice(0, 50) + (firstMessageText.length > 50 ? '...' : '') || 'New Chat';
      
      const lastMessageText = getMessageText(lastMessage).slice(0, 100) + (getMessageText(lastMessage).length > 100 ? '...' : '');
      
      chats.push({
        id,
        title,
        lastMessage: lastMessageText,
        timestamp: stats.mtime,
        messageCount: messages.length,
      });
    } catch (error) {
      console.error(`Error loading chat ${file}:`, error);
    }
  }
  
  return chats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function deleteChat(chatId: string): Promise<void> {
  const chatFile = getChatFile(chatId);
  const streamsFile = getStreamsFile(chatId);
  
  if (existsSync(chatFile)) {
    await writeFile(chatFile, '');
  }
  
  if (existsSync(streamsFile)) {
    await writeFile(streamsFile, '');
  }
}
