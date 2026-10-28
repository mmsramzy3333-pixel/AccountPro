import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Mail, 
  ChevronRight, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  ShieldAlert, 
  FileSpreadsheet,
  Sliders,
  Zap,
  MessageSquare,
  Layout,
  Crown,
  Flame,
  Building2,
  ListFilter,
  Layers,
  BookOpen,
  RotateCcw,
  Compass
} from 'lucide-react';
import { Client, Task, AppSettings, SaudiTemplate, AIPrioritizationResult, NavTab, DashboardWidgetConfig } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime, defaultDashboardWidgets } from '../utils/storage';
import { AIPrioritizationWidget } from './AIPrioritizationWidget';
import { SaudiTemplatesWidget } from './SaudiTemplatesWidget';
import { QuickDailyReportWidget } from './QuickDailyReportWidget';

interface DashboardViewProps {
  clients: Client[];
  tasks: Task[];
  settings: AppSettings;
  saudiTemplates: SaudiTemplate[];
  onUpdateSaudiTemplates: (templates: SaudiTemplate[]) => void;
  onToggleTask: (taskId: string) => void;
  onSelectClient: (client: Client) => void;
  onOpenNewTask: () => void;
  onOpenNewClient: () => void;
  onOpenAiDrafter: (client?: Client) => void;
  onOpenAiAdvisor: (client?: Client) => void;
  onExportExcel: () => void;
  onOpenCustomizeDashboard: () => void;
  onLogClientActivity?: (clientId: string, title: string, desc: string) => void;
  onApplyAIOrder: (orderedTaskIds: string[]) => void;
  onNavigateToTab?: (tab: NavTab) => void;
  onOpenWinBack?: (client?: Client) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  tasks,
  settings,
  saudiTemplates,
  onUpdateSaudiTemplates,
  onToggleTask,
  onSelectClient,
  onOpenNewTask,
  onOpenNewClient,
  onOpenAiDrafter,
  onOpenAiAdvisor,
  onExportExcel,
  onOpenCustomizeDashboard,
  onLogClientActivity,
  onApplyAIOrder,
  onNavigateToTab,
  onOpenWinBack,
}) => {
  const t = getT(settings.language);
  const todayStr = new Date().toISOString().split('T')[0];

  // Priority Tasks View & Filter
  const [taskDisplayMode, setTaskDisplayMode] = useState<'hero' | 'compact'>('hero');
  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent' | 'renewals' | 'completed'>('all');

  // AI Briefing State
  const [briefing, setBriefing] = useState<{
    greeting: string;
    topPriority: string;
    briefing: string;
    energyTip: string;
  }>({
    greeting: 'صباح الإنجاز والتميز! ✨',
    topPriority: 'متابعة شركة إكسبريس ريتيل لحل مشكلة المزامنة وتأمين تجديد العقد.',
    briefing: 'أمامك اليوم 3 متابعات أساسية وشراكة في مرحلة التجديد. التركيز على سرعة المتابعة يرفع معدل رضا العملاء بنسبة 40%.',
    energyTip: 'ابدأ يومك بالمكالمة الأكثر حساسية قبل الساعة 11:00 صباحاً لتصفية ذهنك لباقي المهام.',
  });
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // AI Task Prioritization State
  const [prioritizationResult, setPrioritizationResult] = useState<AIPrioritizationResult | null>(null);
  const [loadingPrioritization, setLoadingPrioritization] = useState(false);

  // Filter Tasks (Memoized)
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate <= todayStr && !t.completed);
  }, [tasks, todayStr]);

  const completedToday = useMemo(() => {
    return tasks.filter(t => t.dueDate === todayStr && t.completed);
  }, [tasks, todayStr]);

  const topPriorities = useMemo(() => {
    return tasks.filter(t => (t.priority === 'urgent' || t.isStarred) && !t.completed).slice(0, 4);
  }, [tasks]);

  // Calculations (Memoized)
  const activeClients = useMemo(() => {
    return clients.filter(c => c.stage === 'active' || c.stage === 'onboarding' || c.stage === 'renewal');
  }, [clients]);

  const atRiskClients = useMemo(() => {
    return clients.filter(c => c.stage === 'at-risk' || c.healthScore < 60);
  }, [clients]);

  const totalARR = useMemo(() => {
    return clients.reduce((sum, c) => sum + (c.annualValue || 0), 0);
  }, [clients]);

  const avgHealth = useMemo(() => {
    return clients.length ? Math.round(clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length) : 0;
  }, [clients]);

  // Upcoming renewals (Memoized)
  const upcomingRenewals = useMemo(() => {
    return clients
      .filter(c => c.renewalDate && c.stage !== 'closed')
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
      .slice(0, 3);
  }, [clients]);

  // Generate or refresh AI Executive Briefing
  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const response = await fetch('/api/ai/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: todayTasks,
          clients: clients.map(c => ({ name: c.name, stage: c.stage, health: c.healthScore })),
          stats: { totalARR, avgHealth, atRiskCount: atRiskClients.length },
          language: settings.language,
        }),
      });
      const data = await response.json();
      if (data.briefing) {
        setBriefing(data);
        if (settings.soundEnabled) playAlertChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Generate AI Prioritization
  const handleGeneratePrioritization = async (isUserAction = false) => {
    setLoadingPrioritization(true);
    try {
      const res = await fetch('/api/ai/prioritize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: todayTasks,
          clients,
          language: settings.language,
        }),
      });
      const data = await res.json();
      if (data.scheduledTasks) {
        setPrioritizationResult(data);
        if (isUserAction && settings.soundEnabled) playAlertChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrioritization(false);
    }
  };

  // Auto trigger initial prioritization if not loaded
  useEffect(() => {
    if (!prioritizationResult && todayTasks.length > 0) {
      handleGeneratePrioritization(false);
    }
  }, []);

  // Theme styling for the dashboard banner
  const getBannerThemeClasses = () => {
    switch (settings.dashboardTheme) {
      case 'desert_gold':
        return 'bg-gradient-to-br from-amber-900 via-yellow-800 to-stone-900 border border-amber-600/40 text-amber-50 shadow-amber-900/20';
      case 'midnight':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border border-cyan-800/40 text-cyan-50 shadow-cyan-950/20';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-950 border border-emerald-700/40 text-emerald-50 shadow-emerald-950/20';
      case 'indigo_purple':
        return 'bg-gradient-to-br from-purple-900 via-indigo-800 to-slate-900 border border-purple-700/40 text-purple-50 shadow-purple-950/20';
      default:
        return 'bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl';
    }
  };

  // Sorted & Enabled Widgets with defensive merge
  const enabledWidgets = useMemo(() => {
    const existing = settings.dashboardWidgets || defaultDashboardWidgets;
    const existingIds = new Set(existing.map(w => w.id));
    const merged = [...existing];
    for (const def of defaultDashboardWidgets) {
      if (!existingIds.has(def.id)) {
        merged.push({ ...def, order: merged.length + 1 });
      }
    }
    return merged
      .filter(w => w.enabled)
      .sort((a, b) => a.order - b.order);
  }, [settings.dashboardWidgets]);

  // Widget Renderer Functions
  const renderAiBriefing = () => (
    <div key="ai_briefing" className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-xl ${getBannerThemeClasses()}`}>
      {/* Decorative shapes */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.executiveBriefing}</span>
            <span className="text-white/40">•</span>
            <span>{new Date().toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {briefing.greeting}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed font-normal opacity-90">
            {briefing.briefing}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-medium">
              <span className="font-bold text-amber-300">أولوية اليوم القصوى:</span>
              <span className="line-clamp-1">{briefing.topPriority}</span>
            </div>
            {onNavigateToTab && (
              <>
                <button
                  onClick={() => onNavigateToTab('shal-studio')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>استوديو خدمات شال (16) ⚡</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('retention-funnel')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/30 text-emerald-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-300" />
                  <span>فانل استرجاع وتجديد العملاء 🎯</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center gap-2.5 w-full lg:w-auto shrink-0">
          <button
            onClick={handleGenerateBriefing}
            disabled={loadingBriefing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loadingBriefing ? 'animate-spin' : ''}`} />
            <span>{loadingBriefing ? 'جاري التحليل...' : t.generateAiBrief}</span>
          </button>
          
          <button
            onClick={onOpenCustomizeDashboard}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all"
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>تخصيص لوحة التحكم</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAiPrioritization = () => (
    <div key="ai_prioritization">
      <AIPrioritizationWidget
        tasks={todayTasks}
        clients={clients}
        prioritizationResult={prioritizationResult}
        isLoading={loadingPrioritization}
        onRefreshPrioritization={handleGeneratePrioritization}
        onApplyAIOrder={onApplyAIOrder}
        onSelectClient={onSelectClient}
      />
    </div>
  );

  const renderMetrics = () => (
    <div key="metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1 */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d]">
            {t.activeClients}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {activeClients.length}
          </span>
          <span className="text-xs text-slate-400">من {clients.length} عميل</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {atRiskClients.length > 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {atRiskClients.length} بحاجة لتدخل عاجل
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              جميع الحسابات في أمان
            </span>
          )}
        </div>
      </div>

      {/* Metric 2 */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d]">
            {t.pendingTasks}
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {todayTasks.length}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            +{completedToday.length} أنجزت اليوم
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {topPriorities.length > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {topPriorities.length} مهام قصوى
            </span>
          ) : (
            <span>لا توجد مهام متأخرة</span>
          )}
        </div>
      </div>

      {/* Metric 3 */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d]">
            {t.portfolioHealth}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {avgHealth}%
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ممتاز
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              avgHealth >= 80 ? 'bg-emerald-500' : avgHealth >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${avgHealth}%` }}
          />
        </div>
      </div>

      {/* Metric 4 */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d]">
            {t.totalManagedValue}
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {totalARR.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {settings.currency}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>عقود مؤمنة ونشطة</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">سنوي ARR</span>
        </div>
      </div>
    </div>
  );

  const displayedTodayTasks: Task[] = useMemo(() => {
    if (taskFilter === 'urgent') {
      return todayTasks.filter(t => t.priority === 'urgent' || t.isStarred);
    }
    if (taskFilter === 'renewals') {
      return todayTasks.filter(t => t.type === 'renewal_talk');
    }
    if (taskFilter === 'completed') {
      return completedToday;
    }
    return todayTasks;
  }, [taskFilter, todayTasks, completedToday]);

  const renderTodayTasks = () => (
    <div key="today_tasks" className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
              {t.todaysPriorities}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>{todayTasks.filter(t => t.priority === 'urgent').length} عاجلة قصوى</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] mt-0.5">
            عرض مرئي وجذاب لأهم أولويات اليوم مع إمكانية التصفية والتبديل بين البطاقات البارزة والقائمة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hero vs Compact Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] p-1 rounded-xl">
            <button
              onClick={() => setTaskDisplayMode('hero')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                taskDisplayMode === 'hero'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>بطاقات بارزة</span>
            </button>
            <button
              onClick={() => setTaskDisplayMode('compact')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                taskDisplayMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>قائمة سريعة</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مهمة</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setTaskFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            taskFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          الكل ({todayTasks.length})
        </button>
        <button
          onClick={() => setTaskFilter('urgent')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
            taskFilter === 'urgent'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>الأولويات القصوى ({todayTasks.filter(t => t.priority === 'urgent' || t.isStarred).length})</span>
        </button>
        <button
          onClick={() => setTaskFilter('renewals')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            taskFilter === 'renewals'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
          }`}
        >
          تجديدات وشراكات ({todayTasks.filter(t => t.type === 'renewal_talk').length})
        </button>
        <button
          onClick={() => setTaskFilter('completed')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            taskFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
        >
          المنجزة اليوم ({completedToday.length})
        </button>
      </div>

      {/* Task Cards Deck (Hero Mode) */}
      {taskDisplayMode === 'hero' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedTodayTasks.length === 0 ? (
            <div className="col-span-full text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                لا توجد مهام في هذا التصنيف حالياً
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                جميع الأمور تسير وفق الخطة وبكفاءة عالية.
              </p>
            </div>
          ) : (
            displayedTodayTasks.map((task) => {
              const matchedClient = clients.find(c => c.id === task.clientId);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs ${
                    task.completed
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : task.priority === 'urgent'
                      ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/80 hover:shadow-md hover:border-rose-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-blue-300'
                  }`}
                >
                  {/* Priority bar at top */}
                  <div className={`absolute top-0 right-0 left-0 h-1 ${
                    task.completed 
                      ? 'bg-slate-300' 
                      : task.priority === 'urgent' 
                      ? 'bg-rose-500' 
                      : task.priority === 'high' 
                      ? 'bg-amber-500' 
                      : 'bg-blue-500'
                  }`} />

                  {/* Card Header: Badges & Time */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>أولوية قصوى</span>
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          أولوية مرتفعة
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {task.type === 'follow_up' ? 'متابعة' : task.type === 'renewal_talk' ? 'تجديد' : task.type === 'meeting' ? 'اجتماع' : 'تشغيلي'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{task.dueTime || 'اليوم'}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-bold leading-snug ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Client Info & Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                    {matchedClient ? (
                      <button
                        onClick={() => onSelectClient(matchedClient)}
                        className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{matchedClient.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 font-mono">
                          {matchedClient.healthScore}%
                        </span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">مهمة داخلية عامة</span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      {matchedClient && (
                        <button
                          onClick={() => onOpenAiDrafter(matchedClient)}
                          title="صياغة إيميل ومتابعة ذكية"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Compact List Mode */
        <div className="space-y-2">
          {displayedTodayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="text-slate-400 hover:text-emerald-500 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div className="min-w-0">
                  <span className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </span>
                  {task.clientName && (
                    <span className="mr-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      • {task.clientName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.priority === 'urgent' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    عاجل
                  </span>
                )}
                {task.dueTime && (
                  <span className="text-[11px] text-slate-400">{task.dueTime}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Summary */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>إجمالي مهام اليوم المنجزة: {completedToday.length} من {todayTasks.length + completedToday.length}</span>
        </span>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>تصدير المهام إلى إكسل</span>
        </button>
      </div>
    </div>
  );

  const renderQuickDailyReport = () => (
    <div key="quick_daily_report">
      <QuickDailyReportWidget
        clients={clients}
        tasks={tasks}
        settings={settings}
        onOpenNewTask={onOpenNewTask}
        onSelectClient={onSelectClient}
      />
    </div>
  );

  const renderSaudiTemplates = () => (
    <div key="saudi_templates">
      <SaudiTemplatesWidget
        templates={saudiTemplates}
        clients={clients}
        settings={settings}
        onUpdateTemplates={onUpdateSaudiTemplates}
        onLogActivity={onLogClientActivity}
      />
    </div>
  );

  const renderRenewals = () => (
    <div key="renewals" className="rounded-2xl p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {t.upcomingRenewals}
          </h3>
        </div>
      </div>

      <div className="space-y-2.5">
        {upcomingRenewals.map((client) => {
          const renewalDate = new Date(client.renewalDate);
          const diffDays = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 eye-care:border-[#e0d6c5] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 eye-care:bg-[#efe8dc]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                    {client.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {client.annualValue.toLocaleString()} {client.currency} / سنوي
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  diffDays <= 30
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  خلال {diffDays} يوم
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-[11px]">
                <span className="text-slate-500">صحة الحساب: {client.healthScore}%</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  عرض الخطة
                  <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAtRisk = () => (
    atRiskClients.length > 0 ? (
      <div key="at_risk" className="rounded-2xl p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm">
              حسابات تحتاج تدخلاً فورياً لتفادي الإلغاء ({atRiskClients.length})
            </h4>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
              هناك حسابات معرضة لخطر الإلغاء (Churn Risk). استخدم القوالب السعودية أو استشارة الذكاء الاصطناعي لاحتوائهم.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onOpenAiAdvisor(atRiskClients[0])}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                استشارة الذكاء الاصطناعي للحساب
              </button>
              {onOpenWinBack ? (
                <button
                  onClick={() => onOpenWinBack(atRiskClients[0])}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>دخلات استرجاع العميل 🎯</span>
                </button>
              ) : onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('dictionary')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-rose-800 hover:bg-rose-50 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>دخلات استرجاع العميل 🎯</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null
  );

  const renderQuickActions = () => (
    <div key="quick_actions" className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800/60 eye-care:bg-[#eee7dc] border border-slate-200 dark:border-slate-700/60 eye-care:border-[#e0d6c5]">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 eye-care:text-[#42392c] mb-2.5">
        إجراءات واختصارات سريعة لمدير الحساب
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => onOpenNewClient()}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-white text-right hover:border-blue-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center justify-between"
        >
          <span>+ عميل جديد</span>
          <Plus className="w-3.5 h-3.5 text-blue-500" />
        </button>

        <button
          onClick={() => onOpenNewTask()}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-white text-right hover:border-blue-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center justify-between"
        >
          <span>+ مهمة ومتابعة</span>
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
        </button>

        <button
          onClick={() => {
            if (onOpenWinBack) {
              const inactiveOrFirst = clients.find(c => c.stage === 'closed' || c.stage === 'at-risk') || clients[0];
              onOpenWinBack(inactiveOrFirst);
            } else if (onNavigateToTab) {
              onNavigateToTab('dictionary');
            }
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 bg-white dark:bg-slate-900 text-right hover:border-emerald-400 border border-emerald-300/80 dark:border-emerald-800 transition-all text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs flex items-center justify-between"
        >
          <span>استرجاع العملاء 🎯</span>
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </button>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('dictionary')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-white text-right hover:border-emerald-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center justify-between"
          >
            <span>القاموس السعودي 🇸🇦</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          </button>
        )}

        <button
          onClick={() => onOpenAiDrafter()}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-white text-right hover:border-blue-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center justify-between"
        >
          <span>إيميل ذكي</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        </button>

        <button
          onClick={onOpenCustomizeDashboard}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-white text-right hover:border-blue-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center justify-between"
        >
          <span>تخصيص اللوحة</span>
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
        </button>
      </div>
    </div>
  );

  // Map of renderers
  const widgetRenderers: Record<string, () => React.ReactNode> = {
    ai_briefing: renderAiBriefing,
    ai_prioritization: renderAiPrioritization,
    metrics: renderMetrics,
    today_tasks: renderTodayTasks,
    quick_daily_report: renderQuickDailyReport,
    saudi_templates: renderSaudiTemplates,
    renewals: renderRenewals,
    at_risk: renderAtRisk,
    quick_actions: renderQuickActions,
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Bar with Customization trigger */}
      <div className="flex items-center justify-between pb-1 no-print">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Layout className="w-3.5 h-3.5 text-blue-500" />
          <span>لوحة العمل المركزية المخصصة لمدير الحسابات</span>
        </div>

        <button
          onClick={onOpenCustomizeDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>تخصيص وترتيب اللوحة</span>
        </button>
      </div>

      {/* Render Widgets According to User's Custom Order & Preferences */}
      <div className="space-y-6">
        {enabledWidgets.map((widget: DashboardWidgetConfig) => {
          const renderer = widgetRenderers[widget.id];
          return renderer ? <React.Fragment key={widget.id}>{renderer()}</React.Fragment> : null;
        })}
      </div>
    </div>
  );
};
