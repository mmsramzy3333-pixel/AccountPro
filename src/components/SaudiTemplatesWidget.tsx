import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Pin, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Building2, 
  User, 
  Phone, 
  Filter,
  CheckCircle2,
  RefreshCw,
  X,
  Search,
  Wand2,
  Lightbulb,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  Clock,
  Heart,
  Rocket,
  Video,
  FileCheck,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { SaudiTemplate, Client, AppSettings, TemplateGender, TemplateSituation } from '../types';
import { templateSituations, templateGenders } from '../utils/saudiTemplatesData';
import { analyzeAndSuggestDialect, DialectAnalysisResult } from '../utils/dialectSuggester';
import { playAlertChime } from '../utils/storage';
import { SmartMessageComposerModal } from './SmartMessageComposerModal';

interface SaudiTemplatesWidgetProps {
  templates: SaudiTemplate[];
  clients: Client[];
  settings: AppSettings;
  onUpdateTemplates: (templates: SaudiTemplate[]) => void;
  onLogActivity?: (clientId: string, title: string, desc: string) => void;
}

export const SaudiTemplatesWidget: React.FC<SaudiTemplatesWidgetProps> = ({
  templates,
  clients,
  settings,
  onUpdateTemplates,
  onLogActivity,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [activeSituation, setActiveSituation] = useState<string>('all');
  const [activeGender, setActiveGender] = useState<TemplateGender | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Global & Per-card dual version mode (standard vs short)
  const [globalVersionMode, setGlobalVersionMode] = useState<'standard' | 'short'>('standard');
  const [cardVersionOverrides, setCardVersionOverrides] = useState<Record<string, 'standard' | 'short'>>({});

  // Smart Message Generator Modal
  const [isComposerModalOpen, setIsComposerModalOpen] = useState(false);

  // Customization & editing states
  const [editingTemplate, setEditingTemplate] = useState<SaudiTemplate | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('checkin');
  const [newSituation, setNewSituation] = useState<TemplateSituation>('morning');
  const [newGender, setNewGender] = useState<TemplateGender>('male');
  const [newMessage, setNewMessage] = useState('');
  const [newShortMessage, setNewShortMessage] = useState('');

  // Linguistic Suggestion state inside the Editor
  const [analysisResult, setAnalysisResult] = useState<DialectAnalysisResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Safe delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // AI personalization state
  const [personalizingId, setPersonalizingId] = useState<string | null>(null);
  const [personalizedMessages, setPersonalizedMessages] = useState<Record<string, string>>({});

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Determine active version for a specific card
  const getActiveCardVersion = (tplId: string): 'standard' | 'short' => {
    return cardVersionOverrides[tplId] || globalVersionMode;
  };

  const toggleCardVersion = (tplId: string) => {
    const current = getActiveCardVersion(tplId);
    const next = current === 'standard' ? 'short' : 'standard';
    setCardVersionOverrides(prev => ({ ...prev, [tplId]: next }));
  };

  // Helper to replace placeholders with selected client data
  const formatTemplateText = (tpl: SaudiTemplate, forceVersion?: 'standard' | 'short') => {
    const activeVer = forceVersion || getActiveCardVersion(tpl.id);
    if (personalizedMessages[tpl.id] && activeVer === 'standard') {
      return personalizedMessages[tpl.id];
    }
    const name = selectedClient?.primaryContact?.name || (tpl.gender === 'female' ? 'سارة' : 'فهد');
    const company = selectedClient?.name || 'شركتكم الموقرة';
    
    let rawText = tpl.message;
    if (activeVer === 'short') {
      rawText = tpl.shortMessage || (tpl.message.length > 110 ? tpl.message.slice(0, 105) + '...' : tpl.message);
    }

    return rawText
      .replace(/\[الاسم\]/g, name)
      .replace(/\[الشركة\]/g, company)
      .replace(/\[الوقت\]/g, '11:30 صباحاً')
      .replace(/\[الرابط\]/g, 'https://meet.google.com/abc-xyz-123')
      .replace(/\[الموضوع\]/g, 'مراجعة مؤشرات الأداء والخطوات القادمة')
      .replace(/\[اليوم\]/g, 'الأربعاء');
  };

  // Copy message
  const handleCopy = (tpl: SaudiTemplate, version?: 'standard' | 'short') => {
    const text = formatTemplateText(tpl, version);
    navigator.clipboard.writeText(text);
    setCopiedId(tpl.id);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Safe WhatsApp sender (avoids popup block / iframe issues)
  const handleSendWhatsApp = (tpl: SaudiTemplate, version?: 'standard' | 'short') => {
    const text = formatTemplateText(tpl, version);
    const rawPhone = selectedClient?.primaryContact?.phone || '';
    const cleanPhone = rawPhone.replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(text);
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Create safe anchor to trigger navigation in a new tab without window.open restrictions
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onLogActivity && selectedClient) {
      onLogActivity(
        selectedClient.id,
        `رسالة واتساب سعودية: ${tpl.title}`,
        text
      );
    }
    if (settings.soundEnabled) playAlertChime('success');
  };

  // AI Personalization
  const handleAIPersonalize = async (tpl: SaudiTemplate) => {
    setPersonalizingId(tpl.id);
    try {
      const res = await fetch('/api/ai/personalize-saudi-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateText: tpl.message,
          clientName: selectedClient?.name,
          contactName: selectedClient?.primaryContact?.name,
          goal: tpl.title,
          context: selectedClient?.notes,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setPersonalizedMessages(prev => ({ ...prev, [tpl.id]: data.message }));
        if (settings.soundEnabled) playAlertChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPersonalizingId(null);
    }
  };

  // Pin / Unpin
  const handleTogglePin = (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t);
    onUpdateTemplates(updated);
  };

  // Safe Delete
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const updated = templates.filter(t => t.id !== deleteConfirmId);
    onUpdateTemplates(updated);
    setDeleteConfirmId(null);
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Open Edit Modal
  const handleOpenEdit = (tpl: SaudiTemplate) => {
    setEditingTemplate(tpl);
    setIsAddingNew(false);
    setNewShortMessage(tpl.shortMessage || '');
    setAnalysisResult(analyzeAndSuggestDialect(tpl.message));
  };

  // Open Add New Modal
  const handleOpenAddNew = () => {
    setIsAddingNew(true);
    setEditingTemplate(null);
    setNewTitle('');
    setNewCategory('checkin');
    setNewSituation('morning');
    setNewGender('male');
    setNewMessage('');
    setNewShortMessage('');
    setAnalysisResult(null);
  };

  // Run Dialect Analyzer in Editor (Fast dictionary rules + optional AI backend)
  const handleRunLinguisticAnalysis = async () => {
    const currentText = editingTemplate ? editingTemplate.message : newMessage;
    if (!currentText.trim()) return;

    // Instant local dictionary analysis
    const localResult = analyzeAndSuggestDialect(currentText);
    setAnalysisResult(localResult);
    if (settings.soundEnabled) playAlertChime('click');

    // Optional deep AI enrichment
    setIsAnalyzingAi(true);
    try {
      const gender = editingTemplate ? editingTemplate.gender : newGender;
      const situation = editingTemplate ? (editingTemplate.situation || editingTemplate.category) : newSituation;
      const res = await fetch('/api/ai/suggest-saudi-dialect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          gender: gender || 'male',
          situation: situation || 'general',
        }),
      });
      if (res.ok) {
        const aiData = await res.json();
        if (aiData.enhancedText && aiData.suggestions?.length > 0) {
          setAnalysisResult({
            originalText: currentText,
            enhancedText: aiData.enhancedText,
            suggestions: aiData.suggestions.map((s: any, idx: number) => ({
              id: `ai-sug-${idx}`,
              originalPhrase: s.originalPhrase,
              suggestedPhrase: s.suggestedPhrase,
              reason: s.reason,
              category: 'slang',
              confidence: 'high',
            })),
            score: aiData.score || 95,
            summary: aiData.feedbackSummary || localResult.summary,
          });
        }
      }
    } catch (e) {
      console.warn('AI analysis fallback used:', e);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Apply All Suggested Dialect Improvements
  const handleApplyAllSuggestions = () => {
    if (!analysisResult?.enhancedText) return;
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, message: analysisResult.enhancedText });
    } else {
      setNewMessage(analysisResult.enhancedText);
    }
    // Re-run analysis on the updated text
    setAnalysisResult(analyzeAndSuggestDialect(analysisResult.enhancedText));
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Apply Single Suggestion
  const handleApplySingleSuggestion = (original: string, replacement: string) => {
    const currentText = editingTemplate ? editingTemplate.message : newMessage;
    const regex = new RegExp(original, 'g');
    const updated = currentText.replace(regex, replacement);
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, message: updated });
    } else {
      setNewMessage(updated);
    }
    setAnalysisResult(analyzeAndSuggestDialect(updated));
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Save edit / new template
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      const updatedTpl = {
        ...editingTemplate,
        shortMessage: newShortMessage.trim() || editingTemplate.shortMessage || undefined,
      };
      const updated = templates.map(t => t.id === editingTemplate.id ? updatedTpl : t);
      onUpdateTemplates(updated);
      setEditingTemplate(null);
    } else if (isAddingNew) {
      if (!newTitle.trim() || !newMessage.trim()) return;
      const newTpl: SaudiTemplate = {
        id: 'saudi-custom-' + Date.now(),
        title: newTitle.trim(),
        category: newSituation,
        situation: newSituation,
        gender: newGender,
        message: newMessage.trim(),
        shortMessage: newShortMessage.trim() || undefined,
        pinned: false,
        tags: [newGender === 'female' ? 'مؤنث' : newGender === 'neutral' ? 'محايد' : 'مذكر', 'مخصص'],
      };
      onUpdateTemplates([newTpl, ...templates]);
      setIsAddingNew(false);
      setNewTitle('');
      setNewMessage('');
      setNewShortMessage('');
    }
    setAnalysisResult(null);
    if (settings.soundEnabled) playAlertChime('success');
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(t => {
        // Situation filter
        if (activeSituation !== 'all') {
          const matchSituation = t.situation === activeSituation || t.category === activeSituation;
          if (!matchSituation) return false;
        }

        // Gender filter
        if (activeGender !== 'all') {
          if (t.gender && t.gender !== activeGender) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchMsg = t.message.toLowerCase().includes(q);
          const matchTag = t.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchMsg && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [templates, activeSituation, activeGender, searchQuery]);

  return (
    <div className="rounded-3xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-sm space-y-5">
      
      {/* Widget Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                مكتب رسائل وقوالب الواتساب السعودية (Saudi Agency WhatsApp Desk)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                🇸🇦 مدعوم بالتلميح اللغوي
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              قوالب احترافية للصباح، المساء، بداية ونهاية العمل، الترحيب، التفعيل، والاعتمادات — بكل الصيغ (مذكر 👨، مؤنث 👩، ومحايد 👥)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Target Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setPersonalizedMessages({});
              }}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[170px]"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsComposerModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>صانع الرسائل والردود الذكية ⚡️</span>
          </button>

          <button
            onClick={handleOpenAddNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>قالب جديد</span>
          </button>
        </div>
      </div>

      {/* Global Version Mode Toggle (Standard vs Short) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
            صيغة عرض القوالب والرسائل:
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
            (متوفر بنسختين: عادية ومختصرة لجميع المواقف)
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-slate-700 shadow-2xs">
          <button
            onClick={() => {
              setGlobalVersionMode('standard');
              setCardVersionOverrides({});
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              globalVersionMode === 'standard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            <span>📄</span>
            <span>النسخة العادية (المفصلة والكاملة)</span>
          </button>

          <button
            onClick={() => {
              setGlobalVersionMode('short');
              setCardVersionOverrides({});
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              globalVersionMode === 'short'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            <span>⚡️</span>
            <span>النسخة المختصرة (سريعة للواتساب)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في القوالب بالاسم، النص، أو الوسم (مثال: صباح، ترحيب، اعتماد، ROAS)..."
            className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Gender Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">الصيغة:</span>
          {templateGenders.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGender(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeGender === g.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {g.labelAr}
            </button>
          ))}
        </div>

        {/* Situations Filter Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">الموقف:</span>
          <button
            onClick={() => setActiveSituation('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSituation === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            جميع المواقف ({templates.length})
          </button>
          {templateSituations.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSituation(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSituation === s.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.labelAr}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => {
          const activeVersion = getActiveCardVersion(tpl.id);
          const formattedMessage = formatTemplateText(tpl, activeVersion);
          const isPersonalized = !!personalizedMessages[tpl.id] && activeVersion === 'standard';
          const isPersonalizing = personalizingId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-xs relative ${
                tpl.pinned
                  ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/70 shadow-sm'
                  : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(tpl.id)}
                      title={tpl.pinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                      className={`p-1.5 rounded-lg transition-all ${
                        tpl.pinned
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${tpl.pinned ? 'fill-current' : ''}`} />
                    </button>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {tpl.title}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      title="تعديل القالب وفحص لهجته"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(tpl.id)}
                      title="حذف القالب"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges: Gender & Situation & Version Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tpl.gender && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                        tpl.gender === 'female'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : tpl.gender === 'neutral'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {tpl.gender === 'female' ? 'مؤنث 👩' : tpl.gender === 'neutral' ? 'محايد 👥' : 'مذكر 👨'}
                      </span>
                    )}
                    {tpl.situation && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {templateSituations.find(s => s.id === tpl.situation)?.labelAr || tpl.situation}
                      </span>
                    )}
                    {isPersonalized && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> مخصص ذكياً
                      </span>
                    )}
                  </div>

                  {/* Card-Level Version Switcher Pill */}
                  <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCardVersionOverrides(prev => ({ ...prev, [tpl.id]: 'standard' }))}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${
                        activeVersion === 'standard'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="عرض النسخة العادية المفصلة"
                    >
                      📄 عادية
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardVersionOverrides(prev => ({ ...prev, [tpl.id]: 'short' }))}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${
                        activeVersion === 'short'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="عرض النسخة المختصرة السريعة للواتساب"
                    >
                      ⚡️ قصيرة
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Bubble (WhatsApp Style) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1 border-b border-emerald-200/40 dark:border-emerald-900/30 pb-1">
                  <span>{activeVersion === 'standard' ? '📄 النسخة العادية (المفصلة):' : '⚡️ النسخة المختصرة (سريعة للواتساب):'}</span>
                  <span>{activeVersion === 'standard' ? 'مناسبة للإيميل والمحادثات الكاملة' : 'سطر إلى سطرين للرد العاجل'}</span>
                </div>
                {formattedMessage}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAIPersonalize(tpl)}
                    disabled={isPersonalizing}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-all"
                    title="تخصيص الرسالة لمعطيات هذا العميل"
                  >
                    <Wand2 className={`w-3.5 h-3.5 text-amber-500 ${isPersonalizing ? 'animate-spin' : ''}`} />
                    <span>{isPersonalizing ? 'جاري التخصيص...' : 'تخصيص ذكي'}</span>
                  </button>

                  {isPersonalized && (
                    <button
                      onClick={() => setPersonalizedMessages(prev => {
                        const copy = { ...prev };
                        delete copy[tpl.id];
                        return copy;
                      })}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600"
                      title="إعادة ضبط للصيغة الأصلية"
                    >
                      استعادة الأصل
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(tpl, activeVersion)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1 transition-all"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(tpl, activeVersion)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال واتساب</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لم يتم العثور على قوالب تطابق معايير التصفية
          </h4>
          <p className="text-xs text-slate-500">
            جرب تغيير الصيغة (مذكر/مؤنث/محايد) أو اختيار موقف آخر، أو قم بإنشاء قالب جديد!
          </p>
          <button
            onClick={() => { setActiveSituation('all'); setActiveGender('all'); setSearchQuery(''); }}
            className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-xs"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT TEMPLATE WITH LINGUISTIC ENHANCER */}
      {/* ========================================================= */}
      {(isAddingNew || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {editingTemplate ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {editingTemplate ? 'تعديل القالب وفحص اللهجة السعودية' : 'إنشاء قالب سعودي جديد مخصص'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    اكتب مسودتك واستخدم زر التلميح اللغوي لجعلها عفوية وباللهجة الخليجية الأصيلة
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsAddingNew(false);
                  setAnalysisResult(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Title & Situation & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    عنوان القالب *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate ? editingTemplate.title : newTitle}
                    onChange={(e) => editingTemplate ? setEditingTemplate({ ...editingTemplate, title: e.target.value }) : setNewTitle(e.target.value)}
                    placeholder="مثال: تحية الصباح للأستاذ..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الموقف والسياق *
                  </label>
                  <select
                    value={editingTemplate ? (editingTemplate.situation || editingTemplate.category) : newSituation}
                    onChange={(e) => {
                      const sit = e.target.value as TemplateSituation;
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, situation: sit, category: sit });
                      } else {
                        setNewSituation(sit);
                        setNewCategory(sit);
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none"
                  >
                    {templateSituations.map(s => (
                      <option key={s.id} value={s.id}>{s.labelAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الصيغة اللغوية *
                  </label>
                  <select
                    value={editingTemplate ? (editingTemplate.gender || 'male') : newGender}
                    onChange={(e) => {
                      const g = e.target.value as TemplateGender;
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, gender: g });
                      } else {
                        setNewGender(g);
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none"
                  >
                    <option value="male">مذكر (أستاذ / بو فلان) 👨</option>
                    <option value="female">مؤنث (أستاذة / أم فلان) 👩</option>
                    <option value="neutral">محايد / فريق وقروب 👥</option>
                  </select>
                </div>
              </div>

              {/* Message Textarea with Enhancer Action Bar */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    نص الرسالة (باللهجة السعودية الخليجية):
                  </label>

                  {/* LINGUISTIC ENHANCER TRIGGER BUTTON */}
                  <button
                    type="button"
                    onClick={handleRunLinguisticAnalysis}
                    disabled={isAnalyzingAi}
                    className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
                    title="تحليل النص واقتراح البدائل السعودية استناداً إلى القاموس"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingAi ? 'جاري الفحص...' : 'التلميح اللغوي السريع 🇸🇦✨'}</span>
                  </button>
                </div>

                <textarea
                  required
                  rows={5}
                  value={editingTemplate ? editingTemplate.message : newMessage}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, message: val });
                    } else {
                      setNewMessage(val);
                    }
                  }}
                  placeholder="يا هلا ومسهلا يا بو [الاسم]، عساك مروق.. شيكت على أرقام الحملات الصباح وكل الأمور تفتح النفس..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans outline-none focus:border-emerald-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>الوسوم المتاحة للاستبدال التلقائي: [الاسم]، [الشركة]، [الوقت]، [الرابط]</span>
                  <div className="flex items-center gap-1">
                    {['[الاسم]', '[الشركة]', '[الوقت]', '[الرابط]'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentText = editingTemplate ? editingTemplate.message : newMessage;
                          const updated = currentText + ' ' + tag;
                          if (editingTemplate) setEditingTemplate({ ...editingTemplate, message: updated });
                          else setNewMessage(updated);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Message Textarea (النسخة المختصرة أو القصيرة) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>النسخة المختصرة / القصيرة (سطر إلى سطرين للواتساب السريع):</span>
                  </label>
                  <span className="text-[10px] text-slate-400">اختياري - تُولد تلقائياً إن تركت فارغة</span>
                </div>

                <textarea
                  rows={2}
                  value={editingTemplate ? (editingTemplate.shortMessage || newShortMessage) : newShortMessage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewShortMessage(val);
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, shortMessage: val });
                    }
                  }}
                  placeholder="يا هلا يا بو [الاسم] ⚡️ تم إنجاز المطلوب لـ [الشركة] وبانتظار اعتمادك السريع. تسلم يا بعدي."
                  className="w-full text-xs sm:text-sm p-3 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans outline-none focus:border-emerald-500"
                />
              </div>

              {/* LINGUISTIC ENHANCER SUGGESTION BOX (APPEARS ON CLICK) */}
              {analysisResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-slate-800/90 dark:via-emerald-950/30 dark:to-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-md space-y-3 animate-in fade-in">
                  
                  {/* Score & Summary Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {analysisResult.score}%
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>تحليل اللهجة السعودية والقرب الثقافي</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {analysisResult.summary}
                        </p>
                      </div>
                    </div>

                    {analysisResult.suggestions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleApplyAllSuggestions}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تطبيق كافة التعديلات المقترحة فوراً</span>
                      </button>
                    )}
                  </div>

                  {/* List of Detected Suggestions */}
                  {analysisResult.suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        الكلمات المرصودة والبدائل السعودية المقترحة من القاموس:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {analysisResult.suggestions.map((sug) => (
                          <div
                            key={sug.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-1 text-xs shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="line-through text-slate-400 font-medium">
                                {sug.originalPhrase}
                              </span>
                              <span className="text-emerald-500 font-bold">➔</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                {sug.suggestedPhrase}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {sug.reason}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleApplySingleSuggestion(sug.originalPhrase, sug.suggestedPhrase)}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 text-left self-end mt-1"
                            >
                              + تطبيق هذا التعديل
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>صياغة ممتازة ومكتوبة بلهجة سعودية أصيلة ولبقة بالكامل!</span>
                    </div>
                  )}

                  {/* Enhanced Preview Text */}
                  {analysisResult.suggestions.length > 0 && analysisResult.enhancedText && (
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block">
                        معاينة النص المقترح بعد التحسين:
                      </span>
                      <p className="font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
                        {analysisResult.enhancedText}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsAddingNew(false);
                    setAnalysisResult(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all"
                >
                  {editingTemplate ? 'حفظ التعديلات' : 'إضافة القالب'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SAFE IN-APP DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                حذف القالب؟
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا القالب؟ يمكنك دائماً إعادة إضافته في أي وقت.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Dual Message Composer Modal */}
      <SmartMessageComposerModal
        isOpen={isComposerModalOpen}
        onClose={() => setIsComposerModalOpen(false)}
        clients={clients}
        settings={settings}
        initialClient={selectedClient}
        initialSituation={activeSituation !== 'all' ? (activeSituation as any) : 'delivery'}
        onLogActivity={onLogActivity}
      />

    </div>
  );
};
