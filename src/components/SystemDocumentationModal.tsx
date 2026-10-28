import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Building2, 
  Sliders, 
  GripVertical, 
  Search, 
  CheckCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Layers, 
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppSettings } from '../types';
import { calculateClientHealth } from '../utils/clientHealth';

interface SystemDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

type DocCategory = 
  | 'overview' 
  | 'health_score' 
  | 'saudi_templates' 
  | 'calendar_tasks' 
  | 'shal_studio' 
  | 'am_playbook' 
  | 'dashboard_reports';

export const SystemDocumentationModal: React.FC<SystemDocumentationModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<DocCategory>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Health Score Simulator State
  const [simDays, setSimDays] = useState<number>(2);
  const [simActivities, setSimActivities] = useState<number>(6);
  const [simCompletedTasks, setSimCompletedTasks] = useState<number>(4);
  const [simTotalTasks, setSimTotalTasks] = useState<number>(5);

  // Simulated Health Report
  const simulatedReport = useMemo(() => {
    const mockClient: any = {
      id: 'sim-client',
      name: 'شركة تجربة المحاكاة',
      lastContactDate: new Date(Date.now() - simDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activities: Array.from({ length: simActivities }).map((_, i) => ({ id: `act-${i}`, type: 'call' })),
      stage: 'active',
      healthScore: 80,
    };

    const mockTasks: any = Array.from({ length: simTotalTasks }).map((_, i) => ({
      id: `task-${i}`,
      clientId: 'sim-client',
      completed: i < simCompletedTasks,
    }));

    return calculateClientHealth(mockClient, mockTasks);
  }, [simDays, simActivities, simCompletedTasks, simTotalTasks]);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                  الدليل الشامل والتوثيق المرجعي لمنصة وكالة شال 📖
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  إصدار إدارة الحسابات
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                دليل تفاعلي متكامل يشرح كل قسم وميزة ونظام حساب في التطبيق لمديري الحسابات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Navigation Bar */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-950/40 eye-care:bg-[#ede5d8] border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'overview', label: '🌟 الرؤية والنظام', count: '1' },
              { id: 'health_score', label: '🛡️ مؤشر صحة العميل', count: '2' },
              { id: 'saudi_templates', label: '💬 القوالب والرسائل', count: '3' },
              { id: 'calendar_tasks', label: '📅 التقويم والمهام', count: '4' },
              { id: 'shal_studio', label: '🏢 استوديو شال', count: '5' },
              { id: 'am_playbook', label: '🚀 دليل العمل اليومي', count: '6' },
              { id: 'dashboard_reports', label: '📊 القيادة والتصدير', count: '7' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DocCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Search in doc */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في محتوى الدليل..."
              className="w-full text-xs pr-8 pl-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* TAB 1: OVERVIEW & VISION */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Hero Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>منصة Shal Agency لإدارة الحسابات والاستبقاء</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    نظام استباقي ذكي صُمم لحماية وتنمية عقود التسويق في السوق السعودي
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    الهدف الأساسي للمنصة هو تحويل إدارة العملاء من مجرد متابعة روتينية صامتة إلى نظام عمل حي يمنع تسرب العملاء (Churn Prevention)، ويرفع نسب تجديد العقود السنوية، ويدير التواصل بأعلى معايير اللهجة واللباقة السعودية.
                  </p>
                </div>
              </div>

              {/* Core Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                    1
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">منع تسرب العقود (Zero Churn)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    نظام إنذار مبكر يعتمد على مؤشر صحة العميل لكشف الحسابات الخاملة أو المعرضة للخطر قبل فوات الأوان.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                    2
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">تواصل سعودي أصيل ومزدوج</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    مكتبة ضخمة وصانع ردود ذكي بنسختين (عادية مفصلة + مختصرة سريعة للواتساب) تراعي اللهجة والجنس والموقف.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                    3
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">إنتاجية استثنائية وجدولة مرنة</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    تقويم شهري وجدول زمني بالسحب والإفلات مع تمييز لوني لكل عميل لسرعة تنظيم أولويات اليوم والشهر.
                  </p>
                </div>
              </div>

              {/* Map of All 7 App Modules */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>خريطة الأقسام السبعة في المنصة:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">1. لوحة القيادة</strong>
                    <span className="text-slate-500">المؤشرات الحيوية، الـ ARR، والمهام العاجلة</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">2. ملفات العملاء</strong>
                    <span className="text-slate-500">بيانات العملاء، مؤشر الصحة، وسجل التفاعلات</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">3. قائمة المهام والتقويم</strong>
                    <span className="text-slate-500">القائمة، الجدول الزمني، والتقويم بالسحب والإفلات</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">4. قوالب الرسائل</strong>
                    <span className="text-slate-500">صيغ التأكيد والتسليم والمتابعة بنسختين</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">5. صانع الردود الذكي</strong>
                    <span className="text-slate-500">كتابة ردود فورية بحسب الموقف واللهجة عبر الذكاء</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">6. استوديو وكالة شال</strong>
                    <span className="text-slate-500">عروض الـ 16 خدمة ودليل الرد على الاعتراضات</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-800 dark:text-slate-200 font-bold">7. المعجم والتقارير</strong>
                    <span className="text-slate-500">معجم المصطلحات السعودية، تصدير Excel، والإعدادات</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HEALTH SCORE & FORMULA SIMULATOR */}
          {activeTab === 'health_score' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Formula Explanation Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    كيف يتم احتساب مؤشر صحة العميل (Customer Health Score)؟
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  يقوم النظام بحساب مؤشر رقمي من 0% إلى 100% لكل عميل بشكل ديناميكي ومستمر بناءً على 3 ركائز رئيسية موزونة:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                      1. سرعة آخر تواصل (35%)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      كلما كان آخر تواصل حديثاً (اليوم أو خلال 3 أيام)، يحصل الحساب على الدرجة الكاملة. إذا تجاوز 14 يوماً يهبط المؤشر تدريجياً.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                      2. حجم وسجل النشاطات (35%)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      عدد المكالمات والاجتماعات ورسائل الواتساب المسجلة في سجل العميل. الحسابات الأكثر تفاعلاً (5+ نشاطات) تحصل على درجات ممتازة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                      3. نسبة إنجاز المهام (30%)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      نسبة المهام المكتملة إلى إجمالي المهام المسندة للعميل. إنجاز المهام أولاً بأول يرفع الرضا ويمنع تعثر التسليمات.
                    </p>
                  </div>
                </div>

                {/* State Classification Legend */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold">
                  <span className="text-slate-500">تصنيف الحالات:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    🟢 نشط (Active): 70% فأكثر (حساب مستقر وعالي التفاعل)
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    🟡 خامل (Dormant): 45% - 69% (يحتاج تنشيط ومتابعة سريعة)
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    🔴 في خطر (At Risk): أقل من 45% (معرض لخسارة العقد)
                  </span>
                </div>
              </div>

              {/* Interactive Live Simulator */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      محاكي مؤشر صحة العميل التفاعلي (Live Formula Simulator)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">
                    حرّك المؤشرات لمشاهدة كيف يتغير التقييم والتوصية فوراً
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Controls */}
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    
                    {/* Control 1: Days */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>عدد الأيام منذ آخر تواصل:</span>
                        <span className="text-blue-600 dark:text-blue-400">{simDays} أيام</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="35" 
                        value={simDays} 
                        onChange={(e) => setSimDays(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Control 2: Activities */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>حجم النشاطات المسجلة:</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{simActivities} تفاعلات</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="12" 
                        value={simActivities} 
                        onChange={(e) => setSimActivities(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Control 3: Completed Tasks */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>المهام المنجزة:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{simCompletedTasks} من أصل {simTotalTasks} مهام</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={simTotalTasks} 
                        value={simCompletedTasks} 
                        onChange={(e) => setSimCompletedTasks(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Live Simulated Result Card */}
                  <div className={`p-5 rounded-2xl border transition-all text-center space-y-3 ${
                    simulatedReport.status === 'active'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : simulatedReport.status === 'dormant'
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                  }`}>
                    <span className="text-xs text-slate-500 font-bold">النتيجة الناتجة فورياً:</span>
                    <div className={`text-5xl font-black ${
                      simulatedReport.status === 'active' ? 'text-emerald-600 dark:text-emerald-400'
                      : simulatedReport.status === 'dormant' ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400 animate-pulse'
                    }`}>
                      {simulatedReport.score}%
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs">
                      <span>حالة الحساب:</span>
                      <strong className={simulatedReport.badgeTextClass}>{simulatedReport.statusLabelAr}</strong>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-start leading-relaxed">
                      💡 <strong>التوجيه الذكي التلقائي:</strong> {simulatedReport.recommendation}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SAUDI TEMPLATES & DUAL VERSIONS */}
          {activeTab === 'saudi_templates' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <h3 className="font-black text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>منظومة القوالب والرسائل السعودية المزدوجة (Dual Format Architecture)</span>
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  تتميز المنصة بتوفير كافة القوالب بنسختين متطابقتين في الجودة لكن مختلفتين في الطول لخدمة طبيعة المحادثة:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-black block">📄 النسخة العادية (Standard):</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      صيغة مفصلة ومهذبة، تتضمن الترحيب الكامل، توضيح الإنجازات، روابط المعاينة، والدعوة للإجراء (CTA). مناسبة للإيميل أو بداية الشراكات.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-black block">⚡ النسخة المختصرة (Short):</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      صيغة سريعة ومركزة ومباشرة، لا تتجاوز سطرين إلى ثلاثة، مصممة خصيصاً لواتساب وللعملاء أصحاب الأعمال المشغولين جداً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Six Specialized Flows Walkthrough */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  المواقف الستة الأساسية في التواصل:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-blue-600 dark:text-blue-400 text-sm">1. التأكيد 📋 (Confirmation)</span>
                    <p className="text-slate-500">
                      تأكيد استلام المتطلبات والملفات، تأكيد موعد الاجتماع، أو تأكيد استلام الحوالة المالية وبدء التنفيذ.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">2. التسليم والإنجاز 🚀 (Delivery)</span>
                    <p className="text-slate-500">
                      تسليم تصاميم الهوية، خطة السوشيال ميديا، روابط الحملات، أو تقارير الأداء مع تسليط الضوء على الإنجاز.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">3. المتابعة والتذكير ⏳ (Follow-up)</span>
                    <p className="text-slate-500">
                      متابعة لبقة وغير مزعجة للاطمئنان على رأي العميل وسؤاله عما إذا كان لديه أي استفسار حول ما تم تسليمه.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">4. الموافقة والاعتماد ✅ (Approval)</span>
                    <p className="text-slate-500">
                      طلب الاعتماد النهائي للبدء في إطلاق الحملات أو نشر المحتوى، أو الموافقة على الميزانية الإعلانية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-purple-600 dark:text-purple-400 text-sm">5. التعديل والملاحظات ✏️ (Revision)</span>
                    <p className="text-slate-500">
                      استقبال الملاحظات برحابة صدر، الاستفسار عن تفاصيل التعديل غير المفهومة، أو التنبيه اللبق لحدود جولات التعديل.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">6. المراجعة والتقييم 🔍 (Review)</span>
                    <p className="text-slate-500">
                      مراجعة نتائج الربع السنوي، استطلاع رأي العميل حول جودة الخدمة، ومناقشة مقترحات التحسين.
                    </p>
                  </div>

                </div>
              </div>

              {/* Smart Message Composer feature */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    صانع الردود الذكي المتقدم (Smart Message Composer)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  يسمح لمدير الحسابات بتوليد رد مخصص بالذكاء الاصطناعي (Gemini) يحدد فيه: اسم العميل، حالته النفسية (مستعجل، راضٍ، معترض)، النبرة واللهجة السعودية، مع إمكانية إضافة رابط المعاينة وتاريخ التسليم وهدية مجانية (Bonus). يخرج الرد في ثوانٍ بالنسختين العادية والمختصرة جاهزاً للنسخ أو الإرسال الفوري للواتساب!
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: CALENDAR & TASKS */}
          {activeTab === 'calendar_tasks' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-3xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 space-y-2">
                <h3 className="font-black text-base text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>التقويم الشهري الذكي والجدولة التفاعلية (Calendar Drag & Drop)</span>
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  يمنح مدير الحسابات تحكماً بصرياً كاملاً في مواعيد التسليم وأولويات كل يوم عبر مزايا فريدة:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600 text-white">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      السحب والإفلات (Interactive Drag & Drop)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    إذا تأخرت مهمة أو رغب مدير الحسابات في ترحيلها، يكفي النقر عليها وسحبها بالماوس وإفلاتها في أي يوم آخر داخل التقويم؛ ليتم فوراً تعديل تاريخ استحقاقها وحفظها في قاعدة البيانات مع إشعار تأكيد وتأثير صوتي هادئ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      النقاط الملونة لكل عميل (Visual Client Dots)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يحصل كل عميل على لون فريد ونقطة ملونة خاصة به في المنظومة. عند النظر للتقويم، يعرف مدير الحسابات فوراً أي مهمة تتبع لأي عميل بنظرة سريعة، مع شريط تصفية علوي (Legend) يتيح عزل مهام عميل معين بنقرة واحدة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      عرض الجدول الزمني (Timeline View)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    طريقة عرض متسلسلة أفقياً وعمودياً تبين تسلسل تواريخ الاستحقاق وشدة الضغط وعدد المهام المتراكمة لكل أسبوع، لتفادي تراكم المواعيد في يوم واحد.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      نافذة فحص اليوم (Daily Task Drawer)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    بالنقر على أي يوم، تنفتح نافذة جانبية مريحة تعرض كافة مهام ذلك اليوم مع أسماء العملاء، وأولوياتهم، وإمكانية تمييز المهمة بنجمة، أو إنهائها، أو إضافة مهمة جديدة مباشرة في نفس اليوم.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: SHAL STUDIO & SERVICES */}
          {activeTab === 'shal_studio' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-3xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                <h3 className="font-black text-base text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>استوديو خدمات وكالة شال (Shal Studio - 16 Services)</span>
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  أداة مصممة لربط خدمات وكالة شال السعودية بمبيعات التجديد واسترجاع العملاء عبر 16 خدمة معتمدة:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  الخدمات الـ 16 المشمولة في استوديو شال:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    '1. الإعلانات الممولة (Media Buying)',
                    '2. تحسين محركات البحث (SEO)',
                    '3. إعلانات جوجل وشبكة البحث (SEM)',
                    '4. إدارة حسابات التواصل الاجتماعي',
                    '5. تسويق المشاهير والمؤثرين',
                    '6. تصميم تجربة وواجهة المستخدم (UI/UX)',
                    '7. صناعة المحتوى التسويقي (Copywriting)',
                    '8. تحليلات البيانات ومعدلات التحويل (Analytics)',
                    '9. إعلانات التيك توك وسناب شات',
                    '10. التسويق عبر البريد الإلكتروني (Email)',
                    '11. اختبار وتجربة A/B Testing',
                    '12. تحسين ظهور Google My Business',
                    '13. الحملات الموسمية وعروض اليوم الوطني',
                    '14. إنتاج محتوى المستخدم (UGC Creators)',
                    '15. بناء وتطوير الهويات البصرية',
                    '16. استراتيجيات النمو الشاملة (Full Funnel)'
                  ].map((s, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Objections Matrix */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <h4 className="font-black text-sm text-amber-900 dark:text-amber-200">
                  دليل الرد على أشهر الاعتراضات السعودية (Saudi Objections Playbook):
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  يتضمن الاستوديو ردوداً سعودية جاهزة ومحكمة ومدروسة على أصعب الاعتراضات:
                </p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li><strong>"السعر مرتفع جداً مقارنة بغيركم"</strong> ➔ الرد عبر التركيز على العائد الاستثماري (ROAS) وضمان جودة الكوادر المحلية.</li>
                  <li><strong>"الحملة ما جابت نتائج مرضية"</strong> ➔ الرد بتحليل رحلة العميل وسرعة التجاوب وعرض تدقيق مجاني لمسار الشراء.</li>
                  <li><strong>"بنوقف الحملات فترة الصيف/الموسم"</strong> ➔ الرد بإحصائيات القوة الشرائية في الصيف وكيف يستغل المنافسون غيابهم.</li>
                  <li><strong>"بنفكر ونرجع لكم بعدين"</strong> ➔ دخلة سعودية لبقة تحجز لهم أولوية الجدول مع دراسة حالة مجانية.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 6: AM PLAYBOOK */}
          {activeTab === 'am_playbook' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-3xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
                <h3 className="font-black text-base text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>دليل العمل اليومي الاحترافي لمدير الحسابات (Daily AM Playbook)</span>
                </h3>
                <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                  خطوات عملية موصى بها يومياً لتحقيق أعلى معدل استبقاء وتفادي أي مفاجآت:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">1</span>
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">روتين الصباح (9:00 - 9:30 ص):</strong>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      افتح لوحة القيادة ➔ راجع قائمة المهام المستحقة لليوم والأولويات العاجلة ➔ تفقد الحسابات المصنفة <strong>"في خطر 🔴"</strong> لتحديد أولويات التواصل الفوري.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">2</span>
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">فترة التواصل والتسليم (10:00 - 1:00 ظ):</strong>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      استخدم قوالب الرسائل (التسليم والإنجاز 🚀) لتسليم تقارير الحملات بروابط المعاينة ➔ أرسل رسائل التأكيد والمتابعة عبر زر الواتساب المباشر ➔ وثّق أي مكالمة في سجل نشاط العميل.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center shrink-0">3</span>
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">متابعة التجديد والاسترجاع (2:00 - 3:30 م):</strong>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      راجع العقود التي يقترب موعد تجديدها (خلال 30-60 يوماً) ➔ افتح استوديو وكالة شال واختر الخدمة المناسبة لصياغة عرض تجديد مبكر أو بونص يضمن بقاء العميل.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center shrink-0">4</span>
                  <div className="space-y-1">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">إغلاق اليوم والتخطيط للغد (4:30 - 5:00 م):</strong>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      علّم المهام المنجزة بنجاح ➔ اسحب المهام المتبقية في التقويم لتوزيعها على الأيام القادمة ➔ تأكد أن مؤشر صحة العملاء في ارتفاع مستمر.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: DASHBOARD & REPORTS */}
          {activeTab === 'dashboard_reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>التقارير، التصدير، وحفظ البيانات (Reports, Export & Persistence)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تم تصميم المنصة لتضمن استمرارية الأعمال وحفظ البيانات وأمانها:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="text-sm font-black text-slate-900 dark:text-white block">تصدير إكسل (Excel/CSV Export):</strong>
                  <p className="text-slate-500 leading-relaxed">
                    يتيح التطبيق بنقرة زر تصدير كافة بيانات العملاء وقيم العقود ومواعيد التجديد، وكذلك قائمة المهام الكاملة، بصيغة ملفات إكسل متوافقة مع جداول بيانات جوجل وبرامج المحاسبة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="text-sm font-black text-slate-900 dark:text-white block">حفظ البيانات الفوري (Instant Local Persistence):</strong>
                  <p className="text-slate-500 leading-relaxed">
                    يتم تخزين كافة التعديلات، والمهام الجديدة، وسجلات النشاط، وإعدادات المظهر تلقائياً في التخزين المحلي الآمن، مما يضمن عدم ضياع أي بيان عند إعادة تحميل الصفحة أو انقطاع الاتصال.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="text-sm font-black text-slate-900 dark:text-white block">أوضاع العرض الثلاثية (Eye-Care, Dark, Light):</strong>
                  <p className="text-slate-500 leading-relaxed">
                    دعم الوضع الداكن المريح للعين في المساء، والوضع الفاتح الصباحي، ووضع حماية العين (Eye-Care Sepia) الخاص بالقراءة والتركيز المطوّل.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="text-sm font-black text-slate-900 dark:text-white block">التنبيهات الصوتية الحساسة:</strong>
                  <p className="text-slate-500 leading-relaxed">
                    تأثيرات صوتية مصممة بعناية (Web Audio API Synthesizer) تعطي تأكيداً صوتياً لطيفاً عند إنجاز مهمة، أو سحب وإفلات مهمة، أو نسخ رسالة، يمكن تفعيلها أو كتمها من شريط الإعدادات.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>منصة وكالة شال (Shal Agency) • تحديث 2026 لمديري الحسابات</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
