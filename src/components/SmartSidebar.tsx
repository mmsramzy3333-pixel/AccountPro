import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Compass, 
  Users, 
  CheckSquare, 
  BarChart3, 
  MessageSquareQuote, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Briefcase, 
  Flame, 
  GraduationCap, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { NavTab, AppSettings } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface SmartSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  settings: AppSettings;
  clientsCount: number;
  pendingTasksCount: number;
  onOpenNewClient: () => void;
  onOpenNewTask: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isHoverExpandable?: boolean;
  onOpenDocumentation?: () => void;
}

export const SmartSidebar: React.FC<SmartSidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  clientsCount,
  pendingTasksCount,
  onOpenNewClient,
  onOpenNewTask,
  isOpen,
  onToggleOpen,
  onOpenDocumentation,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = React.useRef<any>(null);
  const isRtl = settings.language === 'ar';

  const isExpanded = isOpen || isHovered;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (settings.soundEnabled) playAlertChime('click');
  };

  const navItems = [
    {
      tab: 'dashboard' as NavTab,
      labelAr: 'لوحة التحكم والمؤشرات',
      labelEn: 'Dashboard & Metrics',
      icon: LayoutDashboard,
      badge: null,
      color: 'blue'
    },
    {
      tab: 'shal-studio' as NavTab,
      labelAr: 'استوديو خدمات شال وصانع الرسائل',
      labelEn: 'Shal Studio & Message Builder',
      icon: Sparkles,
      badge: '16 خدمة ⚡',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20',
      color: 'amber',
      isSpecial: true
    },
    {
      tab: 'retention-funnel' as NavTab,
      labelAr: 'فانل الاسترجاع وأكاديمية التجديد',
      labelEn: 'Retention Funnel & Academy',
      icon: Compass,
      badge: '4 مراحل 🎓',
      badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20',
      color: 'emerald',
      isSpecial: true
    },
    {
      tab: 'clients' as NavTab,
      labelAr: 'ملفات العملاء والشركاء',
      labelEn: 'Clients Dossiers',
      icon: Users,
      badge: clientsCount > 0 ? `${clientsCount}` : null,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      color: 'indigo'
    },
    {
      tab: 'tasks' as NavTab,
      labelAr: 'المهام ومواعيد التجديد',
      labelEn: 'Tasks & Renewals',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse',
      color: 'rose'
    },
    {
      tab: 'reports' as NavTab,
      labelAr: 'التقارير وعوائد الاستثمار',
      labelEn: 'Reports & ROI',
      icon: BarChart3,
      badge: null,
      color: 'purple'
    },
    {
      tab: 'templates' as NavTab,
      labelAr: 'الردود السريعة ونماذج الواتساب',
      labelEn: 'Quick Replies & Templates',
      icon: MessageSquareQuote,
      badge: 'قوالب 💬',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      color: 'sky'
    },
    {
      tab: 'dictionary' as NavTab,
      labelAr: 'قاموس اللهجة السعودية الفائق',
      labelEn: 'Saudi Dialect Dictionary',
      icon: BookOpen,
      badge: '🇸🇦 شامل',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      color: 'emerald'
    }
  ];

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        onClick={onToggleOpen}
        aria-label="Toggle Side Menu"
        className={`fixed z-50 md:hidden bottom-5 ${isRtl ? 'right-5' : 'left-5'} w-13 h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Floating Smart Sidebar Container */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-18 bottom-4 z-40 transition-all duration-300 ease-out flex flex-col
          ${isRtl ? 'right-4' : 'left-4'}
          ${isExpanded ? 'w-72 sm:w-80' : 'w-18 hidden md:flex'}
          ${isOpen ? 'translate-x-0' : 'max-md:translate-x-full md:translate-x-0'}
          bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95
          backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 eye-care:border-[#e2d8c6]
          rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40
        `}
      >
        {/* Sidebar Header / Brand Mini */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 eye-care:border-[#e7ddcb] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/25">
              <Briefcase className="w-5 h-5" />
            </div>
            {isExpanded && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720] truncate">
                    وكالة شال (Shal)
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30">
                    KSA 🇸🇦
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  نظام إدارة واسترجاع العملاء
                </p>
              </div>
            )}
          </div>

          {/* Desktop Pin / Collapse Toggle */}
          <button
            onClick={onToggleOpen}
            title={isOpen ? 'تثبيت الإخفاء الذكي' : 'تثبيت القائمة مفتوحة'}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isRtl ? (
              isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            ) : (
              isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Agency Actions */}
        {isExpanded && (
          <div className="p-3 pb-1 border-b border-slate-100 dark:border-slate-800/60 eye-care:border-[#e7ddcb] flex gap-2">
            <button
              onClick={onOpenNewClient}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>عميل جديد</span>
            </button>
            <button
              onClick={onOpenNewTask}
              className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مهمة</span>
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                title={!isExpanded ? item.labelAr : undefined}
                className={`
                  w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-start transition-all duration-150
                  ${isActive 
                    ? item.isSpecial 
                      ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                      : 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }
                `}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-2 bottom-2 w-1.5 rounded-full ${item.isSpecial ? 'bg-amber-500' : 'bg-blue-600'}`} />
                )}

                {/* Icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105
                  ${isActive 
                    ? item.isSpecial 
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label and Badge */}
                {isExpanded && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5 overflow-hidden">
                    <span className="text-xs sm:text-sm truncate">
                      {isRtl ? item.labelAr : item.labelEn}
                    </span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {!isExpanded && item.badge && (
                  <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* Agency Footer Card */}
        {isExpanded ? (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e7ddcb]">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Shal Growth Engine
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    نشط ⚡
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-snug">
                  استرجع عملاءك وجدد العقود باحترافية السوق السعودي
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>16 خدمة معتمدة</span>
                  <button 
                    onClick={() => handleNavClick('shal-studio')}
                    className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-0.5 underline"
                  >
                    <span>افتح الاستوديو</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                {onOpenDocumentation && (
                  <button
                    onClick={onOpenDocumentation}
                    className="w-full mt-2.5 py-1.5 px-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>الدليل الشامل للنظام 📖</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-center">
            {onOpenDocumentation && (
              <button
                onClick={onOpenDocumentation}
                title="الدليل الشامل للنظام والتوثيق 📖"
                className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-500/25 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleNavClick('shal-studio')}
              title="استوديو وكالة شال"
              className="w-10 h-10 mx-auto rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500/25 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
