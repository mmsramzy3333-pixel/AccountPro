import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Glasses, 
  ShieldCheck, 
  CloudCheck, 
  CloudAlert, 
  RefreshCw, 
  Plus, 
  Headphones, 
  Globe, 
  X,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { AppSettings, NotificationItem, AppLanguage, ThemeMode, NavTab } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface NavbarProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onOpenNewClient: () => void;
  onOpenNewTask: () => void;
  onOpenLiveSupport: () => void;
  onOpenSettings: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOnline: boolean;
  onTriggerSync: () => void;
  isSyncing: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenDocumentation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onOpenNewClient,
  onOpenNewTask,
  onOpenLiveSupport,
  onOpenSettings,
  activeTab,
  setActiveTab,
  isOnline,
  onTriggerSync,
  isSyncing,
  isSidebarOpen,
  onToggleSidebar,
  onOpenDocumentation,
}) => {
  const t = getT(settings.language);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const cycleTheme = () => {
    let next: ThemeMode = 'dark';
    if (settings.theme === 'dark') next = 'light';
    else if (settings.theme === 'light') next = 'eye-care';
    else next = 'dark';
    onUpdateSettings({ ...settings, theme: next });
    if (settings.soundEnabled) playAlertChime('click');
  };

  const changeLanguage = (lang: AppLanguage) => {
    onUpdateSettings({ ...settings, language: lang });
    if (settings.soundEnabled) playAlertChime('click');
  };

  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors bg-white/90 dark:bg-slate-900/90 eye-care:bg-[#f6f2e9]/95 border-slate-200 dark:border-slate-800 eye-care:border-[#e5dcce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand & Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title={isSidebarOpen ? 'إخفاء القائمة الجانبية' : 'إظهار القائمة الجانبية الذكية'}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center group"
              >
                <div className="w-5 h-5 flex flex-col justify-center gap-1">
                  <span className={`h-0.5 rounded-full bg-current transition-all ${isSidebarOpen ? 'w-5 rotate-45 translate-y-1.5' : 'w-5'}`} />
                  <span className={`h-0.5 rounded-full bg-current transition-all ${isSidebarOpen ? 'opacity-0' : 'w-3.5'}`} />
                  <span className={`h-0.5 rounded-full bg-current transition-all ${isSidebarOpen ? 'w-5 -rotate-45 -translate-y-1.5' : 'w-4'}`} />
                </div>
              </button>
            )}

            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-right focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                    {t.appName}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Shal KSA 🇸🇦
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] line-clamp-1">
                  {settings.accountManagerName.split('(')[0].trim()}
                </p>
              </div>
            </button>

            {/* Sync & Encryption Badges */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <button
                onClick={onTriggerSync}
                title={isOnline ? t.syncStatusSynced : t.syncStatusOffline}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border bg-slate-50 dark:bg-slate-800/60 eye-care:bg-[#eee7dc] border-slate-200 dark:border-slate-700/60 eye-care:border-[#e0d6c5] text-slate-600 dark:text-slate-300 eye-care:text-[#52493b] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                ) : isOnline ? (
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <CloudAlert className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-[11px] font-medium">
                  {isSyncing ? 'جاري المزامنة...' : isOnline ? t.syncNow : 'أوفلاين'}
                </span>
              </button>

              <div 
                title={t.encryptedBadge}
                className="hidden xl:flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>AES-256</span>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs sm:text-sm pr-9 pl-4 py-2 rounded-xl border bg-slate-100/80 dark:bg-slate-800/80 eye-care:bg-[#ede5d8] border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 eye-care:focus:bg-white text-slate-800 dark:text-slate-100 eye-care:text-[#2c2720] placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Tools & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Quick Add Buttons */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={onOpenNewTask}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.newTask}</span>
              </button>
              <button
                onClick={onOpenNewClient}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.newClient}</span>
              </button>
            </div>

            {/* System Documentation Center Trigger */}
            {onOpenDocumentation && (
              <button
                onClick={onOpenDocumentation}
                title="الدليل الشامل للنظام والتوثيق 📖"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 transition-all shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">دليل النظام 📖</span>
              </button>
            )}

            {/* Live Support Trigger */}
            <button
              onClick={onOpenLiveSupport}
              title={t.support}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 eye-care:text-[#52493b] hover:bg-slate-100 dark:hover:bg-slate-800 eye-care:hover:bg-[#eae1d3] transition-colors"
            >
              <Headphones className="w-5 h-5 text-indigo-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                title="التنبيهات"
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 eye-care:text-[#52493b] hover:bg-slate-100 dark:hover:bg-slate-800 eye-care:hover:bg-[#eae1d3] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifMenu && (
                <div className="absolute left-0 sm:right-auto sm:left-0 rtl:right-auto rtl:left-0 sm:rtl:left-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4 z-50 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                        التنبيهات الذكية ({unreadCount})
                      </h4>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        مسح الكل
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 eye-care:divide-[#e5dcce] py-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        لا توجد تنبيهات جديدة حالياً
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className={`py-2.5 px-2 rounded-xl cursor-pointer transition-colors ${
                            notif.read
                              ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {notif.type === 'urgent' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            ) : notif.type === 'renewal' ? (
                              <RefreshCw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 eye-care:text-[#2c2720]">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 eye-care:text-[#6a6051] mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {notif.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Dark / Light / Eye-Care) */}
            <button
              onClick={cycleTheme}
              title={`المظهر الحالي: ${settings.theme === 'dark' ? 'داكن' : settings.theme === 'light' ? 'فاتح' : 'وضع راحة العين'}`}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 eye-care:text-[#52493b] hover:bg-slate-100 dark:hover:bg-slate-800 eye-care:hover:bg-[#eae1d3] transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : settings.theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Glasses className="w-5 h-5 text-amber-600" />
              )}
            </button>

            {/* Language Switch */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700/60 eye-care:border-[#e0d6c5] text-slate-700 dark:text-slate-200 eye-care:text-[#383126] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{settings.language}</span>
              </button>
              <div className="hidden group-hover:block absolute left-0 rtl:right-auto rtl:left-0 mt-1 w-28 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => changeLanguage('ar')}
                  className="w-full text-right px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  العربية (AR)
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className="w-full text-right px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  English (EN)
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className="w-full text-right px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Français (FR)
                </button>
              </div>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              title={t.settings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 eye-care:text-[#52493b] hover:bg-slate-100 dark:hover:bg-slate-800 eye-care:hover:bg-[#eae1d3] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 -mb-px overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.dashboard}
          </button>
          <button
            onClick={() => setActiveTab('shal-studio')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'shal-studio'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400 bg-amber-50/60 dark:bg-amber-950/30'
                : 'border-transparent text-amber-700 dark:text-amber-300 hover:text-amber-800'
            }`}
          >
            <span>استوديو خدمات شال ⚡</span>
          </button>
          <button
            onClick={() => setActiveTab('retention-funnel')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'retention-funnel'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-transparent text-emerald-700 dark:text-emerald-300 hover:text-emerald-800'
            }`}
          >
            <span>فانل التجديد والأكاديمية 🎯</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 ${
              activeTab === 'clients'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.clients}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.tasks}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.reports}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>الردود الذكية 💬</span>
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dictionary'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>قاموس اللهجة السعودية 🇸🇦</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
