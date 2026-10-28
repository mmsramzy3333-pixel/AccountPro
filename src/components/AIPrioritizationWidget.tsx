import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  Flame,
  PhoneCall,
  MessageSquare,
  Mail,
  Zap
} from 'lucide-react';
import { Task, Client, AIPrioritizationResult, AIPrioritizedTaskItem } from '../types';
import { playAlertChime } from '../utils/storage';

interface AIPrioritizationWidgetProps {
  tasks: Task[];
  clients: Client[];
  prioritizationResult: AIPrioritizationResult | null;
  isLoading: boolean;
  onRefreshPrioritization: () => void;
  onApplyAIOrder: (orderedTaskIds: string[]) => void;
  onSelectClient?: (client: Client) => void;
}

export const AIPrioritizationWidget: React.FC<AIPrioritizationWidgetProps> = ({
  tasks,
  clients,
  prioritizationResult,
  isLoading,
  onRefreshPrioritization,
  onApplyAIOrder,
  onSelectClient,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (!prioritizationResult?.scheduledTasks) return;
    const ids = prioritizationResult.scheduledTasks.map(t => t.taskId);
    onApplyAIOrder(ids);
    setApplied(true);
    playAlertChime('success');
    setTimeout(() => setApplied(false), 3000);
  };

  if (!prioritizationResult && !isLoading) {
    return (
      <div className="rounded-2xl p-5 border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/70 via-blue-50/60 to-purple-50/70 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-purple-950/30 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                الترتيب الذكي للمهام والعمليات (AI Order of Operations)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                دع الذكاء الاصطناعي يحلل مواعيد الاستحقاق وسجل تواصل العملاء والمخاطر المالية ليقترح الجدول الزمني الأمثل لليوم.
              </p>
            </div>
          </div>
          <button
            onClick={onRefreshPrioritization}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ترتيب وجدولة اليوم بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                الترتيب الذكي لعمليات اليوم (AI Optimal Schedule)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                تحليل تلقائي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ترتيب مبني على القيمة المالية، مخاطر الإلغاء، ومواعيد التسليم
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            disabled={isLoading || !prioritizationResult?.scheduledTasks?.length}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              applied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{applied ? 'تم تطبيق الترتيب بنجاح!' : 'تطبيق هذا الترتيب على مهام اليوم'}</span>
          </button>

          <button
            onClick={onRefreshPrioritization}
            disabled={isLoading}
            title="إعادة التحليل وتحديث الترتيب"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            جاري تحليل مخاطر الحسابات ومواعيد الاستحقاق لإنشاء الجدول الزمني الأمثل...
          </p>
        </div>
      )}

      {expanded && prioritizationResult && !isLoading && (
        <div className="space-y-3.5 pt-1">
          {/* Strategy Summary & Focus Rationale */}
          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                {prioritizationResult.strategySummary}
              </p>
            </div>
            {prioritizationResult.focusRationale && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pr-6">
                💡 <span className="font-semibold text-indigo-600 dark:text-indigo-400">التبرير العملي: </span>
                {prioritizationResult.focusRationale}
              </p>
            )}
          </div>

          {/* Scheduled Timeline */}
          <div className="space-y-2">
            {prioritizationResult.scheduledTasks.map((item, idx) => {
              const matchedClient = clients.find(c => c.name === item.clientName || c.id === item.taskId);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Time Slot Badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="ltr:font-mono">{item.suggestedTimeSlot}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.taskTitle}
                        </span>
                        {item.clientName && (
                          <span 
                            onClick={() => matchedClient && onSelectClient?.(matchedClient)}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            🏢 {item.clientName}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgencyLevel === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : item.urgencyLevel === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {item.urgencyLevel === 'critical' ? 'حرج وفوري' : item.urgencyLevel === 'high' ? 'أولوية عالية' : 'مهم'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Impact score & suggested action */}
                  <div className="flex items-center gap-2 sm:shrink-0 self-end sm:self-center">
                    <div className="text-left rtl:text-right">
                      <div className="text-[10px] text-slate-400 font-medium">معدل التأثير</div>
                      <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {item.impactScore}/100
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>{item.suggestedAction}</span>
                    </div>
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
