import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Volume2,
  Trash2,
  Lightbulb,
  Compass,
  ArrowRightLeft,
  GraduationCap,
  MessageCircle,
  Layers,
  Heart,
  Share2,
  HelpCircle,
  RotateCcw,
  Star,
  ExternalLink,
  MapPin,
  TrendingUp,
  Award,
  Tag,
  Calendar,
  Target,
  Rocket,
  ShieldCheck
} from 'lucide-react';
import { SaudiDictionaryEntry, AppSettings, WinBackApproach } from '../types';
import { 
  saudiPhoneticRules, 
  saudiChatAbbreviations,
  dialectComparisons,
  regionalDialectGuides,
  etiquetteReplyMatrix,
  chatDialogueScenarios,
  goldenLearningRules,
  dialectQuizQuestions
} from '../utils/saudiDictionaryData';
import { comprehensiveWinBackHooks, winBackApproachCategories } from '../utils/winBackData';
import { playAlertChime } from '../utils/storage';

interface SaudiDictionaryViewProps {
  entries: SaudiDictionaryEntry[];
  settings: AppSettings;
  onUpdateEntries: (entries: SaudiDictionaryEntry[]) => void;
}

export const SaudiDictionaryView: React.FC<SaudiDictionaryViewProps> = ({
  entries,
  settings,
  onUpdateEntries,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'words' | 'bridge' | 'regions' | 'etiquette' | 'scenarios' | 'rules' | 'phonetics' | 'shortcuts' | 'quiz' | 'winback' | 'add'
  >('words');

  // Win-Back State
  const [winBackApproach, setWinBackApproach] = useState<'all' | WinBackApproach>('all');
  const [winBackSearch, setWinBackSearch] = useState('');
  const [selectedHookId, setSelectedHookId] = useState<string>(comprehensiveWinBackHooks[0]?.id || '');
  const [winBackGenderView, setWinBackGenderView] = useState<'male' | 'female' | 'neutral'>('male');

  // Search & Filters in Words Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Dialect Bridge Search
  const [bridgeSearch, setBridgeSearch] = useState('');
  const [selectedSourceDialect, setSelectedSourceDialect] = useState<'all' | 'egyptian' | 'levantine' | 'maghrebi'>('all');

  // Etiquette Search
  const [etiquetteSearch, setEtiquetteSearch] = useState('');

  // Scenarios State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(chatDialogueScenarios[0]?.id || '');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // New Word Form State
  const [newWord, setNewWord] = useState('');
  const [newLetter, setNewLetter] = useState('أ');
  const [newMeaning, setNewMeaning] = useState('');
  const [newContext, setNewContext] = useState<SaudiDictionaryEntry['context']>('courtesy');
  const [newChatExample, setNewChatExample] = useState('');
  const [newChatTip, setNewChatTip] = useState('');
  const [newRegion, setNewRegion] = useState<SaudiDictionaryEntry['region']>('general');
  const [newEgyptian, setNewEgyptian] = useState('');
  const [newLevantine, setNewLevantine] = useState('');

  // Alphabet list for quick jumping
  const alphabet = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];

  const categories = [
    { id: 'all', label: 'جميع الكلمات' },
    { id: 'courtesy', label: 'لباقة وتأكيد استجابة' },
    { id: 'appreciation', label: 'شكر وتقدير' },
    { id: 'apology', label: 'اعتذار ورضا عميل' },
    { id: 'marketing', label: 'إيجنسي وماركتنج' },
    { id: 'agreement', label: 'طمأنة ومسؤولية' },
    { id: 'greeting', label: 'ترحيب وتشريف' },
    { id: 'urgency', label: 'استعجال ودي' },
  ];

  const regions = [
    { id: 'all', label: 'كل المناطق' },
    { id: 'najdi', label: 'نجدي (الرياض والقصيم)' },
    { id: 'hijazi', label: 'حجازي (جدة ومكة)' },
    { id: 'sharqawi', label: 'شرقاوي (الدمام والخبر)' },
    { id: 'janoubi', label: 'جنوبي (أبها وعسير)' },
    { id: 'general', label: 'عام وشائع' },
  ];

  // Text-to-Speech function
  const handleSpeak = (text: string, id: string) => {
    setPlayingAudioId(id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\*\#\_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 1500);
    }
  };

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Entries in Words Tab
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = entry.word.toLowerCase().includes(q);
        const matchMeaning = entry.meaning.toLowerCase().includes(q);
        const matchExample = entry.chatExample.toLowerCase().includes(q);
        const matchTip = entry.chatTip.toLowerCase().includes(q);
        const matchTag = entry.tags?.some(t => t.toLowerCase().includes(q));
        const matchEg = entry.equivalentInEgyptian?.toLowerCase().includes(q);
        const matchLev = entry.equivalentInLevantine?.toLowerCase().includes(q);
        if (!matchWord && !matchMeaning && !matchExample && !matchTip && !matchTag && !matchEg && !matchLev) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && entry.context !== selectedCategory) {
        return false;
      }

      // Region
      if (selectedRegion !== 'all') {
        if (entry.region && entry.region !== selectedRegion) {
          return false;
        }
      }

      // Letter
      if (selectedLetter !== 'all' && entry.letter !== selectedLetter) {
        return false;
      }

      return true;
    }).sort((a, b) => a.word.localeCompare(b.word, 'ar'));
  }, [entries, searchQuery, selectedCategory, selectedRegion, selectedLetter]);

  // Filtered Dialect Bridge
  const filteredBridge = useMemo(() => {
    return dialectComparisons.filter((item) => {
      if (!bridgeSearch.trim()) return true;
      const q = bridgeSearch.toLowerCase().trim();
      return (
        item.concept.toLowerCase().includes(q) ||
        item.saudiPhrase.toLowerCase().includes(q) ||
        item.egyptianPhrase.toLowerCase().includes(q) ||
        item.levantinePhrase.toLowerCase().includes(q) ||
        item.maghrebiPhrase.toLowerCase().includes(q) ||
        item.contextTip.toLowerCase().includes(q)
      );
    });
  }, [bridgeSearch]);

  // Filtered Etiquette Rules
  const filteredEtiquette = useMemo(() => {
    return etiquetteReplyMatrix.filter((item) => {
      if (!etiquetteSearch.trim()) return true;
      const q = etiquetteSearch.toLowerCase().trim();
      return (
        item.ifClientSays.toLowerCase().includes(q) ||
        item.youReplyWith.toLowerCase().includes(q) ||
        item.whatItMeans.toLowerCase().includes(q) ||
        item.whyThisWorks.toLowerCase().includes(q)
      );
    });
  }, [etiquetteSearch]);

  // Quiz Score Calculation
  const quizScore = useMemo(() => {
    let correct = 0;
    dialectQuizQuestions.forEach((q) => {
      const selectedIndex = quizAnswers[q.id];
      if (selectedIndex !== undefined && q.options[selectedIndex]?.isCorrect) {
        correct++;
      }
    });
    return correct;
  }, [quizAnswers]);

  // Filtered Win-Back Hooks
  const filteredWinBackHooks = useMemo(() => {
    return comprehensiveWinBackHooks.filter((hook) => {
      if (winBackApproach !== 'all' && hook.approach !== winBackApproach) {
        return false;
      }
      if (winBackSearch.trim()) {
        const q = winBackSearch.toLowerCase().trim();
        const matchTitle = hook.title.toLowerCase().includes(q);
        const matchContext = hook.situationContext.toLowerCase().includes(q);
        const matchTrigger = hook.psychologicalTrigger.toLowerCase().includes(q);
        const matchMsgM = hook.messages.male.toLowerCase().includes(q);
        const matchMsgF = hook.messages.female.toLowerCase().includes(q);
        const matchMsgN = hook.messages.neutral.toLowerCase().includes(q);
        if (!matchTitle && !matchContext && !matchTrigger && !matchMsgM && !matchMsgF && !matchMsgN) {
          return false;
        }
      }
      return true;
    });
  }, [winBackApproach, winBackSearch]);

  const activeHook = useMemo(() => {
    return comprehensiveWinBackHooks.find(h => h.id === selectedHookId) || filteredWinBackHooks[0] || comprehensiveWinBackHooks[0];
  }, [selectedHookId, filteredWinBackHooks]);

  // Handle Add Custom Entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    const matchedCategory = categories.find(c => c.id === newContext);
    const newEntry: SaudiDictionaryEntry = {
      id: 'custom-dict-' + Date.now(),
      letter: newLetter || newWord.charAt(0),
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      context: newContext,
      contextLabel: matchedCategory?.label || 'عام',
      chatExample: newChatExample.trim() || `يا هلا والله يا غالي.. ${newWord.trim()}`,
      chatTip: newChatTip.trim() || 'مصطلح دارج ومناسب لمحادثات الشات مع العملاء.',
      isCommonInBusiness: true,
      tags: [newWord.trim(), 'مخصص'],
      region: newRegion,
      equivalentInEgyptian: newEgyptian.trim() || undefined,
      equivalentInLevantine: newLevantine.trim() || undefined,
    };

    const updated = [newEntry, ...entries];
    onUpdateEntries(updated);

    // Reset
    setNewWord('');
    setNewMeaning('');
    setNewChatExample('');
    setNewChatTip('');
    setNewEgyptian('');
    setNewLevantine('');
    setActiveTab('words');
    if (settings.soundEnabled) playAlertChime('success');
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    onUpdateEntries(updated);
  };

  const activeScenario = chatDialogueScenarios.find(s => s.id === selectedScenarioId) || chatDialogueScenarios[0];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header Grand Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white relative overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl">🇸🇦</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                أكاديمية وقاموس اللهجة السعودية الاحترافية للوكالات
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                مرجع معتمد لمديري الحسابات
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              الموسوعة الشاملة للهجة والتعامل مع العميل السعودي
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-3xl leading-relaxed">
              دليلك الكامل والعملي لإتقان التواصل اليومي على الواتساب والاجتماعات: من قواعد الحروف ونطقها، لمصطلحات البيزنس والميديا، لجسر مقارنة اللهجات، مع محاكي سيناريوهات شات حية وكويز تفاعلي لاختبار احترافيتك.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-300/90 font-medium">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {entries.length}+ كلمة ومصطلح موثق
              </span>
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                {dialectComparisons.length} مقارنة بين اللهجات
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                {chatDialogueScenarios.length} سيناريوهات شات حية
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-400" />
                {goldenLearningRules.length} قواعد ذهبية للنجاح
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>اختبر لهجتك</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مصطلح</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] pb-2 overflow-x-auto scrollbar-none">
        
        {/* Tab 1: Words */}
        <button
          onClick={() => setActiveTab('words')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'words'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>القاموس الموسوعي ({entries.length})</span>
        </button>

        {/* Tab 2: Dialect Bridge */}
        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'bridge'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>جسر اللهجات (من لهجتك للسعودي)</span>
        </button>

        {/* Tab 3: Etiquette Matrix */}
        <button
          onClick={() => setActiveTab('etiquette')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'etiquette'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>إذا قال العميل كذا... ترد بكذا</span>
        </button>

        {/* Tab 4: Scenarios */}
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'scenarios'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>محاكي محادثات الواتساب ({chatDialogueScenarios.length})</span>
        </button>

        {/* Tab 5: Regional Dialects */}
        <button
          onClick={() => setActiveTab('regions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'regions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>دليل مناطق السعودية</span>
        </button>

        {/* Tab 6: Master Rules */}
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>القواعد الذهبية للتعامل</span>
        </button>

        {/* Tab 7: Phonetics & Writing */}
        <button
          onClick={() => setActiveTab('phonetics')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'phonetics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>قواعد نطق وإملاء الحروف ({saudiPhoneticRules.length})</span>
        </button>

        {/* Tab 8: Shortcuts */}
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'shortcuts'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>اختصارات الشات ({saudiChatAbbreviations.length})</span>
        </button>

        {/* Tab 9: Quiz */}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'quiz'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>اختبار الخبير 🎓</span>
        </button>

        {/* Tab 10: Win-Back Hooks & Scenarios */}
        <button
          onClick={() => setActiveTab('winback')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'winback'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md ring-2 ring-emerald-400/40'
              : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>دخلات استرجاع العملاء القدامى 🎯 ({comprehensiveWinBackHooks.length})</span>
        </button>

        {/* Tab 11: Add Word */}
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'add'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كلمة</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: WORDS & VOCABULARY */}
      {/* ========================================================= */}
      {activeTab === 'words' && (
        <div className="space-y-5">
          
          {/* Search, Filter & Quick Letters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كلمة، معنى، أو مصطلح (مثال: أبشر، لا هنت، ROAS، ازهلها، على هالخشم)..."
                  className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  مسح البحث
                </button>
              )}
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">المنطقة:</span>
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedRegion === reg.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 eye-care:bg-[#efe8dc] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">التصنيف:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 eye-care:bg-[#efe8dc] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Alphabet Scroller */}
            <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] scrollbar-none">
              <button
                onClick={() => setSelectedLetter('all')}
                className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedLetter === 'all'
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                الكل
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedLetter === letter
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              عرض <strong className="text-slate-800 dark:text-slate-200">{filteredEntries.length}</strong> مصطلح
              {selectedLetter !== 'all' && ` بحرف (${selectedLetter})`}
              {selectedCategory !== 'all' && ` في تصنيف (${categories.find(c => c.id === selectedCategory)?.label})`}
            </span>
            <span className="text-slate-400">انقر على 🔊 لسماع النطق، أو 📋 لنسخ العبارة</span>
          </div>

          {/* Grid of Dictionary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 shadow-xs flex flex-col justify-between group space-y-4"
              >
                {/* Top Row: Word & Actions */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 eye-care:bg-[#ece4d6] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-200/50 dark:border-emerald-800/40">
                        {entry.letter}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {entry.word}
                        </h3>
                        {entry.pronunciation && (
                          <span className="text-[11px] font-mono text-slate-400 block" dir="ltr">
                            /{entry.pronunciation}/
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Audio Button */}
                      <button
                        onClick={() => handleSpeak(entry.word, entry.id + '-word')}
                        title="استمع للنطق الصوتي"
                        className={`p-2 rounded-xl text-xs transition-all ${
                          playingAudioId === entry.id + '-word'
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 eye-care:bg-[#efe8dc] text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Word */}
                      <button
                        onClick={() => handleCopy(entry.word, entry.id + '-copy')}
                        title="نسخ المصطلح"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 eye-care:bg-[#efe8dc] text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all"
                      >
                        {copiedId === entry.id + '-copy' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete Custom Entry */}
                      {entry.id.startsWith('custom-') && (
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="حذف هذا المصطلح المخصص"
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Badges: Category & Region */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                      {entry.contextLabel}
                    </span>
                    {entry.region && entry.region !== 'general' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40">
                        {regions.find(r => r.id === entry.region)?.label.split(' ')[0]}
                      </span>
                    )}
                    {entry.isCommonInBusiness && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                        شائع في شات الأعمال 💼
                      </span>
                    )}
                  </div>

                  {/* Meaning */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {entry.meaning}
                  </p>
                </div>

                {/* Dialect Equivalents (Egyptian / Levantine) */}
                {(entry.equivalentInEgyptian || entry.equivalentInLevantine) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 eye-care:bg-[#efe8dc] text-[11px] space-y-1 border border-slate-200/50 dark:border-slate-800">
                    <span className="font-bold text-slate-500 block text-[10px]">المعادل في اللهجات الأخرى:</span>
                    {entry.equivalentInEgyptian && (
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-blue-600 dark:text-blue-400">بالمصري 🇪🇬:</span> {entry.equivalentInEgyptian}
                      </div>
                    )}
                    {entry.equivalentInLevantine && (
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">بالشامي 🇸🇾🇱🇧:</span> {entry.equivalentInLevantine}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Example */}
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 eye-care:bg-[#efe8dc] border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      طريقة كتابتها بالواتساب مع العميل:
                    </span>
                    <button
                      onClick={() => handleCopy(entry.chatExample, entry.id + '-chat')}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      {copiedId === entry.id + '-chat' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ الرسالة</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-sans select-all">
                    "{entry.chatExample}"
                  </p>
                </div>

                {/* Account Manager Pro-Tip */}
                <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">تلميحة للأكاونت مانجر:</strong> {entry.chatTip}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                لم يتم العثور على مصطلحات مطابقة
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمة البحث أو اختيار تصنيف آخر، أو قم بإضافة هذا المصطلح الجديد فوراً!
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLetter('all'); }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-xs"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DIALECT BRIDGE (جسر المقارنة بين اللهجات) */}
      {/* ========================================================= */}
      {activeTab === 'bridge' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white space-y-2 border border-teal-800">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold">جسر اللهجات: من لهجتك الأصلية إلى السعودي الاحترافي</h3>
            </div>
            <p className="text-xs text-teal-100/80 leading-relaxed max-w-3xl">
              إذا كنت معتاداً على التحدث بالمصرية، الشامية، أو المغاربية وتريد معرفة كيف تقول نفس العبارة بلهجة سعودية طبيعية وراقية تليق بمدير حسابات محترف دون تكلف أو أخطاء.
            </p>
          </div>

          {/* Search in Bridge */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={bridgeSearch}
                onChange={(e) => setBridgeSearch(e.target.value)}
                placeholder="ابحث عن العبارة (مثال: حاضر من عيوني، إيه رأيك، دلوقتي، معلش، عايز، متقلقش)..."
                className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Dialect Comparisons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBridge.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 transition-all shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg">
                    {item.concept}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeak(item.audioText, item.id + '-audio')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600"
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.saudiPhrase, item.id + '-copy')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600"
                      title="نسخ العبارة السعودية"
                    >
                      {copiedId === item.id + '-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary: Saudi Formulation */}
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    🇸🇦 العبارة السعودية الاحترافية المعتمدة:
                  </span>
                  <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                    {item.saudiPhrase}
                  </p>
                </div>

                {/* Other Dialects */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <span className="text-slate-500 font-bold">بالمصري 🇪🇬:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.egyptianPhrase}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <span className="text-slate-500 font-bold">بالشامي 🇸🇾🇱🇧:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.levantinePhrase}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <span className="text-slate-500 font-bold">بالمغاربي 🇲🇦:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.maghrebiPhrase}</span>
                  </div>
                </div>

                {/* Tip */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-500">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{item.contextTip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ETIQUETTE REPLY MATRIX */}
      {/* ========================================================= */}
      {activeTab === 'etiquette' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white space-y-2 border border-amber-800/50 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">مصفوفة الإتيكيت والردود السريعة: إذا قال لك العميل كذا... ترد بكذا</h3>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed max-w-3xl">
              أهم عبارات المجاملات والتقدير في الثقافة السعودية والردود الأوتوماتيكية الصحيحة عليها لتجنب الإحراج والظهور بأعلى درجات الشهامة واللباقة.
            </p>
          </div>

          {/* Search in Etiquette */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={etiquetteSearch}
                onChange={(e) => setEtiquetteSearch(e.target.value)}
                placeholder="ابحث في عبارات العميل أو الردود (بيض الله وجهك، ما قصرت، عساك عالقوة، لاهنت، سمّ)..."
                className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEtiquette.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 transition-all shadow-xs space-y-3"
              >
                {/* Client Trigger */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    💬 إذا قال لك العميل في الشات أو المكالمة:
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    "{rule.ifClientSays}"
                  </h4>
                  <span className="text-[11px] text-slate-500 block">
                    المعنى المقصود: {rule.whatItMeans}
                  </span>
                </div>

                {/* You Reply With */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      ترد عليه فوراً بهذه العبارة المعتمدة:
                    </span>
                    <button
                      onClick={() => handleCopy(rule.youReplyWith, rule.id)}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copiedId === rule.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ الرد</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-amber-950 dark:text-amber-100 leading-relaxed select-all">
                    "{rule.youReplyWith}"
                  </p>
                </div>

                {/* Why This Works */}
                <div className="pt-1 text-[11px] text-slate-500 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>سر التأثير:</strong> {rule.whyThisWorks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LIVE WHATSAPP SCENARIOS SIMULATOR */}
      {/* ========================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white space-y-2 border border-emerald-800/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">محاكي محادثات الواتساب الحية لمديري الحسابات</h3>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-3xl">
              سيناريوهات واقعية حية من واقع التعامل اليومي للوكالات: ترحيب بالعميل الجديد، اقتراح ميزانية، احتواء عميل غاضب، متابعة فواتير، واستعجال اعتمادات.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {chatDialogueScenarios.map((scen) => (
              <button
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                  selectedScenarioId === scen.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{scen.title.split(':')[0]}</span>
                <span className="text-[10px] opacity-80 px-1.5 py-0.5 bg-black/15 rounded">
                  {scen.category}
                </span>
              </button>
            ))}
          </div>

          {/* Active Scenario Display: WhatsApp Simulated Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* WhatsApp Chat Box */}
            <div className="lg:col-span-2 rounded-3xl bg-[#0b141a] text-slate-100 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              
              {/* WhatsApp Header Bar */}
              <div className="px-5 py-3.5 bg-[#202c33] border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                    🏢
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      قروب الواتساب: {activeScenario.title.split(':')[1]?.trim() || activeScenario.title}
                    </h4>
                    <span className="text-[11px] text-emerald-400">
                      متصل الآن • فريق التسويق والعميل
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const fullText = activeScenario.messages.map(m => `${m.sender === 'client' ? 'العميل' : 'الأكاونت مانجر'}: ${m.text}`).join('\n\n');
                    handleCopy(fullText, 'full-scenario');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#111b21] hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  {copiedId === 'full-scenario' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ المحادثة كاملة</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div 
                className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(18, 140, 126, 0.05) 0%, transparent 80%)',
                  backgroundColor: '#0b141a',
                }}
              >
                {/* Situation Context Banner */}
                <div className="p-3 rounded-xl bg-[#182229] border border-slate-700/60 text-center text-xs text-slate-300">
                  <strong className="text-emerald-400">الموقف:</strong> {activeScenario.situation}
                </div>

                {activeScenario.messages.map((msg, index) => {
                  const isManager = msg.sender === 'account_manager';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isManager ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 px-2">
                        {isManager ? 'الأكاونت مانجر (أنت) 👔' : 'العميل (بو فهد / صاحب المتجر) 👤'}
                      </span>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl relative shadow-md ${
                          isManager
                            ? 'bg-[#005c4b] text-white rounded-br-xs'
                            : 'bg-[#202c33] text-slate-100 rounded-bl-xs'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-all font-sans">
                          {msg.text}
                        </p>

                        <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/10 text-[10px] opacity-75">
                          <span>{isManager ? '09:42 ص' : '09:44 ص'}</span>
                          <button
                            onClick={() => handleCopy(msg.text, `msg-${index}`)}
                            className="hover:underline flex items-center gap-1"
                            title="نسخ هذه الرسالة"
                          >
                            {copiedId === `msg-${index}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                            <span>نسخ</span>
                          </button>
                        </div>
                      </div>

                      {/* Manager Tactical Note */}
                      {msg.note && (
                        <div className="max-w-[85%] text-[10px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                          💡 <strong>تحليل تكتيكي:</strong> {msg.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Scenario Strategy & Pro-Tips Sidebar */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>أسرار نجاح هذا السيناريو:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeScenario.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                    نصائح تكتيكية لمدير الحساب:
                  </span>
                  <ul className="space-y-2">
                    {activeScenario.proTips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ready to Chat Widget */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-xs space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  🚀 هل ترغب في استخدام هذه الرسائل الآن؟
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  يمكنك نسخ أي رسالة مباشرة والتعديل على اسم العميل أو أرقام الحملة وإرسالها فوراً في شات الواتساب!
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: REGIONAL DIALECTS */}
      {/* ========================================================= */}
      {activeTab === 'regions' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-white space-y-2 border border-blue-900/60 shadow-sm">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold">دليل مناطق واللهجات السعودية لمدير الحساب</h3>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed max-w-3xl">
              تختلف نبرة الخطاب وبعض المفردات المفضلة بين عميل الرياض، عميل جدة، عميل الخبر، وعميل أبها. تعرف على مفاتيح كل منطقة وكيف تتحدث بلباقة تتناغم مع ثقافة عميلك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {regionalDialectGuides.map((region) => (
              <div
                key={region.regionKey}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {region.nameAr}
                    </h4>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      المدن الرئيسية: {region.cities}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {region.description}
                </p>

                {/* Tone Advice */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px]">
                    🎯 نبرة التخاطب الموصى بها للأكاونت مانجر:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {region.toneAdvice}
                  </p>
                </div>

                {/* Key Phrases in this Region */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    أشهر الكلمات المفتاحية في هذه المنطقة:
                  </span>
                  <div className="space-y-1.5">
                    {region.keyPhrases.map((phrase, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start justify-between gap-2"
                      >
                        <div className="text-xs space-y-0.5">
                          <strong className="text-emerald-800 dark:text-emerald-300">
                            {phrase.word}:
                          </strong>
                          <span className="text-slate-600 dark:text-slate-400 mr-1.5">
                            {phrase.meaning}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            مثال: "{phrase.example}"
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(phrase.example, `${region.regionKey}-${idx}`)}
                          className="p-1 text-slate-400 hover:text-emerald-600"
                          title="نسخ المثال"
                        >
                          {copiedId === `${region.regionKey}-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: MASTER RULES */}
      {/* ========================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white space-y-2 border border-purple-900/60 shadow-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">القواعد الذهبية لغير السعوديين للتحدث كالمحترفين</h3>
            </div>
            <p className="text-xs text-purple-100/80 leading-relaxed max-w-3xl">
              إذا كنت قادماً من مصر، الشام، المغرب العربي، أو أي بلد شقيق.. هذه هي القواعد الذهبية السريعة التي تضمن لك إتقان اللهجة والقبول الفوري لدى أي عميل سعودي دون تصنع.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goldenLearningRules.map((rule) => (
              <div
                key={rule.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-sm shrink-0 border border-purple-300 dark:border-purple-800">
                    {rule.number}
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {rule.title}
                    </h4>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold block">
                      {rule.subtitle}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rule.description}
                </p>

                {/* Do's & Don'ts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      افعل دائماً (Do):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      {rule.dos.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 space-y-1.5">
                    <span className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      تجنب تماماً (Don't):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      {rule.donts.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Practical Example */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-500 block text-[10px]">التطبيق العملي في الشات:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                    {rule.practicalExample}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: PHONETICS & WRITING */}
      {/* ========================================================= */}
      {activeTab === 'phonetics' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white space-y-2 border border-emerald-800/40">
            <h3 className="text-lg font-bold">قواعد نطق وإملاء الحروف في شات الواتساب السعودي</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-3xl">
              توضح هذه القواعد الفروق الدقيقة بين النطق الصوتي للكلمات الخليجية وطريقة كتابتها الصحيحة في الشات المهني دون أخطاء إملائية تضعف الثقة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saudiPhoneticRules.map((rule, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-sm shrink-0 border border-emerald-300 dark:border-emerald-800">
                    {rule.letter.split(' ')[0]}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {rule.ruleTitle}
                    </h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                      {rule.letter}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-0.5">
                      قاعدة النطق الصوتي:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rule.pronunciationRule}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      قاعدة الكتابة في الشات المهني:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {rule.chatWritingRule}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-[11px] space-y-1">
                  <span className="font-bold text-slate-500 block">نموذج الاستخدام الأمثل:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 font-sans">
                    "{rule.example}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: CHAT SHORTCUTS & ABBREVIATIONS */}
      {/* ========================================================= */}
      {activeTab === 'shortcuts' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white space-y-2 border border-emerald-800/40">
            <h3 className="text-lg font-bold">اختصارات وأكواد الشات السريعة لمديري الحسابات</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-3xl">
              أشهر الرموز والاختصارات المستخدمة في الشات اليومي مع نماذج رسائل جاهزة للنسخ والاستخدام الفوري مع عملائك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saudiChatAbbreviations.map((abbr, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                    {abbr.abbr}
                  </span>
                  <button
                    onClick={() => handleCopy(abbr.chatSnippet, `abbr-${index}`)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedId === `abbr-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200">
                    {abbr.fullPhrase}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>المعنى:</strong> {abbr.meaning}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong>سياق الاستخدام:</strong> {abbr.usageContext}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-[10px] mb-1">
                    الرسالة الجاهزة للشات:
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 select-all font-sans">
                    "{abbr.chatSnippet}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: INTERACTIVE DIALECT MASTERY QUIZ */}
      {/* ========================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white space-y-2 border border-amber-800/50">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">اختبار خبير اللهجة السعودية لمديري الحسابات</h3>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed max-w-3xl">
              اختبر مهاراتك في اختيار الردود الصحيحة للمواقف اليومية، وتجنب الأخطاء القاتلة في الشات. احصل على نتيجتك فوراً وتعرف على النصائح الاحترافية.
            </p>
          </div>

          {/* Quiz Score Box if Submitted */}
          {quizSubmitted && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white text-center space-y-3 shadow-lg border border-emerald-700">
              <span className="text-3xl">🏆</span>
              <h3 className="text-xl font-extrabold">
                نتيجتك: {quizScore} من {dialectQuizQuestions.length}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mx-auto">
                {quizScore === dialectQuizQuestions.length
                  ? 'ما شاء الله تبارك الرحمن! خبير حقيقي وتتحدث بلهجة ولباقة سعودية احترافية 100%! 🚀'
                  : quizScore >= dialectQuizQuestions.length / 2
                  ? 'ممتاز جداً! لديك أساسيات قوية وبمراجعة القواعد والسيناريوهات ستصبح محترفاً لا يُعلى عليه.'
                  : 'بداية جيدة! راجع القواعد الذهبية وجسر اللهجات لإتقان أسرار التواصل مع العميل السعودي.'}
              </p>
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-emerald-50 transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار</span>
              </button>
            </div>
          )}

          {/* Quiz Questions List */}
          <div className="space-y-5">
            {dialectQuizQuestions.map((q, qIndex) => {
              const selectedOptionIndex = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-sm shrink-0 border border-amber-300 dark:border-amber-800">
                      {qIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </h4>
                      <span className="text-xs text-slate-400 block mt-1">
                        السياق: {q.situationContext}
                      </span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOptionIndex === optIndex;
                      let optionStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-500';
                      
                      if (quizSubmitted) {
                        if (opt.isCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                        } else if (isSelected && !opt.isCorrect) {
                          optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200';
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                          className={`w-full p-3.5 rounded-xl border text-right text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${optionStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400'
                          }`}>
                            {isSelected ? '✓' : String.fromCharCode(65 + optIndex)}
                          </span>
                          <div className="flex-1">
                            <span>{opt.text}</span>
                            {quizSubmitted && isSelected && (
                              <p className={`text-[11px] mt-1.5 font-normal ${opt.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                {opt.feedback}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 border border-amber-200/50 dark:border-amber-900/30">
                      💡 <strong>تلميحة ذهبية:</strong> {q.proTip}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setQuizSubmitted(true);
                  if (settings.soundEnabled) playAlertChime('success');
                }}
                className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-md transition-all transform hover:scale-[1.02]"
              >
                اعتماد الإجابات ومعاينة النتيجة والتحليل 🚀
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: WIN-BACK HOOKS & SCENARIOS (استرجاع العملاء القدامى) */}
      {/* ========================================================= */}
      {activeTab === 'winback' && (
        <div className="space-y-6">
          
          {/* Win-Back Grand Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 text-white relative overflow-hidden border border-emerald-800/50 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                حقيبة وسيناريوهات استرجاع وإعادة تفعيل العملاء القدامى (Client Win-Back Playbook)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                دخلات ذكية وغير مباشرة بدون إلحاح
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              كيف تفتح الباب بلباقة وتدعو العميل السابق لتجربة جديدة؟
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-3xl leading-relaxed">
              استراتيجيات وتكتيكات متقدمة مبنية على علم النفس وثقافة قطاع الأعمال السعودي: من الدخلات غير المباشرة وملاحظات السوق، للمداخل العاطفية وتقدير العشرة، والمساعدة المجانية عبر تدقيق الحسابات، وصولاً لباقات السبرنت التجريبية وعروض المواسم.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-300/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                {comprehensiveWinBackHooks.length} مداخل تكتيكية متنوعة
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                صيغ ثلاثية كاملة (مذكر 👨 / مؤنث 👩 / محايد 👥)
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                مصفوفة الرد على اعتراضات العميل والتردد
              </span>
            </div>
          </div>

          {/* Search & Approach Category Filter */}
          <div className="space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={winBackSearch}
                onChange={(e) => setWinBackSearch(e.target.value)}
                placeholder="ابحث في سيناريوهات الاسترجاع (مثال: تريند، ميزانية، خصم، عاطفي، تدقيق، رمضان، سبرنت)..."
                className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            {/* Approach Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setWinBackApproach('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  winBackApproach === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                جميع المداخل ({comprehensiveWinBackHooks.length})
              </button>

              {winBackApproachCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setWinBackApproach(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    winBackApproach === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.titleAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* List of Hooks (Right Column - 5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  المداخل المتاحة ({filteredWinBackHooks.length})
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  اضغط على أي دخلة لمعاينة تفاصيلها
                </span>
              </div>

              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-0.5 scrollbar-thin">
                {filteredWinBackHooks.map((hook) => {
                  const isSelected = hook.id === activeHook?.id;
                  const categoryMeta = winBackApproachCategories.find(c => c.id === hook.approach);

                  return (
                    <div
                      key={hook.id}
                      onClick={() => setSelectedHookId(hook.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            <RotateCcw className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                              {hook.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {categoryMeta?.titleAr || hook.approachBadge}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {hook.approachBadge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {hook.situationContext}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>⏰ {hook.timingAdvice.split(' ')[0]} {hook.timingAdvice.split(' ')[1] || ''}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {isSelected ? '✓ معروضة حالياً' : 'عرض التفاصيل ➔'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredWinBackHooks.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                    <Target className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      لم نجد أي دخلة تطابق البحث
                    </p>
                    <button
                      onClick={() => { setWinBackApproach('all'); setWinBackSearch(''); }}
                      className="text-xs text-emerald-600 font-bold underline"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Hook Detailed View (Left Column - 7 cols) */}
            {activeHook && (
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-md space-y-5">
                  
                  {/* Hook Title & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {activeHook.approachBadge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        {activeHook.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <button
                        onClick={() => handleCopy(activeHook.messages[winBackGenderView], activeHook.id + '-' + winBackGenderView)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                      >
                        {copiedId === activeHook.id + '-' + winBackGenderView ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الرسالة</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(activeHook.messages[winBackGenderView], activeHook.id)}
                        disabled={playingAudioId === activeHook.id}
                        title="استمع لنطق الرسالة"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all"
                      >
                        <Volume2 className={`w-4 h-4 ${playingAudioId === activeHook.id ? 'animate-bounce text-emerald-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Strategic Context & Psychology Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* When to use */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                        متى وسياق الاستخدام:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {activeHook.situationContext}
                      </p>
                    </div>

                    {/* Timing advice */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                      <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        التوقيت الذهبي للإرسال:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {activeHook.timingAdvice}
                      </p>
                    </div>

                    {/* Psychological trigger */}
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        السر النفسي وراء نجاح هذه الدخلة:
                      </span>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeHook.psychologicalTrigger}
                      </p>
                    </div>
                  </div>

                  {/* Gender Selector Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        اختر صيغة المخاطب:
                      </span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                          onClick={() => setWinBackGenderView('male')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            winBackGenderView === 'male'
                              ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          مذكر 👨
                        </button>
                        <button
                          onClick={() => setWinBackGenderView('female')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            winBackGenderView === 'female'
                              ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          مؤنث 👩
                        </button>
                        <button
                          onClick={() => setWinBackGenderView('neutral')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            winBackGenderView === 'neutral'
                              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          محايد / فريق 👥
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp-Style Message Box */}
                    <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all relative shadow-xs">
                      <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 rounded">
                        جاهزة للإرسال 💬
                      </div>
                      <p className="mt-3">
                        {activeHook.messages[winBackGenderView]}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>💡 يمكنك استبدال الوسوم: [الاسم]، [الشركة]، [المجال] بمعطيات العميل الحقيقية.</span>
                      <button
                        onClick={() => handleCopy(activeHook.messages[winBackGenderView], activeHook.id + '-' + winBackGenderView)}
                        className="text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        نسخ فوري
                      </button>
                    </div>
                  </div>

                  {/* Client Responses Handling Matrix */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>مصفوفة الردود: إذا رد العميل بكذا... كيف تتصرف؟</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {activeHook.clientResponsesAndHandling.length} ردود محتملة
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {activeHook.clientResponsesAndHandling.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs"
                        >
                          <div className="flex items-start gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black text-[10px] shrink-0 mt-0.5">
                              إذا قال العميل
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              "{item.ifClientSays}"
                            </span>
                          </div>

                          <div className="flex items-start gap-2 pr-2 border-r-2 border-emerald-500">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] shrink-0 mt-0.5">
                              ردك المقترح
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {item.suggestedReply}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                            <span className="font-bold text-amber-600 dark:text-amber-400">التكتيك والسر:</span>
                            <span>{item.tacticNote}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Golden Don't Banner */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
                    <span className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      القاعدة الذهبية (ما لا يجب فعله مطلقاً 🚫):
                    </span>
                    <p className="text-[11px] text-rose-900/90 dark:text-rose-200/90 leading-relaxed">
                      {activeHook.goldenRule}
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Quick Tactical Principles for Account Managers */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-extrabold text-white">
                أسرار النجاح في التواصل مع العملاء القدامى في السوق السعودي
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <span className="font-extrabold text-amber-300 block">1. لا تظهر بمظهر المحتاج (Never Look Desperate)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  التواصل يجب أن يكون دائماً من موقع القوة والشريك الواثق، وكأنك تقدم فرصة تسويقية أو تطمئن بدافع الوفاء، وليس لأن الوكالة بحاجة لعقد جديد.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <span className="font-extrabold text-emerald-300 block">2. قاعدة "الفنجال والقهوة" (Coffee Sells More Than Zoom)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  في ثقافة الأعمال السعودية، الدعوة لقهوة عفوية أو المرور للسلام في مكتب العميل تكسر الحواجز وتفتح عقوداً أضعاف ما تفتحه اجتماعات زوم الرسمية.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <span className="font-extrabold text-teal-300 block">3. لا تحرق الجسور إذا لم يستجب العميل فوراً</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  إذا قرأ الرسالة ولم يرد، انتظر أسبوعاً ثم أرسل تلميحة سريعة خفيفة (Gentle Nudge) بدون لوم. العملاء السعوديون يتنقلون كثيراً ويعودون دائماً لمن يترك انطباعاً راقياً.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: ADD CUSTOM WORD */}
      {/* ========================================================= */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-md space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              إضافة مصطلح أو كلمة جديدة إلى القاموس
            </h3>
            <p className="text-xs text-slate-500">
              قم بحفظ أي كلمة أو عبارة جديدة سمعتها من عملائك لإضافتها لقاموسك والرجوع إليها دائماً.
            </p>
          </div>

          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المصطلح أو الكلمة *
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => {
                    setNewWord(e.target.value);
                    if (e.target.value) setNewLetter(e.target.value.charAt(0));
                  }}
                  placeholder="مثال: ازهلها، على هالخشم، لاهنت..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الحرف الأبجدي *
                </label>
                <select
                  value={newLetter}
                  onChange={(e) => setNewLetter(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  {alphabet.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  التصنيف السياقي *
                </label>
                <select
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="courtesy">لباقة وتأكيد استجابة</option>
                  <option value="appreciation">شكر وتقدير</option>
                  <option value="apology">اعتذار ورضا عميل</option>
                  <option value="marketing">إيجنسي وماركتنج</option>
                  <option value="agreement">طمأنة ومسؤولية</option>
                  <option value="greeting">ترحيب وتشريف</option>
                  <option value="urgency">استعجال ودي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المنطقة أو اللهجة
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="general">عام وشائع بالمملكة</option>
                  <option value="najdi">نجدي (الرياض والقصيم)</option>
                  <option value="hijazi">حجازي (جدة ومكة)</option>
                  <option value="sharqawi">شرقاوي (الدمام والخبر)</option>
                  <option value="janoubi">جنوبي (أبها وعسير)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                المعنى والشرح الدقيق *
              </label>
              <textarea
                required
                rows={2}
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="اشرح ماذا تعني الكلمة ومتى تقال بالضبط..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المعادل بالمصري 🇪🇬 (اختياري)
                </label>
                <input
                  type="text"
                  value={newEgyptian}
                  onChange={(e) => setNewEgyptian(e.target.value)}
                  placeholder="مثال: حاضر من عيوني..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المعادل بالشامي 🇸🇾🇱🇧 (اختياري)
                </label>
                <input
                  type="text"
                  value={newLevantine}
                  onChange={(e) => setNewLevantine(e.target.value)}
                  placeholder="مثال: تكرم عينك..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نموذج رسالة شات واتساب واقعية
              </label>
              <input
                type="text"
                value={newChatExample}
                onChange={(e) => setNewChatExample(e.target.value)}
                placeholder="مثال: يا هلا يا بو فهد.. ازهلها والحين الشباب يخلصونها لك."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نصيحة وتلميحة لمدير الحساب
              </label>
              <input
                type="text"
                value={newChatTip}
                onChange={(e) => setNewChatTip(e.target.value)}
                placeholder="مثال: استخدمها عند استلام أي طلب لبث الراحة في نفس العميل."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('words')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
              >
                حفظ المصطلح في القاموس
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
