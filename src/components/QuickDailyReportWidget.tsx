import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Client, Task, AppSettings } from '../types';
import { exportDailyReportToCsv, playAlertChime } from '../utils/storage';

interface QuickDailyReportWidgetProps {
  clients: Client[];
  tasks: Task[];
  settings: AppSettings;
  onOpenNewTask?: () => void;
  onSelectClient?: (client: Client) => void;
}

export const QuickDailyReportWidget: React.FC<QuickDailyReportWidgetProps> = ({
  clients,
  tasks,
  settings,
  onOpenNewTask,
  onSelectClient,
}) => {
  const [copied, setCopied] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => t.dueDate <= todayStr);
  const completedToday = tasks.filter(t => t.completed && (t.dueDate === todayStr || (t.completedAt && t.completedAt.startsWith(todayStr))));
  const pendingUrgent = todayTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.isStarred));
  const pendingRegular = todayTasks.filter(t => !t.completed && t.priority !== 'urgent' && !t.isStarred);

  const totalARR = clients.reduce((sum, c) => sum + (c.annualValue || 0), 0);
  const completionRate = todayTasks.length ? Math.round((completedToday.length / todayTasks.length) * 100) : 100;

  // Active accounts with recent activity
  const activeClients = clients.filter(c => c.stage === 'active' || c.stage === 'onboarding' || c.stage === 'renewal');
  const atRiskClients = clients.filter(c => c.stage === 'at-risk' || c.healthScore < 60);

  const handleCopyQuickSummary = () => {
    const summary = `📊 تقرير الإنجاز اليومي لمدير الحسابات (${new Date().toLocaleDateString('ar-EG')}):
- المهام المنجزة اليوم: ${completedToday.length}/${todayTasks.length} (${completionRate}%)
- المهام العاجلة المتبقية: ${pendingUrgent.length}
- إجمالي قيمة المحفظة: ${totalARR.toLocaleString()} ${settings.currency}
- الحسابات النشطة: ${activeClients.length} | الحسابات الحرجة: ${atRiskClients.length}
منصة أكاونت برو (AccountPro)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 eye-care:from-[#f6f2e9] eye-care:to-[#eee7dc] border border-slate-200/90 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs space-y-5">
      
      {/* Header with Title and Quick Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                تقرير الإنجاز اليومي السريع والموجز
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                اليوم {new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] mt-0.5">
              ملخص فوري وسهل القراءة يوضح سير العمل وإنجازات مدير الحسابات مع إمكانية التصدير
            </p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyQuickSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الملخص'}</span>
          </button>

          <button
            onClick={() => exportDailyReportToCsv(clients, tasks, settings)}
            title="تصدير تقرير اليوم التنفيذي كملف Excel (.csv UTF-8)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تصدير إكسل (Excel)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            title="طباعة أو تصدير كملف PDF رسمي"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>تصدير بي دي إف (PDF)</span>
          </button>
        </div>
      </div>

      {/* 4 Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>نسبة الإنجاز اليومي</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              {completedToday.length}/{todayTasks.length} مهام
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>المهام العاجلة المتبقية</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {pendingUrgent.length}
            </span>
            <span className="text-xs text-slate-400">تتطلب تنفيذاً فورياً</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {pendingRegular.length} مهام عادية مجدولة لليوم
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>إجمالي قيمة المحفظة</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalARR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-bold">{settings.currency}</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-semibold">
            {activeClients.length} عملاء نشطين مؤمنين
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>صحة المحفظة والمخاطر</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {atRiskClients.length === 0 ? '100%' : `${atRiskClients.length} حرجة`}
            </span>
            <span className="text-xs text-slate-400">
              {atRiskClients.length === 0 ? 'أمان تام' : 'بحاجة لمتابعة'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {clients.filter(c => c.stage === 'renewal').length} شراكات في مرحلة التجديد
          </p>
        </div>
      </div>

      {/* Two columns: Completed Today vs Remaining Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Completed Today Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>ما تم إنجازه بنجاح اليوم ({completedToday.length})</span>
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-thin">
            {completedToday.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                لم يتم إنجاز مهام بعد اليوم. ابدأ بالأولويات القصوى أدناه!
              </div>
            ) : (
              completedToday.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate line-through opacity-80">
                      {task.title}
                    </span>
                  </div>
                  {task.clientName && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {task.clientName}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Remaining Focus Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 eye-care:bg-white border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>المهام المتبقية قيد التنفيذ ({pendingUrgent.length + pendingRegular.length})</span>
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-thin">
            {pendingUrgent.length + pendingRegular.length === 0 ? (
              <div className="text-center py-6 text-xs text-emerald-600 font-bold">
                🎉 رائع جداً! تم الانتهاء من جميع مهام اليوم بنجاح.
              </div>
            ) : (
              [...pendingUrgent, ...pendingRegular].slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                    task.priority === 'urgent'
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'urgent' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.clientName && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {task.clientName}
                      </span>
                    )}
                    {task.priority === 'urgent' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                        عاجل
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
