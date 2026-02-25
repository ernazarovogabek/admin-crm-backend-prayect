'use client'

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SozlamalarPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage: setLang, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [autoBackup, setAutoBackup] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.notifications) setNotifications(settings.notifications);
      if (settings.autoBackup !== undefined) setAutoBackup(settings.autoBackup);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify({
      notifications,
      autoBackup,
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const setTheme = (newTheme: string) => {
    if ((theme === 'light' && newTheme === 'dark') || (theme === 'dark' && newTheme === 'light')) {
      toggleTheme();
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('settings')}</h1>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
          {t('settingsSaved')}
        </div>
      )}

      {/* Tema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">{t('appearance')}</h2>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t('theme')}</label>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg border-2 transition ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <span className="dark:text-white">☀️ {t('light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg border-2 transition ${theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <span className="dark:text-white">🌙 {t('dark')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Til */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">{t('language')}</h2>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Interfeys tili</label>
          <select
            value={language}
            onChange={(e) => setLang(e.target.value as 'uz' | 'ru' | 'en')}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="uz">O'zbek</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Bildirishnomalar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">{t('notifications')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Muhim yangiliklar haqida email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Push</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Brauzer bildirishnomalar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">SMS</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">SMS bildirishnomalar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications.sms} onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Tizim */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">{t('system')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">{t('autoBackup')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Har kuni avtomatik saqlash</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="pt-4 border-t dark:border-gray-700">
            <p className="font-medium mb-2 dark:text-white">Ma'lumotlar</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">{t('export')}</button>
              <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition">{t('import')}</button>
            </div>
          </div>
          <div className="pt-4 border-t dark:border-gray-700">
            <p className="font-medium mb-2 dark:text-white">{t('security')}</p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">{t('deleteAllData')}</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
          {t('save')}
        </button>
      </div>
    </div>
  );
}
