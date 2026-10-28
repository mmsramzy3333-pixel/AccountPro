import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  X, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  User, 
  Calendar, 
  Lightbulb, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck, 
  Compass, 
  ChevronDown,
  Target,
  ExternalLink
} from 'lucide-react';
import { Client, AppSettings, WinBackApproach, TemplateGender } from '../types';
import { comprehensiveWinBackHooks, winBackApproachCategories } from '../utils/winBackData';
import { analyzeAndSuggestDialect, DialectAnalysisResult } from '../utils/dialectSuggester';
import { playAlertChime, safeOpenUrl } from '../utils/storage';

interface WinBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: Client | null;
  clients: Client[];
  settings: AppSettings;
  onLogActivity?: (clientId: string, title: string, desc: string) => void;
}

export const WinBackModal: React.FC<WinBackModalProps> = ({
  isOpen,
  onClose,
  initialClient,
  clients,
  settings,
  onLogActivity,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClient?.id || clients.find(c => c.stage === 'closed' || c.stage === 'at-risk')?.id || clients[0]?.id || ''
  );
  const [selectedApproach, setSelectedApproach] = useState<'all' | WinBackApproach>('all');
  const [selectedHookId, setSelectedHookId] = useState<string>(comprehensiveWinBackHooks[0]?.id || '');
  const [selectedGender, setSelectedGender] = useState<TemplateGender>('male');
  const [customizedMessage, setCustomizedMessage] = useState<string>('');
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DialectAnalysisResult | null>(null);
  const [showObjections, setShowObjections] = useState(true);

  const currentClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || initialClient || clients[0];
  }, [clients, selectedClientId, initialClient]);

  const filteredHooks = useMemo(() => {
    if (selectedApproach === 'all') return comprehensiveWinBackHooks;
    return comprehensiveWinBackHooks.filter(h => h.approach === selectedApproach);
  }, [selectedApproach]);

  const activeHook = useMemo(() => {
    return comprehensiveWinBackHooks.find(h => h.id === selectedHookId) || filteredHooks[0] || comprehensiveWinBackHooks[0];
  }, [selectedHookId, filteredHooks]);

  // Compute substituted message
  const rawBaseMessage = activeHook?.messages[selectedGender] || '';
  const substitutedMessage = useMemo(() => {
    if (!currentClient) return rawBaseMessage;
    const clientName = currentClient.primaryContact?.name || currentClient.name || 'العميل';
    const company = currentClient.companyName || currentClient.name || 'شركتكم';
    const industry = currentClient.industry || 'قطاعكم';

    return rawBaseMessage
      .replace(/\[الاسم\]/g, clientName)
      .replace(/\[الشركة\]/g, company)
      .replace(/\[المجال\]/g, industry);
  }, [rawBaseMessage, currentClient]);

  const activeMessageText = isEditingManually ? customizedMessage : substitutedMessage;

  // Handle Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessageText);
    setCopied(true);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Send WhatsApp
  const handleSendWhatsApp = () => {
    if (!currentClient) return;
    const phone = currentClient.primaryContact?.phone || '';
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const encoded = encodeURIComponent(activeMessageText);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    
    safeOpenUrl(url);
    if (onLogActivity) {
      onLogActivity(
        currentClient.id,
        'إرسال دخلة استرجاع (Win-Back)',
        `تم إرسال رسالة استرجاع بعنوان: "${activeHook.title}" بصيغة ${selectedGender}`
      );
    }
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Run Linguistic Analysis
  const handleAnalyzeDialect = () => {
    const res = analyzeAndSuggestDialect(activeMessageText);
    setAnalysisResult(res);
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Apply All Dialect Suggestions
  const handleApplyAllSuggestions = () => {
    if (!analysisResult) return;
    setIsEditingManually(true);
    setCustomizedMessage(analysisResult.enhancedText);
    setAnalysisResult(null);
    if (settings.soundEnabled) playAlertChime('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  دخلات وسيناريوهات استرجاع العملاء القدامى 🎯
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Client Win-Back Playbook
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مداخل ذكية وغير مباشرة وعاطفية ومساعدة مجانية لفتح الباب مع العميل وإعادة إحياء التعاون
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Selector & Info Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 block">العميل المستهدف للاسترجاع:</span>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setIsEditingManually(false);
                  setAnalysisResult(null);
                }}
                className="text-xs sm:text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.companyName}) {c.stage === 'closed' ? '🔴 سابق' : c.stage === 'at-risk' ? '⚠️ مهدد' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentClient && (
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 font-bold">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {currentClient.primaryContact?.name || 'المسؤول'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {currentClient.industry}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                currentClient.stage === 'closed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {currentClient.stage === 'closed' ? 'عميل سابق مغلق' : currentClient.stage === 'at-risk' ? 'معرض للإلغاء' : currentClient.stage}
              </span>
            </div>
          )}
        </div>

        {/* Strategy Categories Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            اختر نوع وزاوية الدخلة الاستراتيجية:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedApproach('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedApproach === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              جميع المداخل ({comprehensiveWinBackHooks.length})
            </button>
            {winBackApproachCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedApproach(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedApproach === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.titleAr}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Hook Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
          {filteredHooks.map(hook => {
            const isSelected = hook.id === activeHook.id;
            return (
              <div
                key={hook.id}
                onClick={() => {
                  setSelectedHookId(hook.id);
                  setIsEditingManually(false);
                  setAnalysisResult(null);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1 text-xs ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {hook.title}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                    {hook.approachBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {hook.situationContext}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hook Deep Details Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 text-blue-950 dark:text-blue-200 space-y-0.5">
            <span className="font-bold text-[10px] text-blue-600 block">⏰ التوقيت الذهبي للإرسال:</span>
            <span className="text-[11px] font-medium">{activeHook.timingAdvice}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 text-amber-950 dark:text-amber-200 space-y-0.5">
            <span className="font-bold text-[10px] text-amber-600 block">🧠 السر النفسي للدخلة:</span>
            <span className="text-[11px] font-medium line-clamp-2">{activeHook.psychologicalTrigger}</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 text-purple-950 dark:text-purple-200 space-y-0.5">
            <span className="font-bold text-[10px] text-purple-600 block">💡 سياق الاستخدام:</span>
            <span className="text-[11px] font-medium line-clamp-2">{activeHook.situationContext}</span>
          </div>
        </div>

        {/* Gender Bar & Linguistic Enhancer Bar */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">صيغة المخاطب:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
                {(['male', 'female', 'neutral'] as TemplateGender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGender(g);
                      setIsEditingManually(false);
                      setAnalysisResult(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedGender === g
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {g === 'male' ? 'مذكر 👨' : g === 'female' ? 'مؤنث 👩' : 'محايد 👥'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Linguistic Hint Trigger */}
            <button
              onClick={handleAnalyzeDialect}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs flex items-center gap-1.5 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>التلميح اللغوي السريع 🇸🇦✨</span>
            </button>
          </div>

          {/* Interactive Editable Message Area */}
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={activeMessageText}
              onChange={(e) => {
                setIsEditingManually(true);
                setCustomizedMessage(e.target.value);
              }}
              placeholder="نص الرسالة المخصص..."
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white font-sans outline-none focus:border-emerald-500 leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>تم استبدال [الاسم] و [الشركة] بمعطيات العميل تلقائياً. يمكنك التعديل على النص مباشرة.</span>
              {isEditingManually && (
                <button
                  onClick={() => setIsEditingManually(false)}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  استعادة النص الأصلي
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Linguistic Analysis Panel if open */}
        {analysisResult && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 shadow-md space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  {analysisResult.score}%
                </span>
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white">تحليل اللهجة السعودية والقرب الثقافي</h5>
                  <p className="text-[11px] text-slate-500">{analysisResult.summary}</p>
                </div>
              </div>
              {analysisResult.suggestions.length > 0 && (
                <button
                  onClick={handleApplyAllSuggestions}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  تطبيق كافة التعديلات المقترحة فوراً
                </button>
              )}
            </div>

            {analysisResult.suggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {analysisResult.suggestions.map(s => (
                  <div key={s.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between">
                    <span className="line-through text-slate-400">{s.originalPhrase}</span>
                    <span className="text-emerald-600 font-bold">➔ {s.suggestedPhrase}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Objections Matrix Toggle */}
        <div className="space-y-2">
          <button
            onClick={() => setShowObjections(!showObjections)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>مصفوفة الردود المتوقعة: إذا رد العميل بـ (الميزانية مقفلة / مع وكالة أخرى)... كيف تتصرف؟</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showObjections ? 'rotate-180' : ''}`} />
          </button>

          {showObjections && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {activeHook.clientResponsesAndHandling.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                    <span>إذا قال:</span>
                    <span>"{item.ifClientSays}"</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 pr-2 border-r-2 border-emerald-500 text-[11px] leading-relaxed">
                    <strong>ردك:</strong> {item.suggestedReply}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    💡 {item.tacticNote}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Golden Rule Warning */}
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-rose-800 dark:text-rose-300 block text-[11px]">
              تنبيه حاسم (ما لا يجب قوله أبداً 🚫):
            </span>
            <p className="text-[11px] text-rose-700 dark:text-rose-300/90 leading-relaxed">
              {activeHook.goldenRule}
            </p>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            إغلاق
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرسالة</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>إرسال واتساب للعميل 💬</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
