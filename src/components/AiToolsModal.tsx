import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  TrendingUp, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Building2
} from 'lucide-react';
import { Client, AppSettings } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime, safeOpenUrl } from '../utils/storage';

interface AiToolsModalProps {
  initialMode?: 'email' | 'advisor';
  initialClient?: Client;
  clients: Client[];
  settings: AppSettings;
  onClose: () => void;
  onLogActivity?: (clientId: string, title: string, desc: string) => void;
}

export const AiToolsModal: React.FC<AiToolsModalProps> = ({
  initialMode = 'email',
  initialClient,
  clients,
  settings,
  onClose,
  onLogActivity,
}) => {
  const t = getT(settings.language);
  const [activeTab, setActiveTab] = useState<'email' | 'advisor'>(initialMode);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || clients[0]?.id || '');
  
  const selectedClient = clients.find(c => c.id === selectedClientId) || initialClient || clients[0];

  // Email Drafter States
  const [emailGoal, setEmailGoal] = useState('متابعة دورية للاطمئنان على سير العمل والخدمات');
  const [emailTone, setEmailTone] = useState('مهني وودود');
  const [emailContext, setEmailContext] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Advisor States
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);
  const [advisorData, setAdvisorData] = useState<{
    summary: string;
    riskLevel?: string;
    actionItems: string[];
    recommendedUpsell?: string;
  } | null>(null);

  // Handle Generate Email
  const handleGenerateEmail = async () => {
    if (!selectedClient) return;
    setLoadingEmail(true);
    try {
      const res = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedClient.name,
          contactName: selectedClient.primaryContact?.name,
          goal: emailGoal,
          context: emailContext || selectedClient.notes,
          tone: emailTone,
          language: settings.language,
        }),
      });
      const data = await res.json();
      setGeneratedEmail({
        subject: data.subject || `متابعة الشراكة - ${selectedClient.name}`,
        body: data.body || '',
      });
      if (settings.soundEnabled) playAlertChime('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEmail(false);
    }
  };

  // Handle Generate Advisor
  const handleGenerateAdvisor = async () => {
    if (!selectedClient) return;
    setLoadingAdvisor(true);
    try {
      const res = await fetch('/api/ai/account-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          language: settings.language,
        }),
      });
      const data = await res.json();
      setAdvisorData(data);
      if (settings.soundEnabled) playAlertChime('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvisor(false);
    }
  };

  // Auto generate on tab / client switch
  useEffect(() => {
    if (activeTab === 'email' && !generatedEmail) {
      handleGenerateEmail();
    } else if (activeTab === 'advisor' && !advisorData) {
      handleGenerateAdvisor();
    }
  }, [activeTab, selectedClientId]);

  // Copy email
  const handleCopyEmail = () => {
    if (!generatedEmail) return;
    const fullText = `الموضوع: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Send via client mailto
  const handleSendMail = () => {
    if (!generatedEmail || !selectedClient) return;
    const emailTo = selectedClient.primaryContact?.email || '';
    const sub = encodeURIComponent(generatedEmail.subject);
    const body = encodeURIComponent(generatedEmail.body);
    safeOpenUrl(`mailto:${emailTo}?subject=${sub}&body=${body}`);

    if (onLogActivity) {
      onLogActivity(
        selectedClient.id,
        `إرسال إيميل: ${generatedEmail.subject}`,
        `تمت صياغة وإرسال إيميل متابعة عبر منصة الذكاء الاصطناعي.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                أدوات الذكاء الاصطناعي لمدير الحسابات
              </h3>
              <p className="text-xs text-slate-500">
                تسريع المهام اليومية، كتابة المتابعات، واستشارات تعزيز الاحتفاظ بالعملاء
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Selection Bar & Mode Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-800 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>صياغة إيميل ذكي</span>
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>استشارات صحة الحساب</span>
            </button>
          </div>

          {/* Client Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium">العميل المستهدف:</span>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setGeneratedEmail(null);
                setAdvisorData(null);
              }}
              className="flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stage})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* TAB 1: Email Drafter */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              
              {/* Parameters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الهدف من الرسالة:
                  </label>
                  <select
                    value={emailGoal}
                    onChange={(e) => setEmailGoal(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="اعتماد خطة المحتوى والتصاميم للأسبوع">اعتماد خطة المحتوى والتصاميم (Agency)</option>
                    <option value="تحديث ومتابعة أداء الإعلانات ومبيعات المتجر">تحديث أداء الإعلانات والـ ROAS</option>
                    <option value="طلب متطلبات ناقصة لحملة جديدة (أكواد خصم/صور)">طلب متطلبات وأصول إعلانية</option>
                    <option value="متابعة دورية للاطمئنان على سير العمل والخدمات">متابعة واطمئنان دوري</option>
                    <option value="مناقشة تجديد العقد السنوي وتقديم الامتيازات">مقترح تجديد عقد الوكالة وبونص</option>
                    <option value="حل مشكلة أو تعديل تصميم وتأكيد الرضا">تعديل سريع واعتذار مهني</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نبرة الصوت (Tone):
                  </label>
                  <select
                    value={emailTone}
                    onChange={(e) => setEmailTone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="لهجة سعودية خليجية عفوية واحترافية للواتساب (Marketing Agency)">سعودي عفوي وودي للواتساب 🇸🇦</option>
                    <option value="مهني وودود">مهني وودود (إيميل رسمي)</option>
                    <option value="تنفيذي ومباشر">تنفيذي ومباشر</option>
                    <option value="مقنع ومحفز للرد">مقنع ومحفز للرد</option>
                  </select>
                </div>
              </div>

              {/* Extra context */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  سياق أو ملاحظات إضافية تريد ذكرها (اختياري):
                </label>
                <input
                  type="text"
                  value={emailContext}
                  onChange={(e) => setEmailContext(e.target.value)}
                  placeholder="مثال: نريد التأكيد على تخفيض 10%، وإتاحة التدريب مجاناً..."
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              {/* Re-generate button */}
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateEmail}
                  disabled={loadingEmail}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingEmail ? 'animate-spin' : ''}`} />
                  <span>{loadingEmail ? 'جاري صياغة الإيميل...' : 'إعادة الصياغة'}</span>
                </button>
              </div>

              {/* Generated Result Box */}
              {generatedEmail && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
                      موضوع الإيميل (Subject):
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {generatedEmail.subject}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block mb-1">
                      نص الإيميل (Body):
                    </span>
                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 font-sans">
                      {generatedEmail.body}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'تم النسخ!' : 'نسخ النص'}</span>
                    </button>

                    <button
                      onClick={handleSendMail}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>فتح في بريدك وإرسال</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Retention Advisor */}
          {activeTab === 'advisor' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    التحليل الاستراتيجي وخطة الاحتفاظ بـ {selectedClient?.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    مؤشر صحة الحساب: {selectedClient?.healthScore}% • القيمة السنوية: {selectedClient?.annualValue?.toLocaleString()} {selectedClient?.currency}
                  </p>
                </div>

                <button
                  onClick={handleGenerateAdvisor}
                  disabled={loadingAdvisor}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAdvisor ? 'animate-spin' : ''}`} />
                  <span>{loadingAdvisor ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
                </button>
              </div>

              {advisorData && (
                <div className="space-y-4">
                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        التقييم العام للمخاطر:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                        {advisorData.riskLevel || (selectedClient?.healthScore < 60 ? 'مرتفع' : 'منخفض')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                      {advisorData.summary}
                    </p>
                  </div>

                  {/* 3 Action Items */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>الخطوات الموصى بها لمدير الحساب:</span>
                    </h5>
                    {advisorData.actionItems?.map((act, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {act}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Upsell Idea */}
                  {advisorData.recommendedUpsell && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>فرصة التوسع وزيادة الإيراد (Upsell Opportunity):</span>
                      </div>
                      <p className="text-amber-900 dark:text-amber-200">
                        {advisorData.recommendedUpsell}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
