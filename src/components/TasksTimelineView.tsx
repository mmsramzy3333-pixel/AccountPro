import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Star, 
  Plus, 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  Sparkles, 
  Tag, 
  Trash2, 
  Edit2, 
  CheckCheck,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { Task, Client, Priority, TaskType, AppSettings } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface TasksTimelineViewProps {
  tasks: Task[];
  clients: Client[];
  settings: AppSettings;
  onToggleTask: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

interface TimelineDateGroup {
  dateStr: string;
  labelAr: string;
  category: 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'upcoming';
  tasks: Task[];
  pressureLevel: 'low' | 'medium' | 'high' | 'critical';
  urgentCount: number;
}

export const TasksTimelineView: React.FC<TasksTimelineViewProps> = ({
  tasks,
  clients,
  settings,
  onToggleTask,
  onToggleStar,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskWithDate,
}) => {
  const t = getT(settings.language);
  const isRtl = settings.language === 'ar';
  
  // Timeline Filters
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Today Date Calculation
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const weekLater = new Date(today);
  weekLater.setDate(weekLater.getDate() + 7);
  const weekLaterStr = weekLater.toISOString().split('T')[0];

  // Helper format Arabic day and date
  const formatDateLabel = (dateStr: string): string => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('ar-SA', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter tasks first
  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!showCompleted && task.completed) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterClient !== 'all' && task.clientId !== filterClient) return false;
      return true;
    });
  }, [tasks, showCompleted, filterPriority, filterClient]);

  // Group tasks by dueDate into timeline segments
  const timelineGroups = useMemo(() => {
    const groupsMap = new Map<string, Task[]>();

    visibleTasks.forEach(task => {
      const d = task.dueDate || todayStr;
      if (!groupsMap.has(d)) {
        groupsMap.set(d, []);
      }
      groupsMap.get(d)!.push(task);
    });

    // Sort distinct dates
    const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    const groups: TimelineDateGroup[] = sortedDates.map(dateStr => {
      const dateTasks = groupsMap.get(dateStr) || [];
      // Sort tasks inside date: urgent first, then starred, then time
      dateTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        return (a.dueTime || '').localeCompare(b.dueTime || '');
      });

      let category: TimelineDateGroup['category'] = 'upcoming';
      let labelAr = formatDateLabel(dateStr);

      if (dateStr < todayStr) {
        category = 'overdue';
        labelAr = `متأخرة عن الموعد (${formatDateLabel(dateStr)})`;
      } else if (dateStr === todayStr) {
        category = 'today';
        labelAr = `اليوم (${formatDateLabel(dateStr)})`;
      } else if (dateStr === tomorrowStr) {
        category = 'tomorrow';
        labelAr = `غداً (${formatDateLabel(dateStr)})`;
      } else if (dateStr <= weekLaterStr) {
        category = 'this_week';
        labelAr = formatDateLabel(dateStr);
      }

      const activeTasksCount = dateTasks.filter(t => !t.completed).length;
      const urgentCount = dateTasks.filter(t => t.priority === 'urgent' && !t.completed).length;

      let pressureLevel: TimelineDateGroup['pressureLevel'] = 'low';
      if (category === 'overdue' && activeTasksCount > 0) {
        pressureLevel = 'critical';
      } else if (activeTasksCount >= 4 || urgentCount >= 2) {
        pressureLevel = 'high';
      } else if (activeTasksCount >= 2 || urgentCount >= 1) {
        pressureLevel = 'medium';
      }

      return {
        dateStr,
        labelAr,
        category,
        tasks: dateTasks,
        pressureLevel,
        urgentCount,
      };
    });

    return groups;
  }, [visibleTasks, todayStr, tomorrowStr, weekLaterStr]);

  // Overall workload stats
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
  const todayCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
  const upcomingWeekCount = tasks.filter(t => !t.completed && t.dueDate > todayStr && t.dueDate <= weekLaterStr).length;
  
  // Find peak pressure day
  const peakDay = useMemo<TimelineDateGroup | null>(() => {
    let max = 0;
    let peak: TimelineDateGroup | null = null;
    timelineGroups.forEach(g => {
      const active = g.tasks.filter(t => !t.completed).length;
      if (active > max) {
        max = active;
        peak = g;
      }
    });
    return peak;
  }, [timelineGroups]);

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">عاجل جداً 🔥</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">مرتفع</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">عادي</span>;
    }
  };

  const getPressureBadge = (level: TimelineDateGroup['pressureLevel'], count: number, urgentCount: number) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            <span>حرج ({count} مهام متأخرة)</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span>ضغط تسليم مرتفع ({count} مهام)</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>ضغط معتدل ({count})</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <span>أريحية تسليم ({count})</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Timeline Workload Pressure Overview Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Overdue */}
        <div className={`p-4 rounded-2xl border transition-all ${
          overdueCount > 0 
            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-xs' 
            : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">مهام متأخرة عن الموعد</span>
            <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {overdueCount}
            </span>
            <span className="text-[11px] text-slate-500">
              {overdueCount > 0 ? 'تتطلب معالجة فورية' : 'لا يوجد تأخير'}
            </span>
          </div>
        </div>

        {/* Metric 2: Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">تسليمات اليوم</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {todayCount}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              مطلوبة قبل نهاية اليوم
            </span>
          </div>
        </div>

        {/* Metric 3: Upcoming Week */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">ضغط الأيام السبعة القادمة</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {upcomingWeekCount}
            </span>
            <span className="text-[11px] text-slate-500">
              مهمة مجدولة
            </span>
          </div>
        </div>

        {/* Metric 4: Peak Pressure Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">ذروة ضغط التسليم</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {peakDay ? peakDay.labelAr.split('(')[0].trim() : 'متوازن'}
            </span>
            {peakDay && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                ({peakDay.tasks.filter(t => !t.completed).length} مهام)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>تصفية الجدول الزمني:</span>
          </span>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-1.5 px-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">كافة الأولويات</option>
            <option value="urgent">عاجل جداً فقط 🔥</option>
            <option value="high">مرتفع</option>
            <option value="medium">متوسط</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="p-1.5 px-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none max-w-44"
          >
            <option value="all">كافة العملاء</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.companyName})
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span>إظهار المهام المكتملة</span>
        </label>
      </div>

      {/* Main Timeline Stream */}
      {timelineGroups.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            الجدول الزمني خالٍ من المهام المحددة
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            لا توجد مهام تطابق معايير الفلترة الحالية، أو تم إنجاز جميع المهام بنجاح!
          </p>
          <button
            onClick={() => onOpenNewTaskWithDate(todayStr)}
            className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            إضافة مهمة جديدة لليوم
          </button>
        </div>
      ) : (
        <div className="relative pl-2 pr-2 sm:pl-4 sm:pr-4">
          
          {/* Central Vertical Connecting Track */}
          <div 
            className={`absolute top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 eye-care:bg-[#e0d6c5] ${
              isRtl ? 'right-6 sm:right-8' : 'left-6 sm:left-8'
            }`} 
          />

          <div className="space-y-8">
            {timelineGroups.map((group) => {
              const activeCount = group.tasks.filter(t => !t.completed).length;

              return (
                <div key={group.dateStr} className="relative group/node">
                  
                  {/* Timeline Date Marker Node */}
                  <div className="flex items-center gap-3.5 mb-3.5">
                    
                    {/* Node Dot / Badge */}
                    <div className={`
                      relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md transition-transform group-hover/node:scale-105
                      ${group.category === 'overdue' 
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950/60' 
                        : group.category === 'today'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60'
                        : group.category === 'tomorrow'
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                        : 'bg-slate-800 text-white ring-4 ring-slate-100 dark:ring-slate-800/80'
                      }
                    `}>
                      <Calendar className="w-4 h-4" />
                    </div>

                    {/* Node Header Label & Pressure Badge */}
                    <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/80 eye-care:bg-[#f6f2e9]/90 backdrop-blur-xs p-2.5 px-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {group.labelAr}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {group.dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPressureBadge(group.pressureLevel, activeCount, group.urgentCount)}

                        <button
                          onClick={() => onOpenNewTaskWithDate(group.dateStr)}
                          title="إضافة مهمة بهذا التاريخ"
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-0.5 text-[11px] font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">مهمة</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Cards Stack on this Timeline Node */}
                  <div className={`space-y-2.5 ${isRtl ? 'pr-12 sm:pr-14' : 'pl-12 sm:pl-14'}`}>
                    {group.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`
                          p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start
                          ${task.completed
                            ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                            : task.priority === 'urgent'
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 eye-care:bg-[#fdf7f4] border-rose-200 dark:border-rose-900/40 shadow-xs'
                            : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                          }
                        `}
                      >
                        {/* Task Title & Details */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {getPriorityBadge(task.priority)}

                              {task.clientName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-32">{task.clientName}</span>
                                </span>
                              )}

                              {task.dueTime && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.dueTime}</span>
                                </span>
                              )}

                              <span className="px-1.5 py-0.5 text-[9px] rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {task.type === 'renewal_talk' ? 'مفاوضة تجديد' :
                                 task.type === 'meeting' ? 'اجتماع' :
                                 task.type === 'issue_resolution' ? 'حل مشكلة' :
                                 task.type === 'report_review' ? 'مراجعة تقرير' : 'متابعة'}
                              </span>
                            </div>

                            <h4 className={`text-xs sm:text-sm font-bold leading-snug break-words ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}>
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Tools */}
                        <div className="flex items-center gap-1 sm:self-center shrink-0 self-end">
                          <button
                            onClick={() => onToggleStar(task.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              task.isStarred
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                            }`}
                            title={task.isStarred ? 'إزالة التمييز' : 'تمييز كأولوية'}
                          >
                            <Star className={`w-4 h-4 ${task.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="تعديل المهمة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
