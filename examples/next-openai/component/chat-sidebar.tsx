'use client';

import { useState, useEffect } from 'react';
import { ChatSummary } from '@util/chat-store';

const isArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
};

const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  return isArabic(text) ? 'rtl' : 'ltr';
};

interface ChatSidebarProps {
  currentChatId?: string;
  onChatSelect: (chatId: string, messages: any[]) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  language?: 'en' | 'ar';
}

export default function ChatSidebar({
  currentChatId,
  onChatSelect,
  onNewChat,
  isCollapsed,
  onToggle,
  language = 'en',
}: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', { method: 'POST' });
      const data = await response.json();
      if (data.chatId) {
        onNewChat();
        fetchChats();
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMessage = language === 'ar' 
      ? 'هل أنت متأكد من أنك تريد حذف هذه المحادثة؟' 
      : 'Are you sure you want to delete this chat?';
    if (!confirm(confirmMessage)) return;
    
    try {
      await fetch(`/api/chats?id=${chatId}`, { method: 'DELETE' });
      fetchChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleChatClick = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const messages = await response.json();
        onChatSelect(chatId, messages);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    } flex flex-col h-screen`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title={language === 'ar' 
              ? (isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي')
              : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {!isCollapsed && (
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
            >
              {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
            </button>
          )}
        </div>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold mt-2 text-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'تاريخ المحادثات' : 'Chat History'}
          </h2>
        )}
      </div>

      {/* Chat List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'لا توجد محادثات بعد' : 'No chats yet'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {chats.map((chat) => {
                const titleDirection = getTextDirection(chat.title);
                const messageDirection = getTextDirection(chat.lastMessage);
                
                return (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      currentChatId === chat.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-medium text-sm truncate ${
                            currentChatId === chat.id ? 'text-white' : 'text-gray-900'
                          }`}
                          dir={titleDirection}
                          style={{ 
                            textAlign: titleDirection === 'rtl' ? 'right' : 'left',
                            fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif'
                          }}
                        >
                          {chat.title}
                        </h3>
                        <p 
                          className={`text-xs mt-1 line-clamp-2 ${
                            currentChatId === chat.id ? 'text-gray-300' : 'text-gray-500'
                          }`}
                          dir={messageDirection}
                          style={{ 
                            textAlign: messageDirection === 'rtl' ? 'right' : 'left',
                            fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif'
                          }}
                        >
                          {chat.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${
                            currentChatId === chat.id ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </span>
                          <span className={`text-xs ${
                            currentChatId === chat.id ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                            {language === 'ar' 
                              ? `${chat.messageCount} رسالة`
                              : `${chat.messageCount} messages`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className={`ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 ${
                          currentChatId === chat.id ? 'text-gray-400' : 'text-gray-400'
                        }`}
                        title={language === 'ar' ? 'حذف المحادثة' : 'Delete chat'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.4477 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}