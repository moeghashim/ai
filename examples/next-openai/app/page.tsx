'use client';

import { useState, useEffect } from 'react';
import { useChat, UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ChatInput from '@/component/chat-input';
import ChatSidebar from '@/component/chat-sidebar';
import LanguageToggle from '@/component/language-toggle';

const isArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
};

const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  return isArabic(text) ? 'rtl' : 'ltr';
};

export default function Chat() {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const { error, status, sendMessage, messages, regenerate, stop, setMessages } = useChat({
    id: currentChatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: currentChatId ? '/api/chat-with-history' : '/api/chat',
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: { messages, chatId: id }
      }),
    }),
  });

  const handleChatSelect = (chatId: string, chatMessages: UIMessage[]) => {
    setCurrentChatId(chatId);
    setInitialMessages(chatMessages);
    setMessages(chatMessages);
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', { method: 'POST' });
      const data = await response.json();
      if (data.chatId) {
        setCurrentChatId(data.chatId);
        setInitialMessages([]);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  useEffect(() => {
    if (!currentChatId) {
      handleNewChat();
    }
  }, []);

  // Show chat interface if there are messages
  if (messages.length > 0) {
    return (
      <div className="flex h-screen bg-white">
        <ChatSidebar
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          language={language}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header with Language Toggle */}
          <div className="border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                {language === 'ar' ? 'دردشة الذكاء الاصطناعي' : 'AI Chat'}
              </h1>
              <LanguageToggle language={language} onLanguageChange={setLanguage} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="flex flex-col w-full max-w-4xl py-8 mx-auto px-4 sm:px-6 space-y-6">
              {messages.map(m => {
                // Handle different UIMessage formats - check if message has content or parts
                const getMessageText = (message: any) => {
                  if (typeof message.content === 'string') {
                    return message.content;
                  }
                  if (message.parts && Array.isArray(message.parts)) {
                    return message.parts
                      .filter((part: any) => part.type === 'text')
                      .map((part: any) => part.text)
                      .join('');
                  }
                  return '';
                };

                const messageText = getMessageText(m);
                const direction = getTextDirection(messageText);
                const isUserMessage = m.role === 'user';
                
                return (
                  <div key={m.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                      isUserMessage 
                        ? 'bg-black text-white rounded-br-md' 
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                    }`}>
                      <div 
                        className="whitespace-pre-wrap leading-relaxed"
                        dir={direction}
                        style={{ 
                          textAlign: direction === 'rtl' ? 'right' : 'left',
                          fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif'
                        }}
                      >
                        {messageText}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(status === 'submitted' || status === 'streaming') && (
                <div className="flex justify-start w-full">
                  <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-white rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="animate-pulse text-gray-500">
                        {language === 'ar' ? 'الذكاء الاصطناعي يفكر...' : 'AI is thinking...'}
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs text-white bg-black border border-black rounded hover:bg-gray-800"
                        onClick={stop}
                      >
                        {language === 'ar' ? 'إيقاف' : 'Stop'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-start w-full">
                  <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-red-50 border border-red-200 rounded-bl-md shadow-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="text-red-600 mb-2">
                      {language === 'ar' ? 'حدث خطأ.' : 'An error occurred.'}
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm text-white bg-black border border-black rounded hover:bg-gray-800"
                      onClick={() => regenerate()}
                    >
                      {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="max-w-4xl mx-auto px-2">
              <ChatInput 
                status={status} 
                onSubmit={text => sendMessage({ text })}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen when no messages
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'ماذا يمكنني مساعدتك في بنائه؟' : 'What can I help you build?'}
          </h1>

          {/* Large Input */}
          <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                className="w-full p-6 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                placeholder={language === 'ar' ? 'اسأل v0 للبناء...' : 'Ask v0 to build...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    sendMessage({ text: e.currentTarget.value });
                    e.currentTarget.value = '';
                  }
                }}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                style={{ 
                  textAlign: language === 'ar' ? 'right' : 'left',
                  fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif'
                }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.44 11.05L12.25 2.05C11.46 1.27 10.54 1.27 9.75 2.05L8.69 3.09L15.91 10.31L21.44 11.05Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21.44 11.05L15.91 10.31L10.69 15.53C10.31 15.91 10.31 16.53 10.69 16.91L11.75 17.97C12.13 18.35 12.75 18.35 13.13 17.97L21.44 11.05Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <button 
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              onClick={() => sendMessage({ text: language === 'ar' ? 'انسخ لقطة شاشة وأنشئ تطبيق ويب' : 'Clone a screenshot and create a web app' })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'انسخ لقطة شاشة' : 'Clone a Screenshot'}
              </span>
            </button>

            <button 
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              onClick={() => sendMessage({ text: language === 'ar' ? 'استورد من Figma' : 'Import from Figma' })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-500">
                <path d="M5 7H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'استورد من Figma' : 'Import from Figma'}
              </span>
            </button>

            <button 
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              onClick={() => sendMessage({ text: language === 'ar' ? 'ارفع مشروع وحدثه' : 'Upload a project and update it' })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-500">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'ارفع مشروع' : 'Upload a Project'}
              </span>
            </button>

            <button 
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              onClick={() => sendMessage({ text: language === 'ar' ? 'أنشئ صفحة هبوط' : 'Create a landing page' })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'صفحة هبوط' : 'Landing Page'}
              </span>
            </button>

            <button 
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              onClick={() => sendMessage({ text: language === 'ar' ? 'أنشئ نموذج تسجيل' : 'Create a sign up form' })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-500">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'نموذج تسجيل' : 'Sign Up Form'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
