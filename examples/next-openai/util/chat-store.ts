import { UIMessage } from 'ai';

// Simple ID generator
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import path from 'path';

// example implementation for demo purposes
// in a real app, you would save the chat to a database
// and use the id from the database entry

export async function createChat(): Promise<string> {
  // In serverless environments, just generate an ID
  // In a real app, this would create a database entry
  const id = generateId();
  return id;
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  // In serverless environments, we can't persist to file system
  // In a real app, this would save to a database
  console.log(`Would save chat ${chatId} with ${messages.length} messages`);
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
  // In serverless environments, we can't persist to file system
  // In a real app, this would load from a database
  console.log(`Would load chat ${id}`);
  return [];
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
  // In serverless environments like Vercel, we can't write to the file system
  // Return empty array for demo purposes
  // In a real app, this would connect to a database
  return [];
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
