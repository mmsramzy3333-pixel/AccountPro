import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Star, 
  Building2, 
  Edit2, 
  Trash2,
  X,
  Filter,
  CheckCheck,
  AlertTriangle,
  GripVertical
} from 'lucide-react';
import { Task, Client, AppSettings, Priority } from '../types';
import { playAlertChime } from '../utils/storage';
import { getClientColorPalette } from '../utils/clientColors';

interface TasksCalendarViewProps {
  tasks: Task[];
  clients: Client[];
  settings: AppSettings;
  onToggleTask: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  tasks,
  clients,
  settings,
  onToggleTask,
  onToggleStar,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: string; tasks: Task[] } | null>(null);
  
  // Drag and Drop rescheduling state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [rescheduledNotice, setRescheduledNotice] = useState<string | null>(null);

  // Filters inside calendar
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'urgent' | 'completed'>('all');
  const [filterClientId, setFilterClientId] = useState<string>('all');

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  const handleDragOverCell = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeaveCell = (e: React.DragEvent, dateStr: string) => {
    if (dragOverDate === dateStr) {
      setDragOverDate(null);
    }
  };

  const handleDropOnCell = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId) return;

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    if (targetTask.dueDate === targetDateStr) return;

    // Reschedule task
    onEditTask({
      ...targetTask,
      dueDate: targetDateStr,
    });

    if (settings.soundEnabled) playAlertChime('success');
    setRescheduledNotice(`تمت إعادة جدولة المهمة "${targetTask.title}" إلى ${targetDateStr}`);
    setTimeout(() => setRescheduledNotice(null), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month & total days
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Helper for safe YYYY-MM-DD generation without timezone shift
  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Month Name in current language
  const monthName = currentDate.toLocaleDateString(
    settings.language === 'ar' ? 'ar-EG' : settings.language === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Day names of the week
  const weekDays = settings.language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : settings.language === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter tasks based on calendar filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus === 'pending' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'urgent' && (task.completed || (task.priority !== 'urgent' && !task.isStarred))) return false;
      if (filterClientId !== 'all' && task.clientId !== filterClientId) return false;
      return true;
    });
  }, [tasks, filterStatus, filterClientId]);

  // Map tasks by dueDate
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of filteredTasks) {
      if (!map[task.dueDate]) {
        map[task.dueDate] = [];
      }
      map[task.dueDate].push(task);
    }
    return map;
  }, [filteredTasks]);

  // Month Statistics
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate.startsWith(monthPrefix));
  }, [tasks, monthPrefix]);

  const monthTotal = thisMonthTasks.length;
  const monthCompleted = thisMonthTasks.filter(t => t.completed).length;
  const monthPending = thisMonthTasks.filter(t => !t.completed).length;
  const monthUrgent = thisMonthTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.isStarred)).length;

  // Calendar matrix calculation
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevY = month === 0 ? year - 1 : year;
    const prevM = month === 0 ? 11 : month - 1;
    const dateStr = formatDateStr(prevY, prevM, dayNum);
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      tasks: tasksByDate[dateStr] || [],
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(year, month, day);
    calendarCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      tasks: tasksByDate[dateStr] || [],
    });
  }

  // 3. Next month leading days (to fill complete weeks)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    const nextY = month === 11 ? year + 1 : year;
    const nextM = month === 11 ? 0 : month + 1;
    const dateStr = formatDateStr(nextY, nextM, nextDay);
    calendarCells.push({
      dateStr,
      dayNum: nextDay,
      isCurrentMonth: false,
      tasks: tasksByDate[dateStr] || [],
    });
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Calendar Top Navigation Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        
        {/* Month Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                {monthName}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {monthTotal} مهام هذا الشهر
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              جدول المهام والمتابعات الشهرية لمدير الحسابات
            </p>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Quick status tabs inside calendar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              قيد التنفيذ ({monthPending})
            </button>
            <button
              onClick={() => setFilterStatus('urgent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'urgent'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              عاجلة ({monthUrgent})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              مكتملة ({monthCompleted})
            </button>
          </div>

          {/* Client Filter */}
          <select
            value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">كل العملاء</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Month Stepper Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 eye-care:bg-[#eee7dc] text-slate-800 dark:text-slate-200 transition-colors"
            >
              اليوم
            </button>

            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={prevMonth}
                title={settings.language === 'ar' ? 'الشهر السابق' : 'Previous Month'}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {settings.language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={nextMonth}
                title={settings.language === 'ar' ? 'الشهر القادم' : 'Next Month'}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {settings.language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Month Metrics Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">إجمالي مهام الشهر</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{monthTotal}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">قيد التنفيذ والمتابعة</span>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{monthPending}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">عاجلة وذات أولوية</span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{monthUrgent}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">مهام منجزة بنجاح</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{monthCompleted}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Drag & Drop Notice & Reschedule Success Banner */}
      {rescheduledNotice && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-200" />
            <span>{rescheduledNotice}</span>
          </div>
          <button 
            onClick={() => setRescheduledNotice(null)}
            className="text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visual Instruction & Hint Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <span className="p-1 rounded-lg bg-blue-600 text-white">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="font-extrabold">الجدولة التفاعلية بالسحب والإفلات:</span>
          <span className="text-slate-600 dark:text-slate-400">
            يمكنك سحب أي مهمة وإفلاتها على أي يوم لنقلها وإعادة جدولتها فوراً.
          </span>
        </div>
        <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
          {filteredTasks.length} مهام معروضة
        </div>
      </div>

      {/* Client Color Legend Bar (دليل تمييز العملاء بنقاط ملونة) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              دليل تمييز العملاء بالألوان (Visual Client Color Palette):
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            انقر على أي عميل لتصفية مهامه في التقويم
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterClientId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterClientId === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            جميع العملاء ({clients.length})
          </button>

          {clients.map(c => {
            const color = getClientColorPalette(c.id, clients);
            const isSelected = filterClientId === c.id;
            const clientTaskCount = tasks.filter(t => t.clientId === c.id).length;

            return (
              <button
                key={c.id}
                onClick={() => setFilterClientId(isSelected ? 'all' : c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                  isSelected
                    ? `${color.bgLightClass} ${color.textClass} ${color.borderClass} ring-2 ${color.ringColor} shadow-xs font-black`
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${color.dotColor} shadow-2xs`} />
                <span>{c.name}</span>
                <span className="text-[10px] opacity-75">({clientTaskCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] overflow-hidden bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] shadow-xs">
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-slate-50/70 dark:bg-slate-800/50 eye-care:bg-[#ede5d8] text-center text-xs font-bold text-slate-600 dark:text-slate-300 py-3">
          {weekDays.map((d, idx) => (
            <div key={idx} className="truncate px-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid with Drag and Drop Support */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60 eye-care:divide-[#e5dcce] rtl:divide-x-reverse">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const hasTasks = cell.tasks.length > 0;
            const completedCount = cell.tasks.filter(t => t.completed).length;
            const isCellDragOver = dragOverDate === cell.dateStr;

            return (
              <div
                key={idx}
                onDragOver={(e) => handleDragOverCell(e, cell.dateStr)}
                onDragLeave={(e) => handleDragLeaveCell(e, cell.dateStr)}
                onDrop={(e) => handleDropOnCell(e, cell.dateStr)}
                onClick={() => {
                  if (hasTasks) {
                    setSelectedDayTasks({ date: cell.dateStr, tasks: cell.tasks });
                  } else {
                    onOpenNewTaskWithDate(cell.dateStr);
                  }
                }}
                className={`min-h-[115px] p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400 opacity-60'
                    : 'hover:bg-blue-50/30 dark:hover:bg-slate-800/40 eye-care:hover:bg-[#eae1d3]'
                } ${isToday ? 'bg-blue-50/60 dark:bg-blue-950/30 font-bold' : ''} ${
                  isCellDragOver ? 'ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-950/80 shadow-md scale-[1.01] z-10' : ''
                }`}
              >
                {/* Cell Header: Day Number + Add Button + Drop Indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {isCellDragOver && (
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 animate-pulse">
                        أفلت هنا
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewTaskWithDate(cell.dateStr);
                    }}
                    title="إضافة مهمة لهذا اليوم"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Task pills inside the cell with Drag & Client Color Dots */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {cell.tasks.slice(0, 3).map((task) => {
                    const clientColor = getClientColorPalette(task.clientId || '', clients);
                    const client = clients.find(c => c.id === task.clientId);
                    const isDraggingThis = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayTasks({ date: cell.dateStr, tasks: cell.tasks });
                        }}
                        title={`المهمة: ${task.title} • العميل: ${client?.name || 'عام'} (اسحب لنقل المهمة)`}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate flex items-center gap-1 border transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02] shadow-2xs ${
                          isDraggingThis ? 'opacity-30 scale-95 border-dashed border-blue-500' : ''
                        } ${
                          task.completed
                            ? 'line-through opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            : task.priority === 'urgent'
                            ? 'bg-rose-50/90 text-rose-800 dark:bg-rose-950/90 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                            : task.priority === 'high'
                            ? 'bg-amber-50/90 text-amber-800 dark:bg-amber-950/90 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Drag Handle Icon on hover */}
                        <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0 -mr-0.5 group-hover:opacity-80" />

                        {/* Client Distinct Color Dot */}
                        <span 
                          title={`نقطة تمييز العميل: ${client?.name || 'عام'}`}
                          className={`w-2 h-2 rounded-full shrink-0 shadow-2xs ${clientColor.dotColor}`} 
                        />

                        {/* Title */}
                        <span className="truncate flex-1">{task.title}</span>

                        {/* Client Abbreviation Tag */}
                        {client && (
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black shrink-0 truncate max-w-[42px] ${clientColor.bgLightClass} ${clientColor.textClass}`}>
                            {client.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Overflown tasks count */}
                  {cell.tasks.length > 3 && (
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold px-1">
                      +{cell.tasks.length - 3} مهام إضافية
                    </div>
                  )}
                </div>

                {/* Cell Footer: Task summary indicator */}
                {hasTasks && (
                  <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{cell.tasks.length} مهام</span>
                    {completedCount === cell.tasks.length && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks Inspector Drawer / Modal */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    مهام ومتابعات يوم {selectedDayTasks.date}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedDayTasks.tasks.length} مهام مجدولة لهذا التاريخ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = selectedDayTasks.date;
                    setSelectedDayTasks(null);
                    onOpenNewTaskWithDate(d);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>مهمة جديدة</span>
                </button>

                <button
                  onClick={() => setSelectedDayTasks(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
              {selectedDayTasks.tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد مهام مسجلة لهذا اليوم.
                </div>
              ) : (
                selectedDayTasks.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-70 border-slate-200/60 dark:border-slate-800'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-bold ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {task.title}
                          </span>

                          {task.priority === 'urgent' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              عاجل جداً
                            </span>
                          )}
                          {task.priority === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              مرتفع
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                          {task.clientName && (() => {
                            const clientColor = getClientColorPalette(task.clientId || '', clients);
                            return (
                              <span className={`font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${clientColor.bgLightClass} ${clientColor.textClass} ${clientColor.borderClass}`}>
                                <span className={`w-2 h-2 rounded-full ${clientColor.dotColor}`} />
                                <span>{task.clientName}</span>
                              </span>
                            );
                          })()}
                          {task.dueTime && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onToggleStar(task.id)}
                        className={`p-1.5 rounded-lg ${task.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDayTasks(null);
                          onEditTask(task);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onDeleteTask(task.id);
                          setSelectedDayTasks({
                            ...selectedDayTasks,
                            tasks: selectedDayTasks.tasks.filter(t => t.id !== task.id),
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDayTasks(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
