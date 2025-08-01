import { useState } from 'react';

const isArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
};

const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  return isArabic(text) ? 'rtl' : 'ltr';
};

export default function ChatInput({
  status,
  onSubmit,
  stop,
  language = 'en',
}: {
  status: string;
  onSubmit: (text: string) => void;
  stop?: () => void;
  language?: 'en' | 'ar';
}) {
  const [text, setText] = useState('');
  const direction = getTextDirection(text);

  return (
    <div className="relative">
      <form
        onSubmit={e => {
          e.preventDefault();
          if (text.trim() === '') return;
          onSubmit(text);
          setText('');
        }}
        className="flex gap-3"
      >
        <button
          type="submit"
          disabled={text.trim() === '' || status !== 'ready'}
          className={`py-4 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium ${
            language === 'en' ? 'px-32 min-w-[960px]' : 'px-16 min-w-[480px]'
          }`}
        >
          {language === 'ar' ? 'إرسال' : 'Send'}
        </button>
        <input
          className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
          placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
          disabled={status !== 'ready'}
          value={text}
          onChange={e => setText(e.target.value)}
          dir={direction}
          style={{ 
            textAlign: direction === 'rtl' ? 'right' : 'left',
            fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif'
          }}
        />
      </form>
    </div>
  );
}
