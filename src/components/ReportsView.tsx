import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Mail, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Users, 
  Award, 
  PieChart, 
  Share2,
  Copy, 
  Check,
  Sparkles,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { Client, Task, AppSettings } from '../types';
import { getT } from '../utils/translations';
import { exportDailyReportToCsv, exportClientsToCsv, exportTasksToCsv, playAlertChime, safeOpenUrl } from '../utils/storage';

interface ReportsViewProps {
  clients: Client[];
  tasks: Task[];
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  clients,
  tasks,
  settings,
}) => {
  const t = getT(settings.language);
  const [reportType, setReportType] = useState<'daily' | 'portfolio'>('daily');
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily statistics
  const todayTasks = tasks.filter(t => t.dueDate <= todayStr);
  const completedToday = tasks.filter(t => t.completed && (t.dueDate === todayStr || (t.completedAt && t.completedAt.startsWith(todayStr))));
  const pendingUrgent = todayTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.isStarred));
  const pendingRegular = todayTasks.filter(t => !t.completed && t.priority !== 'urgent' && !t.isStarred);
  const dailyCompletionRate = todayTasks.length ? Math.round((completedToday.length / todayTasks.length) * 100) : 100;

  // General Portfolio statistics
  const totalARR = clients.reduce((sum, c) => sum + (c.annualValue || 0), 0);
  const allCompletedTasks = tasks.filter(t => t.completed);
  const overallTaskRate = tasks.length ? Math.round((allCompletedTasks.length / tasks.length) * 100) : 0;
  
  const highHealthCount = clients.filter(c => c.healthScore >= 80).length;
  const mediumHealthCount = clients.filter(c => c.healthScore >= 60 && c.healthScore < 80).length;
  const atRiskCount = clients.filter(c => c.healthScore < 60 || c.stage === 'at-risk').length;

  const activeCount = clients.filter(c => c.stage === 'active').length;
  const renewalCount = clients.filter(c => c.stage === 'renewal').length;
  const onboardingCount = clients.filter(c => c.stage === 'onboarding').length;
  const leadCount = clients.filter(c => c.stage === 'lead').length;

  // Print PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Export Excel
  const handleExportExcel = () => {
    exportDailyReportToCsv(clients, tasks, settings);
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Share via Email
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`تقرير أداء مدير الحسابات اليومي (${new Date().toLocaleDateString('ar-EG')}) - ${settings.accountManagerName}`);
    const body = encodeURIComponent(
`تقرير الأداء والإنجاز اليومي - ${settings.accountManagerName}
التاريخ: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}

الملخص اليومي:
• معدل إنجاز مهام اليوم: ${dailyCompletionRate}% (${completedToday.length} من أصل ${todayTasks.length} مهمة)
• المهام العاجلة المتبقية: ${pendingUrgent.length}
• إجمالي قيمة المحفظة المُدارة: ${totalARR.toLocaleString()} ${settings.currency}
• عدد العملاء النشطين: ${activeCount + onboardingCount + renewalCount}
• الحسابات تحت المتابعة والمخاطر: ${atRiskCount}

المهام المنجزة اليوم:
${completedToday.map(t => `✅ ${t.title} (${t.clientName || 'عام'})`).join('\n') || 'لا توجد مهام منجزة بعد'}

المهام العاجلة المتبقية لليوم:
${pendingUrgent.map(t => `⏳ ${t.title} (${t.clientName || 'عام'})`).join('\n') || 'لا توجد مهام عاجلة متبقية'}

تم استخراج التقرير آلياً عبر منصة أكاونت برو (AccountPro)`);

    safeOpenUrl(`mailto:?subject=${subject}&body=${body}`);
  };

  // Copy Summary text
  const handleCopySummary = () => {
    const text = `📊 تقرير الإنجاز اليومي لمدير الحسابات (${new Date().toLocaleDateString('ar-EG')}):\n- إنجاز مهام اليوم: ${completedToday.length}/${todayTasks.length} (${dailyCompletionRate}%)\n- مهام عاجلة متبقية: ${pendingUrgent.length}\n- قيمة المحفظة: ${totalARR.toLocaleString()} ${settings.currency}\n- حسابات نشطة: ${activeCount + onboardingCount + renewalCount} | حرجة: ${atRiskCount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {t.reports}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] mt-0.5">
            تقارير يومية سريعة وسهلة القراءة توضح الإنجازات وسير العمل مع خيارات التصدير الفوري
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] p-1 rounded-xl">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              التقرير اليومي السريع
            </button>
            <button
              onClick={() => setReportType('portfolio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'portfolio'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              تحليل المحفظة الشامل
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ ملخص سريع'}</span>
          </button>

          <button
            onClick={handleShareEmail}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            <span>{t.shareEmail}</span>
          </button>

          <button
            onClick={handleExportExcel}
            title="تصدير تقرير شامل إلى ملف إكسل متوافق مع كافة الجداول"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير إكسل (Excel)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-sm space-y-8">
        
        {/* Printable Header */}
        <div className="flex items-center justify-between border-b pb-6 border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block" />
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                {reportType === 'daily' ? 'تقرير الأداء والإنجاز اليومي لمدير الحسابات' : t.dailyReportTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              مدير الحساب: {settings.accountManagerName} • البريد: {settings.accountManagerEmail}
            </p>
          </div>

          <div className="text-left rtl:text-right">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
              تاريخ التقرير
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {new Date().toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'full' })}
            </span>
          </div>
        </div>

        {/* 4 Summary Scorecards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">
              {reportType === 'daily' ? 'إنجاز مهام اليوم' : 'معدل إنجاز المهام الكلي'}
            </span>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white eye-care:text-[#2c2720]">
              {reportType === 'daily' ? `${dailyCompletionRate}%` : `${overallTaskRate}%`}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">
              {reportType === 'daily' 
                ? `${completedToday.length} من ${todayTasks.length} مهام اليوم`
                : `${allCompletedTasks.length} من ${tasks.length} مهام`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">مهام عاجلة متبقية</span>
            <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
              {pendingUrgent.length}
            </div>
            <span className="text-[11px] text-rose-500 mt-1 block">
              {pendingRegular.length} مهام عادية متبقية
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">إجمالي قيمة المحفظة (ARR)</span>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white eye-care:text-[#2c2720]">
              {totalARR.toLocaleString()} <span className="text-xs font-normal text-slate-500">{settings.currency}</span>
            </div>
            <span className="text-[11px] text-blue-600 mt-1 block">إيراد سنوي مؤمن</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">حسابات تحتاج تدخلاً</span>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
              {atRiskCount}
            </div>
            <span className="text-[11px] text-amber-600 mt-1 block">
              من أصل {clients.length} عميل
            </span>
          </div>
        </div>

        {/* If Daily Report mode: Show Today's Tasks Breakdown */}
        {reportType === 'daily' && (
          <div className="space-y-6">
            
            {/* Two boxes: Completed vs Pending */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Completed Tasks Box */}
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 eye-care:bg-[#efe8dc] space-y-3">
                <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>المهام المنجزة بنجاح اليوم</span>
                  </span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {completedToday.length}
                  </span>
                </h4>

                <div className="space-y-2">
                  {completedToday.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      لا توجد مهام منجزة بعد لليوم.
                    </div>
                  ) : (
                    completedToday.map((task) => (
                      <div key={task.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold line-through text-slate-500">{task.title}</span>
                        </div>
                        {task.clientName && (
                          <span className="text-[10px] font-bold text-blue-600 shrink-0">{task.clientName}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Priorities Box */}
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 eye-care:bg-[#efe8dc] space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>المهام المتبقية قيد التنفيذ</span>
                  </span>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {pendingUrgent.length + pendingRegular.length}
                  </span>
                </h4>

                <div className="space-y-2">
                  {[...pendingUrgent, ...pendingRegular].length === 0 ? (
                    <div className="text-center py-6 text-xs text-emerald-600 font-bold">
                      تم إنجاز كافة مهام اليوم بنجاح كامل!
                    </div>
                  ) : (
                    [...pendingUrgent, ...pendingRegular].map((task) => (
                      <div key={task.id} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        task.priority === 'urgent'
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'urgent' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.clientName && (
                            <span className="text-[10px] text-slate-500 font-medium">{task.clientName}</span>
                          )}
                          {task.priority === 'urgent' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900">عاجل</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Today's Tasks Detailed Printable Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                جدول مهام وأولويات اليوم التفصيلي
              </h4>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">المهمة</th>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الأولوية</th>
                      <th className="py-2.5 px-3">الوقت</th>
                      <th className="py-2.5 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {todayTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          لا توجد مهام مسجلة لهذا التاريخ.
                        </td>
                      </tr>
                    ) : (
                      todayTasks.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2.5 px-3 font-semibold">{t.title}</td>
                          <td className="py-2.5 px-3">{t.clientName || 'عام'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {t.priority === 'urgent' ? 'عاجل جداً' : t.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{t.dueTime || 'خلال اليوم'}</td>
                          <td className="py-2.5 px-3 font-bold">
                            {t.completed ? (
                              <span className="text-emerald-600">منجزة ✅</span>
                            ) : (
                              <span className="text-amber-600">قيد التنفيذ ⏳</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* If Portfolio Overview mode: Show Visual Breakdowns */}
        {reportType === 'portfolio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pipeline Stages Breakdown */}
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 eye-care:bg-[#efe8dc] space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720] flex items-center justify-between">
                  <span>توزيع العملاء حسب المراحل (Pipeline)</span>
                  <span className="text-xs text-slate-400">الإجمالي: {clients.length}</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-emerald-600">نشط ومستقر</span>
                      <span className="font-bold">{activeCount} ({clients.length ? Math.round((activeCount / clients.length) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${clients.length ? (activeCount / clients.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-indigo-600">قيد التجديد</span>
                      <span className="font-bold">{renewalCount} ({clients.length ? Math.round((renewalCount / clients.length) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${clients.length ? (renewalCount / clients.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-600">مرحلة التهيئة والتدريب</span>
                      <span className="font-bold">{onboardingCount} ({clients.length ? Math.round((onboardingCount / clients.length) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${clients.length ? (onboardingCount / clients.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-rose-600">مهدد بالإلغاء</span>
                      <span className="font-bold">{atRiskCount} ({clients.length ? Math.round((atRiskCount / clients.length) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${clients.length ? (atRiskCount / clients.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Health Distribution */}
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 eye-care:bg-[#efe8dc] space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                  توزيع مؤشرات صحة الحسابات (Account Health)
                </h4>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 eye-care:bg-white border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold">ممتاز (80% - 100%)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{highHealthCount} عملاء</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 eye-care:bg-white border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold">مستقر (60% - 79%)</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">{mediumHealthCount} عملاء</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 eye-care:bg-white border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold">حرج (&lt; 60%)</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">{atRiskCount} عملاء</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Key Accounts Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                أهم الحسابات والشركاء في المحفظة
              </h4>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3">صحة الحساب</th>
                      <th className="py-2.5 px-3">القيمة السنوية</th>
                      <th className="py-2.5 px-3">تاريخ التجديد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clients.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-semibold">{c.name}</td>
                        <td className="py-2.5 px-3">{c.stage}</td>
                        <td className="py-2.5 px-3 font-bold">{c.healthScore}%</td>
                        <td className="py-2.5 px-3">{c.annualValue?.toLocaleString()} {c.currency}</td>
                        <td className="py-2.5 px-3">{c.renewalDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>تم توليد التقرير تلقائياً بواسطة منصة أكاونت برو • جميع البيانات مشفرة AES-256</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>
    </div>
  );
};
