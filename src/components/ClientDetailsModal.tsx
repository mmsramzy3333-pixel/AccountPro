import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Edit2, 
  Trash2,
  FileText,
  AlertCircle,
  Building2,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Client, ActivityLog, AppSettings, Task } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';
import { calculateClientHealth } from '../utils/clientHealth';

interface ClientDetailsModalProps {
  client: Client;
  tasks?: Task[];
  settings: AppSettings;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onUpdateClient: (updated: Client) => void;
  onOpenAiDrafter: (client: Client) => void;
  onOpenAiAdvisor: (client: Client) => void;
  onOpenWinBack?: (client: Client) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  tasks = [],
  settings,
  onClose,
  onEdit,
  onDelete,
  onUpdateClient,
  onOpenAiDrafter,
  onOpenAiAdvisor,
  onOpenWinBack,
}) => {
  const t = getT(settings.language);

  // Dynamic Client Health Score System
  const healthReport = React.useMemo(() => {
    return calculateClientHealth(client, tasks);
  }, [client, tasks]);

  const [showLogActivity, setShowLogActivity] = useState(false);
  const [activityType, setActivityType] = useState<ActivityLog['type']>('call');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');

  const [notes, setNotes] = useState(client.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Handle Log Activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      type: activityType,
      title: activityTitle,
      description: activityDesc,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updated: Client = {
      ...client,
      lastContactDate: new Date().toISOString().split('T')[0],
      activities: [newAct, ...(client.activities || [])],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateClient(updated);
    setActivityTitle('');
    setActivityDesc('');
    setShowLogActivity(false);
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Handle Save Notes
  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    const updated: Client = {
      ...client,
      notes,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateClient(updated);
    setTimeout(() => {
      setIsSavingNotes(false);
      if (settings.soundEnabled) playAlertChime('success');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col"
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-start justify-between gap-4 sticky top-0 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-xl font-black ${healthReport.nameColorClass}`}>
                  {client.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-2xs ${healthReport.badgeBgClass} ${healthReport.badgeTextClass} ${healthReport.badgeBorderClass}`}>
                  <span className={`w-2 h-2 rounded-full ${healthReport.dotColorClass} animate-pulse`} />
                  <span>مؤشر الصحة: {healthReport.statusLabelAr} ({healthReport.score}%)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {client.stage}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {client.companyName} • قطاع: {client.industry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(client)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="تعديل"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(client.id)}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* ========================================================= */}
          {/* CLIENT HEALTH SCORE SYSTEM (نظام مؤشر صحة العميل التفاعلي) */}
          {/* ========================================================= */}
          <div className={`p-5 rounded-3xl border transition-all ${
            healthReport.status === 'active'
              ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30'
              : healthReport.status === 'dormant'
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
              : 'bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/40'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${
                  healthReport.status === 'active'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : healthReport.status === 'dormant'
                    ? 'bg-amber-500 text-white shadow-amber-500/30'
                    : 'bg-rose-600 text-white shadow-rose-600/30 animate-bounce'
                }`}>
                  {healthReport.score}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      مؤشر صحة العميل (Client Health Score)
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${healthReport.badgeBgClass} ${healthReport.badgeTextClass} border ${healthReport.badgeBorderClass}`}>
                      الحالة: {healthReport.statusLabelAr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    يتم احتسابه تلقائياً بناءً على: سرعة آخر تواصل (35%)، حجم النشاطات وسجل التفاعل (35%)، ونسبة المهام المكتملة (30%)
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                تقييم الحساب: <span className={healthReport.badgeTextClass}>{healthReport.status === 'active' ? 'ممتاز ومستقر 🟢' : healthReport.status === 'dormant' ? 'يحتاج تنشيط 🟡' : 'عالي الخطورة 🔴'}</span>
              </div>
            </div>

            {/* 3 Pillars Breakdown Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
              
              {/* Pillar 1: Last Contact Recency */}
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>تاريخ آخر تواصل (35%)</span>
                  </span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {healthReport.recencyScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${healthReport.recencyScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>الوضع الحالي:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{healthReport.lastContactText}</span>
                </div>
              </div>

              {/* Pillar 2: Activity Volume */}
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    <span>حجم النشاطات (35%)</span>
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {healthReport.activityScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${healthReport.activityScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>سجل التفاعل:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{healthReport.activityCount} نشاطات مسجلة</span>
                </div>
              </div>

              {/* Pillar 3: Completed Tasks */}
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>المهام المكتملة (30%)</span>
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {healthReport.tasksScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${healthReport.tasksScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>معدل الإنجاز:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {healthReport.completedTasksCount} مكتملة من {healthReport.totalTasksCount}
                  </span>
                </div>
              </div>

            </div>

            {/* Smart Actionable Recommendation Banner */}
            <div className="mt-3.5 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-extrabold ml-1">توجيه ذكي لتحسين صحة الحساب:</strong>
                {healthReport.recommendation}
              </div>
            </div>
          </div>

          {/* Key AM Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">مؤشر صحة الحساب</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${
                  healthReport.score >= 70 ? 'text-emerald-500' : healthReport.score >= 45 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {healthReport.score}%
                </span>
                <span className="text-xs text-slate-400">
                  {healthReport.statusLabelAr}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">قيمة العقد السنوية</span>
              <div className="mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                  {client.annualValue?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-1">{client.currency}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">تاريخ التجديد</span>
              <div className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                {client.renewalDate || 'غير محدد'}
              </div>
              <span className="text-[10px] text-slate-400">
                آخر تواصل: {client.lastContactDate || 'لا يوجد'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 eye-care:bg-[#eee7dc] border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">المتابعة القادمة</span>
              <div className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                {client.nextFollowUpDate || 'اليوم'}
              </div>
              <span className="text-[10px] text-slate-400">
                {client.tags?.join(' • ')}
              </span>
            </div>
          </div>

          {/* AI Tools Quick Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  أدوات الذكاء الاصطناعي المخصصة لهذا العميل
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تسريع المتابعات اليومية وتوليد أفكار الاحتفاظ بالعقد
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenAiDrafter(client)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>صياغة إيميل ذكي</span>
              </button>

              <button
                onClick={() => onOpenAiAdvisor(client)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>تحليل وتوصيات الحساب</span>
              </button>

              {onOpenWinBack && (
                <button
                  onClick={() => onOpenWinBack(client)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                  title="استعراض دخلات وسيناريوهات الاسترجاع لهذا العميل"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>دخلات استرجاع 🎯</span>
                </button>
              )}
            </div>
          </div>

          {/* Contacts & Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary & Secondary Contacts */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>جهات الاتصال الرئيسية والمسؤولين</span>
              </h4>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-slate-50/50 dark:bg-slate-800/30 eye-care:bg-[#efe8dc] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {client.primaryContact.name}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 block font-medium">
                      {client.primaryContact.role}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    متخذ القرار الرئيسي
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {client.primaryContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${client.primaryContact.phone}`} className="hover:text-blue-600 ltr:font-mono">
                        {client.primaryContact.phone}
                      </a>
                    </div>
                  )}
                  {client.primaryContact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${client.primaryContact.email}`} className="hover:text-blue-600">
                        {client.primaryContact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {client.secondaryContacts && client.secondaryContacts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-semibold block">جهات اتصال إضافية:</span>
                  {client.secondaryContacts.map((sc, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{sc.name} ({sc.role})</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{sc.email} • {sc.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Notes & Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>الملاحظات والمتطلبات الخاصة</span>
                </h4>
                <button
                  onClick={handleSaveNotes}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {isSavingNotes ? 'تم الحفظ!' : 'حفظ الملاحظة'}
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="سجل هنا متطلبات العميل، تفاصيل العقد، أو أي نقاط حساسة يجب مراعاتها..."
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Activity Log Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white eye-care:text-[#2c2720] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>سجل المتابعات والتفاعلات ({client.activities?.length || 0})</span>
              </h4>

              <button
                onClick={() => setShowLogActivity(!showLogActivity)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 eye-care:bg-[#eee7dc] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل نشاط جديد</span>
              </button>
            </div>

            {/* Inline Log Activity Form */}
            {showLogActivity && (
              <form onSubmit={handleAddActivity} className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="bg-white dark:bg-slate-800 border rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="call">مكالمة هاتفية</option>
                    <option value="meeting">اجتماع / مقابلة</option>
                    <option value="email">إيميل مرسل</option>
                    <option value="note">ملاحظة / متابعة داخلية</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder="عنوان النشاط (مثال: مكالمة مراجعة العقد مع المدير)..."
                    className="flex-1 min-w-[200px] text-xs px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800"
                  />
                </div>
                <textarea
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="التفاصيل وما تم الاتفاق عليه..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-800 resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogActivity(false)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-transparent text-slate-500"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    تسجيل النشاط
                  </button>
                </div>
              </form>
            )}

            {/* Activities Timeline */}
            <div className="space-y-2.5">
              {(!client.activities || client.activities.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  لا توجد أنشطة مسجلة لهذا العميل حتى الآن.
                </div>
              ) : (
                client.activities.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 eye-care:bg-[#efe8dc] flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                      {act.type === 'call' ? <Phone className="w-3.5 h-3.5" /> : act.type === 'meeting' ? <Calendar className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {act.timestamp}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
