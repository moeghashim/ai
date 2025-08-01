'use client';

interface LanguageToggleProps {
  language: 'en' | 'ar';
  onLanguageChange: (language: 'en' | 'ar') => void;
}

export default function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        {language === 'ar' ? 'اللغة:' : 'Language:'}
      </span>
      <div className="relative">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              language === 'en'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('ar')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              language === 'ar'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif' }}
          >
            العربية
          </button>
        </div>
      </div>
    </div>
  );
}