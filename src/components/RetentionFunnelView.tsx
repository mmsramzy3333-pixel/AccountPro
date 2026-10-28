import React, { useState } from 'react';
import { 
  Compass, 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Users, 
  FileText, 
  Award, 
  Send, 
  Lightbulb, 
  MessageSquare, 
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { 
  RetentionStage, 
  RetentionLesson, 
  Client, 
  AppSettings, 
  NavTab 
} from '../types';
import { 
  RETENTION_FUNNEL_STAGES, 
  RETENTION_ACADEMY_LESSONS 
} from '../utils/shalAgencyData';
import { playAlertChime } from '../utils/storage';

interface RetentionFunnelViewProps {
  clients: Client[];
  settings: AppSettings;
  setActiveTab: (tab: NavTab) => void;
  onOpenWinBackModal: (client?: Client) => void;
}

export const RetentionFunnelView: React.FC<RetentionFunnelViewProps> = ({
  clients,
  settings,
  setActiveTab,
  onOpenWinBackModal,
}) => {
  // Funnel & Academy Tabs
  const [activeSubTab, setActiveSubTab] = useState<'funnel' | 'academy' | 'pipeline'>('funnel');
  
  // Selected Stage
  const [selectedStageId, setSelectedStageId] = useState<string>('triage_audit');
  
  // Interactive Checklists state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Selected Lesson
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson_1_mindset');

  // Copied Tactic ID
  const [copiedTacticId, setCopiedTacticId] = useState<string | null>(null);

  const currentStage = RETENTION_FUNNEL_STAGES.find(s => s.id === selectedStageId) || RETENTION_FUNNEL_STAGES[0];
  const currentLesson = RETENTION_ACADEMY_LESSONS.find(l => l.id === selectedLessonId) || RETENTION_ACADEMY_LESSONS[0];

  const handleToggleCheck = (key: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (settings.soundEnabled) playAlertChime('click');
      return next;
    });
  };

  const handleCopyScript = (tacticId: string, script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedTacticId(tacticId);
    if (settings.soundEnabled) playAlertChime('success');
    setTimeout(() => setCopiedTacticId(null), 2000);
  };

  // Filter clients for pipeline
  const lapsedClients = clients.filter(c => c.stage === 'closed' || c.stage === 'at-risk' || c.healthScore < 60);
  const activeExpiringClients = clients.filter(c => c.stage === 'renewal' || c.healthScore < 75);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>نظام الفانل والأكاديمية المعتمدة • Shal Retention System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              مسار استرجاع العملاء وتجديد العقود المستمر
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              فانل تشغيلي من 4 مراحل متكاملة وأكاديمية متقدمة لنقل علاقتك مع العميل السعودي من "مقدم خدمة بديل" إلى "شريك نمو لا غنى عنه".
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('funnel')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'funnel'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>مسار الفانل (4 مراحل)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('academy')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'academy'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>أكاديمية الدروس العملية</span>
            </button>
            <button
              onClick={() => setActiveSubTab('pipeline')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'pipeline'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>عملاء الاسترجاع ({lapsedClients.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: THE 4-STAGE RETENTION FUNNEL */}
      {activeSubTab === 'funnel' && (
        <div className="space-y-8">
          
          {/* Interactive Stepper Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RETENTION_FUNNEL_STAGES.map((stage) => {
              const isSelected = selectedStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setSelectedStageId(stage.id);
                    if (settings.soundEnabled) playAlertChime('click');
                  }}
                  className={`
                    p-4 rounded-2xl border text-start transition-all duration-200 relative overflow-hidden
                    ${isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 eye-care:bg-[#ede5d8] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {stage.stepNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      مرحلة {stage.stepNumber} من 4
                    </span>
                  </div>

                  <h3 className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                    isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                  }`}>
                    {stage.titleAr.split(':')[1]?.trim() || stage.titleAr}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {stage.subtitleAr}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detailed Stage Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Stage Left: Objectives, Checklist & KPIs */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Objective Banner */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>الهدف الاستراتيجي للمرحلة ({currentStage.stepNumber})</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {currentStage.titleAr}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                  {currentStage.objectiveAr}
                </p>
              </div>

              {/* Interactive Checklist */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>قائمة الفحص والمهام الإجرائية (Checklist)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    اضغط لتسجيل الإنجاز
                  </span>
                </div>

                <div className="space-y-2.5">
                  {currentStage.checklists.map((item, idx) => {
                    const key = `${currentStage.id}-check-${idx}`;
                    const isChecked = !!checkedItems[key];

                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleCheck(key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 line-through text-slate-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">مؤشرات النجاح (KPIs):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStage.kpis.map((kpi, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        📊 {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Stage Right: Copyable Tactics & Scripts */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>الدخلات والتكتيكات الجاهزة للتطبيق الفوري</span>
                </h3>
                <button
                  onClick={() => setActiveTab('shal-studio')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>فتح استوديو الرسائل الكامل</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {currentStage.tactics.map((tactic) => (
                  <div
                    key={tactic.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-md space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {tactic.approach === 'indirect_consultative' ? 'استشاري غير مباشر' :
                           tactic.approach === 'smart_data' ? 'بيانات وعائد استثماري' :
                           tactic.approach === 'emotional' ? 'أخوي وودي' : 'عرض VIP حصري'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {tactic.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleCopyScript(tactic.id, tactic.saudiDialectScript)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                      >
                        {copiedTacticId === tactic.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ السكريبت</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {tactic.description}
                    </p>

                    {/* Script Container */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 eye-care:bg-[#ede5d8] border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>السكريبت باللهجة السعودية المحبوبة:</span>
                        <span className="text-emerald-600 font-bold">جاهز للإرسال 💬</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-sans leading-relaxed">
                        "{tactic.saudiDialectScript}"
                      </p>
                    </div>

                    {/* Action Step */}
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60">
                      <span>⚡</span>
                      <span>الخطوة العملية: {tactic.actionableStep}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: RETENTION ACADEMY MASTERCLASS */}
      {activeSubTab === 'academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lessons List Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>فهرس دروس الأكاديمية (4 دروس متخصصة)</span>
            </h3>

            <div className="space-y-2.5">
              {RETENTION_ACADEMY_LESSONS.map((lesson, idx) => {
                const isSelected = selectedLessonId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      if (settings.soundEnabled) playAlertChime('click');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        الدرس {idx + 1} • {lesson.level}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.readTime}</span>
                      </span>
                    </div>

                    <h4 className={`font-bold text-xs sm:text-sm line-clamp-2 ${
                      isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {lesson.title}
                    </h4>
                  </div>
                );
              })}
            </div>

            {/* Quick Tip Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
              <span className="font-bold block">💡 قاعدة ذهبية في سوق المملكة:</span>
              <p className="leading-relaxed text-[11px]">
                "العميل السعودي لا يتركك إذا حس أنك كفو وأمين، ولو كان هناك خطأ، الاعتذار الرجولي والتعويض الفوري يحول العميل إلى مسوق وفي لخدماتك طوال العمر."
              </p>
            </div>
          </div>

          {/* Active Lesson Content (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {currentLesson.level}
                </span>
                <span className="text-xs text-slate-400">
                  وقت القراءة: {currentLesson.readTime}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentLesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentLesson.summary}
              </p>
            </div>

            {/* Core Principles */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>المبادئ الجوهرية (Core Principles):</span>
              </h3>
              <div className="space-y-2">
                {currentLesson.corePrinciples.map((prin, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{prin}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saudi Market Nuance */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span>🇸🇦</span>
                <span>خصوصية وفلسفة السوق السعودي (Market Nuance):</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentLesson.saudiMarketNuance}
              </p>
            </div>

            {/* Realistic Scenario Roleplay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>سيناريو ومحادثة واقعية (Live Roleplay):</span>
                </h3>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                  حالة عملية
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 space-y-1.5 text-xs">
                <div><strong>العميل المستهدف:</strong> {currentLesson.practicalScenario.clientType}</div>
                <div><strong>التحدي القائم:</strong> {currentLesson.practicalScenario.challenge}</div>
                <div><strong>طريقة الفوز بالصفقة:</strong> {currentLesson.practicalScenario.winningApproach}</div>
              </div>

              {/* Chat Dialogue Bubbles */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                {currentLesson.practicalScenario.sampleConversation.map((msg, i) => {
                  const isAgency = msg.speaker.includes('وكالة شال');

                  return (
                    <div 
                      key={i}
                      className={`flex flex-col ${isAgency ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5">
                        {msg.speaker}
                      </span>
                      <div className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                        isAgency 
                          ? 'bg-blue-600 text-white rounded-tr-xs' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Objections and Answers */}
            {currentLesson.objectionsAndAnswers.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  ردود نموذجية على اعتراضات هذا الدرس:
                </h4>
                <div className="space-y-2">
                  {currentLesson.objectionsAndAnswers.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="font-bold text-rose-600 dark:text-rose-400">❓ اعتراض: "{item.objection}"</div>
                      <div className="text-slate-700 dark:text-slate-200">✅ <strong>الرد الموصى به:</strong> {item.recommendedResponse}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 3: PIPELINE OF LAPSED & AT RISK CLIENTS */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                قائمة عملاء الاسترجاع والتجديد المستهدفين
              </h2>
              <p className="text-xs text-slate-500">
                هؤلاء العملاء يحتاجون لتفعيل إحدى دخلات الاسترجاع فوراً عبر استوديو شال
              </p>
            </div>

            <button
              onClick={() => onOpenWinBackModal()}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/25 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>فتح نافذة Win-Back السريعة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lapsedClients.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  رائع! لا يوجد حالياً عملاء منقطعون أو في دائرة الخطر
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  جميع عملائك في وضع نشط، يمكنك الآن التركيز على ترقية الباقات وتوسيع العقود عبر استوديو خدمات شال.
                </p>
                <button
                  onClick={() => setActiveTab('shal-studio')}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100"
                >
                  الذهاب لاستوديو شال لترقية الباقات
                </button>
              </div>
            ) : (
              lapsedClients.map(client => (
                <div
                  key={client.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-start"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {client.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {client.companyName || 'شركة تجارية'} • {client.industry || 'تسويق ونمو'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {client.stage === 'closed' ? 'منقطع ⚠️' : 'معرض للتسرب ⏳'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div>قيمة العقد السنوي: <strong className="text-slate-800 dark:text-slate-200">{client.annualValue.toLocaleString()} ر.س</strong></div>
                    <div>درجة صحة العلاقة: <strong className={client.healthScore < 50 ? 'text-rose-500' : 'text-amber-500'}>{client.healthScore}%</strong></div>
                    {client.notes && <div className="line-clamp-2 italic text-[11px]">ملاحظة: {client.notes}</div>}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onOpenWinBackModal(client)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>تجهيز استرجاع</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('shal-studio')}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      استوديو شال
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
