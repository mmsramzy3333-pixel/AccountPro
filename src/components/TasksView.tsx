import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  Star, 
  Calendar, 
  Tag, 
  Building2, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  FileSpreadsheet,
  CheckCheck,
  Filter,
  List
} from 'lucide-react';
import { Task, TaskType, Priority, AppSettings, Client } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';
import { TasksCalendarView } from './TasksCalendarView';
import { TasksTimelineView } from './TasksTimelineView';

interface TasksViewProps {
  tasks: Task[];
  clients: Client[];
  settings: AppSettings;
  onToggleTask: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTask: () => void;
  onOpenNewTaskWithDate?: (dateStr: string) => void;
  onEditTask: (task: Task) => void;
  onExportExcel: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  clients,
  settings,
  onToggleTask,
  onToggleStar,
  onDeleteTask,
  onOpenNewTask,
  onOpenNewTaskWithDate,
  onEditTask,
  onExportExcel,
}) => {
  const t = getT(settings.language);
  const todayStr = new Date().toISOString().split('T')[0];

  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'today' | 'urgent' | 'upcoming' | 'completed' | 'all'>('today');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Quick inline add task
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineClientId, setInlineClientId] = useState('');
  const [inlinePriority, setInlinePriority] = useState<Priority>('high');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'today') {
        if (task.completed || task.dueDate > todayStr) return false;
      } else if (activeTab === 'urgent') {
        if (task.completed || (task.priority !== 'urgent' && !task.isStarred)) return false;
      } else if (activeTab === 'upcoming') {
        if (task.completed || task.dueDate <= todayStr) return false;
      } else if (activeTab === 'completed') {
        if (!task.completed) return false;
      }

      // Type filter
      if (selectedType !== 'all' && task.type !== selectedType) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, activeTab, selectedType, todayStr]);

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    const matchedClient = clients.find(c => c.id === inlineClientId);
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: inlineTitle,
      clientId: inlineClientId || undefined,
      clientName: matchedClient?.name || undefined,
      dueDate: todayStr,
      priority: inlinePriority,
      type: 'follow_up',
      completed: false,
      createdAt: todayStr,
    };

    onEditTask(newTask);
    setInlineTitle('');
    setInlineClientId('');
    if (settings.soundEnabled) playAlertChime('success');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingTodayCount = tasks.filter(t => !t.completed && t.dueDate <= todayStr).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {t.tasks}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] mt-0.5">
            متابعة المهام التشغيلية اليومية والتواصل مع العملاء دون أي تأخير
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* List vs Timeline vs Calendar Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] p-1 rounded-xl">
            <button
              onClick={() => {
                setViewMode('list');
                if (settings.soundEnabled) playAlertChime('click');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>عرض القائمة</span>
            </button>
            <button
              onClick={() => {
                setViewMode('timeline');
                if (settings.soundEnabled) playAlertChime('click');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>الجدول الزمني ⏳</span>
            </button>
            <button
              onClick={() => {
                setViewMode('calendar');
                if (settings.soundEnabled) playAlertChime('click');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>التقويم الشهري</span>
            </button>
          </div>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير المهام (Excel)</span>
          </button>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newTask}</span>
          </button>
        </div>
      </div>

      {/* View Mode Switching */}
      {viewMode === 'calendar' ? (
        <TasksCalendarView
          tasks={tasks}
          clients={clients}
          settings={settings}
          onToggleTask={onToggleTask}
          onToggleStar={onToggleStar}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onOpenNewTaskWithDate={onOpenNewTaskWithDate || (() => onOpenNewTask())}
        />
      ) : viewMode === 'timeline' ? (
        <TasksTimelineView
          tasks={tasks}
          clients={clients}
          settings={settings}
          onToggleTask={onToggleTask}
          onToggleStar={onToggleStar}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onOpenNewTaskWithDate={onOpenNewTaskWithDate || (() => onOpenNewTask())}
        />
      ) : (
        /* If List Mode is Active */
        <>
          {/* Quick Add Inline Form */}
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs">
            <form onSubmit={handleInlineAdd} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  required
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  placeholder="إضافة مهمة سريعة لليوم (مثال: الاتصال بمدير التقنية في شركة الأفق لتأكيد التجديد)..."
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={inlineClientId}
                  onChange={(e) => setInlineClientId(e.target.value)}
                  className="flex-1 sm:flex-none text-xs px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="">بدون تحديد عميل</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={inlinePriority}
                  onChange={(e) => setInlinePriority(e.target.value as any)}
                  className="text-xs px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="urgent">عاجل جداً</option>
                  <option value="high">مرتفع</option>
                  <option value="medium">متوسط</option>
                  <option value="low">منخفض</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>

          {/* Tabs & Type Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'today'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                مهام اليوم ({pendingTodayCount})
              </button>
              <button
                onClick={() => setActiveTab('urgent')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'urgent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الأولويات العاجلة
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'upcoming'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                القادمة
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                المكتملة ({completedCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الكل ({tasks.length})
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>نوع المهمة:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white dark:bg-slate-800 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">جميع الأنواع</option>
                <option value="follow_up">متابعة دورية</option>
                <option value="meeting">اجتماع / مكالمة</option>
                <option value="renewal_talk">مفاوضات تجديد</option>
                <option value="issue_resolution">حل مشكلة عاجلة</option>
                <option value="report_review">عرض تقرير دوري</option>
              </select>
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <CheckCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  لا توجد مهام في هذا التصنيف
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  جميع مهام هذا القسم منجزة بنجاح. أضف مهمة جديدة للبدء.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-70 border-slate-200/50 dark:border-slate-800/50'
                      : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] hover:border-blue-300 dark:hover:border-blue-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white eye-care:text-[#2c2720]'
                        }`}>
                          {task.title}
                        </span>

                        {task.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            عاجل جداً
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            مرتفع
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 eye-care:text-[#6a6051] mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                        {task.clientName && (
                          <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            🏢 {task.clientName}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleStar(task.id)}
                      title={task.isStarred ? 'إلغاء التمييز' : 'تمييز كأولوية مهمة'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        task.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="حذف المهمة"
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
