import React, { useState } from 'react';
import { X, Calendar, Clock, Star, Building2, CheckSquare } from 'lucide-react';
import { Task, TaskType, Priority, AppSettings, Client } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface TaskFormModalProps {
  task?: Task;
  initialDueDate?: string;
  clients: Client[];
  settings: AppSettings;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  task,
  initialDueDate,
  clients,
  settings,
  onSave,
  onClose,
}) => {
  const t = getT(settings.language);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [clientId, setClientId] = useState(task?.clientId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || initialDueDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState(task?.dueTime || '11:00');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'high');
  const [type, setType] = useState<TaskType>(task?.type || 'follow_up');
  const [isStarred, setIsStarred] = useState(task?.isStarred || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedClient = clients.find(c => c.id === clientId);

    const savedTask: Task = {
      id: task?.id || 'task-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      clientId: clientId || undefined,
      clientName: matchedClient?.name,
      dueDate,
      dueTime,
      priority,
      type,
      completed: task?.completed || false,
      isStarred,
      createdAt: task?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(savedTask);
    if (settings.soundEnabled) playAlertChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                {task ? 'تعديل المهمة' : t.newTask}
              </h3>
              <p className="text-xs text-slate-500">
                جدولة متابعة، مكالمة، أو مهمة تشغيلية مرتبطة بالعميل
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              عنوان المهمة والمتابعة <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الاتصال بمسؤول المشتريات لتأكيد تاريخ توقيع التجديد..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Client Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              العميل أو الشريك المرتبط بالمهمة:
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="">بدون ربط بحساب محدد (مهمة عامة)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.companyName})
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                درجة الأولوية:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none font-bold"
              >
                <option value="urgent">عاجل جداً (Urgent)</option>
                <option value="high">مرتفع (High)</option>
                <option value="medium">متوسط (Medium)</option>
                <option value="low">منخفض (Low)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                نوع المهمة:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none font-semibold"
              >
                <option value="follow_up">متابعة دورية (Follow-up)</option>
                <option value="meeting">اجتماع / مكالمة (Meeting)</option>
                <option value="renewal_talk">مفاوضات تجديد (Renewal Talk)</option>
                <option value="issue_resolution">حل مشكلة عاجلة (Issue Resolution)</option>
                <option value="report_review">عرض تقرير دوري (Review)</option>
                <option value="general">مهمة عامة</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                تاريخ الاستحقاق:
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                وقت الاستحقاق:
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              تفاصيل إضافية للمهمة:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل ما تريد مناقشته أو إنجازه..."
              className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 resize-none outline-none"
            />
          </div>

          {/* Star toggle */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <input
              type="checkbox"
              id="star-task"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="star-task" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>تمييز المهمة كأولوية قصوى في الصفحة الرئيسية</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              حفظ المهمة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
