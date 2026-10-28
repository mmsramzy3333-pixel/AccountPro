import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  Mail, 
  RefreshCw, 
  Sliders, 
  Building2, 
  User, 
  Phone, 
  Link2, 
  Clock, 
  Gift, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  Client, 
  AppSettings, 
  SmartMessageSituation, 
  SmartMessageClientState, 
  SmartMessageTone, 
  TemplateGender, 
  GeneratedDualMessage 
} from '../types';
import { 
  generateSmartDualMessage, 
  SITUATION_OPTIONS, 
  CLIENT_STATE_OPTIONS, 
  TONE_OPTIONS 
} from '../utils/smartMessageEngine';
import { playAlertChime, safeOpenUrl } from '../utils/storage';

interface SmartMessageComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  settings: AppSettings;
  initialClient?: Client | null;
  initialSituation?: SmartMessageSituation;
  onLogActivity?: (clientId: string, title: string, desc: string) => void;
}

export const SmartMessageComposerModal: React.FC<SmartMessageComposerModalProps> = ({
  isOpen,
  onClose,
  clients,
  settings,
  initialClient,
  initialSituation = 'delivery',
  onLogActivity,
}) => {
  // Client selection
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || clients[0]?.id || '');
  const [customClientName, setCustomClientName] = useState<string>(initialClient?.primaryContact?.name || 'أبو فهد');
  const [customCompanyName, setCustomCompanyName] = useState<string>(initialClient?.name || 'متجر الرواد');
  const [clientPhone, setClientPhone] = useState<string>(initialClient?.primaryContact?.phone || '');

  // Message criteria
  const [situation, setSituation] = useState<SmartMessageSituation>(initialSituation);
  const [clientState, setClientState] = useState<SmartMessageClientState>('normal');
  const [tone, setTone] = useState<SmartMessageTone>('general_saudi');
  const [gender, setGender] = useState<TemplateGender>('male');

  // Specific variables
  const [serviceOrTaskName, setServiceOrTaskName] = useState<string>('تصاميم الحملة الإعلانية ومتجر سلة');
  const [attachmentLink, setAttachmentLink] = useState<string>('https://shal.agency/preview/batch-01');
  const [dueDateTime, setDueDateTime] = useState<string>('اليوم قبل 04:00 مساءً');
  const [bonusOrOffer, setBonusOrOffer] = useState<string>('فحص تقني شامل وسرعة الشيك آوت مجاناً');
  const [extraNotes, setExtraNotes] = useState<string>('');

  // Dual output state
  const [standardMessage, setStandardMessage] = useState<string>('');
  const [shortMessage, setShortMessage] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [tips, setTips] = useState<string[]>([]);

  // View mode tab: both / standard / short
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'standard' | 'short'>('both');
  const [copiedType, setCopiedType] = useState<'standard' | 'short' | null>(null);

  // AI loading state
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isAiPolished, setIsAiPolished] = useState<boolean>(false);

  // Sync client details when client select changes
  useEffect(() => {
    if (selectedClientId) {
      const found = clients.find(c => c.id === selectedClientId);
      if (found) {
        setCustomClientName(found.primaryContact?.name || found.name);
        setCustomCompanyName(found.name);
        setClientPhone(found.primaryContact?.phone || '');
        if (found.notes) {
          setExtraNotes(found.notes.slice(0, 100));
        }
      }
    }
  }, [selectedClientId, clients]);

  // Generate instant offline matrix message whenever core parameters change
  useEffect(() => {
    const result = generateSmartDualMessage({
      clientName: customClientName,
      companyName: customCompanyName,
      situation,
      clientState,
      tone,
      gender,
      serviceOrTaskName,
      attachmentLink,
      dueDateTime,
      bonusOrOffer,
      extraNotes,
    });

    setStandardMessage(result.standard);
    setShortMessage(result.short);
    setEmailSubject(result.subject || `تحديث هام - ${customCompanyName}`);
    setTips(result.tips || []);
    setIsAiPolished(false);
  }, [
    customClientName,
    customCompanyName,
    situation,
    clientState,
    tone,
    gender,
    serviceOrTaskName,
    attachmentLink,
    dueDateTime,
    bonusOrOffer,
    extraNotes,
  ]);

  // Deep AI Polish using backend gemini-3.8-flash
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/smart-message-composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: customClientName,
          companyName: customCompanyName,
          situation,
          clientState,
          tone,
          gender,
          serviceOrTaskName,
          attachmentLink,
          dueDateTime,
          bonusOrOffer,
          extraNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.standard && data.short) {
          setStandardMessage(data.standard);
          setShortMessage(data.short);
          if (data.subject) setEmailSubject(data.subject);
          if (data.tips?.length) setTips(data.tips);
          setIsAiPolished(true);
          if (settings.soundEnabled) playAlertChime('success');
        }
      }
    } catch (e) {
      console.warn('AI Composer error fallback to matrix:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: 'standard' | 'short') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Safe WhatsApp sender
  const handleSendWhatsApp = (text: string, versionLabel: string) => {
    const cleanPhone = clientPhone.replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(text);
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://api.whatsapp.com/send?text=${encoded}`;

    safeOpenUrl(url);

    if (onLogActivity && selectedClientId) {
      onLogActivity(
        selectedClientId,
        `رسالة واتساب ذكية (${versionLabel}): ${situation}`,
        text
      );
    }
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Email sender
  const handleSendEmail = (text: string) => {
    const found = clients.find(c => c.id === selectedClientId);
    const targetEmail = found?.primaryContact?.email || '';
    const subject = encodeURIComponent(emailSubject || `متابعة - ${customCompanyName}`);
    const body = encodeURIComponent(text);
    const mailto = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    safeOpenUrl(mailto);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-900 dark:to-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  صانع الرسائل والردود الذكية الفوري
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  بنسختين عادية وقصيرة ⚡️
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توليد ردود احترافية فورية تدمج بين صيغة الموقف ونفسية العميل واللهجة السعودية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateWithAi}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'جاري التحسين بالذكاء...' : 'صياغة متقدمة بالـ AI'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-200 dark:divide-slate-800">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4.5 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto">
            
            {/* 1. Client Picker & Target */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>العميل والشركة المستهدفة:</span>
              </label>

              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- عميل مخصص / يدوي --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.primaryContact?.name ? `(${c.primaryContact.name})` : ''}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="اسم المسؤول (أبو فهد / أستاذة نورة)"
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    placeholder="اسم المتجر / الشركة"
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="رقم الواتساب (مثال: +966500000000)"
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 2. Situation / Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>الموقف والغرض المطلوب:</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                  {SITUATION_OPTIONS.find(s => s.id === situation)?.labelAr}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SITUATION_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSituation(opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-start text-xs font-bold transition-all border ${
                      situation === opt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="truncate block">{opt.labelAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Client State & Psychological Mood */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                حالة العميل والموقف النفسي:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CLIENT_STATE_OPTIONS.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setClientState(st.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-start text-[11px] font-bold border transition-all ${
                      clientState === st.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : `${st.badgeColor} hover:opacity-90`
                    }`}
                  >
                    <span className="truncate block">{st.labelAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Tone & Formula */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                الصيغة والنبرة واللهجة:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as SmartMessageTone)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {TONE_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.labelAr} - {t.description}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Addressee / Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                صيغة المخاطب:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  مذكر (أستاذ) 👨
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    gender === 'female'
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  مؤنث (أستاذة) 👩
                </button>
                <button
                  type="button"
                  onClick={() => setGender('neutral')}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    gender === 'neutral'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  فريق / قروب 👥
                </button>
              </div>
            </div>

            {/* 6. Dynamic Context Inputs */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  اسم الخدمة أو التسليم:
                </label>
                <input
                  type="text"
                  value={serviceOrTaskName}
                  onChange={(e) => setServiceOrTaskName(e.target.value)}
                  placeholder="مثال: تصاميم البوستات، متجر سلة، حملة سناب"
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  رابط المعاينة / المرفق:
                </label>
                <input
                  type="text"
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    الموعد المقترح:
                  </label>
                  <input
                    type="text"
                    value={dueDateTime}
                    onChange={(e) => setDueDateTime(e.target.value)}
                    placeholder="اليوم قبل 04:00 عصراً"
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    بونص أو ميزة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={bonusOrOffer}
                    onChange={(e) => setBonusOrOffer(e.target.value)}
                    placeholder="فحص مجاني، هدية..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Dual Outputs Column (7 cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
            
            <div className="space-y-4">
              {/* Output Tab switcher */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setActiveViewTab('both')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeViewTab === 'both'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    عرض النسختين معاً
                  </button>
                  <button
                    onClick={() => setActiveViewTab('standard')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeViewTab === 'standard'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    النسخة العادية (المفصلة)
                  </button>
                  <button
                    onClick={() => setActiveViewTab('short')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeViewTab === 'short'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    النسخة القصيرة (المختصرة)
                  </button>
                </div>

                {isAiPolished && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>مُصاغة بالذكاء الاصطناعي</span>
                  </span>
                )}
              </div>

              {/* Version 1: Standard / Detailed Message */}
              {(activeViewTab === 'both' || activeViewTab === 'standard') && (
                <div className="space-y-2 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                      <h4 className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
                        النسخة العادية (شاملة ومفصلة - للإيميل أو محادثة رسمية)
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(standardMessage, 'standard')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50"
                      >
                        {copiedType === 'standard' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === 'standard' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>

                      <button
                        onClick={() => handleSendWhatsApp(standardMessage, 'عادية')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>واتساب</span>
                      </button>

                      <button
                        onClick={() => handleSendEmail(standardMessage)}
                        className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        title="إرسال إيميل"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={standardMessage}
                    onChange={(e) => setStandardMessage(e.target.value)}
                    className="w-full text-xs font-medium leading-relaxed p-3 rounded-xl border border-blue-200/80 dark:border-blue-800/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              )}

              {/* Version 2: Short / Condensed Message */}
              {(activeViewTab === 'both' || activeViewTab === 'short') && (
                <div className="space-y-2 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                        النسخة المختصرة / القصيرة (سطر إلى سطرين - سريعة للواتساب والتنبيهات)
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(shortMessage, 'short')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
                      >
                        {copiedType === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === 'short' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>

                      <button
                        onClick={() => handleSendWhatsApp(shortMessage, 'قصيرة')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>واتساب</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={shortMessage}
                    onChange={(e) => setShortMessage(e.target.value)}
                    className="w-full text-xs font-medium leading-relaxed p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-y"
                  />
                </div>
              )}

              {/* Tactical Tips for this specific situation */}
              {tips.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>نصائح ذهبية لإنجاح هذا الموقف:</span>
                  </div>
                  <ul className="space-y-1 ps-4 list-disc text-[11px] text-amber-900/90 dark:text-amber-200/80">
                    {tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Footer Summary & Close */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>المستلم: <strong>{customClientName}</strong></span>
                <span>•</span>
                <span>الحالة: <strong>{CLIENT_STATE_OPTIONS.find(s => s.id === clientState)?.labelAr}</strong></span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
              >
                إغلاق الأداة
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
