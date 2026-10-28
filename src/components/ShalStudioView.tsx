import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Smartphone, 
  ShoppingBag, 
  Layout, 
  Video, 
  PlaySquare, 
  TrendingUp, 
  SearchCode, 
  Split, 
  MapPin, 
  Star, 
  Mail, 
  Palette, 
  BarChart2, 
  Globe2, 
  Share2, 
  PenTool, 
  Copy, 
  Check, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  AlertCircle, 
  Sliders, 
  ExternalLink,
  ChevronDown,
  Layers,
  HelpCircle,
  Clock,
  Sparkle,
  Zap,
  Building,
  Target
} from 'lucide-react';
import { 
  ShalService, 
  Client, 
  AppSettings, 
  MessageTone, 
  SaudiDialectSubtype, 
  ClientReengagementType 
} from '../types';
import { SHAL_SERVICES, SAUDI_OBJECTION_HANDLERS } from '../utils/shalAgencyData';
import { playAlertChime, safeOpenUrl } from '../utils/storage';
import { SmartMessageComposerModal } from './SmartMessageComposerModal';

interface ShalStudioViewProps {
  clients: Client[];
  settings: AppSettings;
  onOpenWinBackModal?: (client?: Client) => void;
}

export const ShalStudioView: React.FC<ShalStudioViewProps> = ({
  clients,
  settings,
}) => {
  // Active Service Selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>('mobile_app');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Message Builder State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customClientName, setCustomClientName] = useState<string>('أبو فهد');
  const [customCompanyName, setCustomCompanyName] = useState<string>('متجر الرواد');
  const [reengagementType, setReengagementType] = useState<ClientReengagementType>('past_client');
  const [tone, setTone] = useState<MessageTone>('indirect_consultative');
  const [dialect, setDialect] = useState<SaudiDialectSubtype>('general_saudi');
  const [includeFreeBonus, setIncludeFreeBonus] = useState<boolean>(true);
  const [bonusText, setBonusText] = useState<string>('فحص تقني شامل مجاني ومراجعة سرعة الشيك آوت');
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>('');

  // Dual Version Mode (Standard vs Short)
  const [versionMode, setVersionMode] = useState<'standard' | 'short'>('standard');
  const [isComposerModalOpen, setIsComposerModalOpen] = useState<boolean>(false);

  // Live Output Editing
  const [editedOutput, setEditedOutput] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Selected Service
  const currentService = useMemo(() => {
    return SHAL_SERVICES.find(s => s.id === selectedServiceId) || SHAL_SERVICES[0];
  }, [selectedServiceId]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return SHAL_SERVICES.filter(service => {
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesSearch = 
        service.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  // When Client Selection changes, autofill
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCustomClientName(client.name);
      setCustomCompanyName(client.companyName || 'مشروعكم');
      const phone = client.primaryContact?.phone;
      if (phone) setClientPhoneNumber(phone.replace(/[^0-9+]/g, ''));
    }
  };

  // Generate Message Content automatically
  const generatedMessage = useMemo(() => {
    const clientName = customClientName.trim() || 'أبو فلان';
    const company = customCompanyName.trim() || 'مشروعكم الكريم';
    const sName = currentService.nameAr.split('(')[0].trim();

    // Dialect Greetings & Vocab
    let greeting = 'سلام عليكم ورحمة الله';
    let endPhrase = 'وتسلم وتبقى يا غالي';
    let honorWord = 'طال عمرك';

    if (dialect === 'najdi') {
      greeting = 'يا هلا ومرحب ومساك الله بالخير';
      endPhrase = 'وازهل الموضوع وبإذن الله ما يصير خاطرك إلا طيب';
      honorWord = 'يا بعدي';
    } else if (dialect === 'hijazi') {
      greeting = 'أهلاً وسهلاً ويسعد مساك يا سيدي';
      endPhrase = 'وتكرم عينك ونشوفك بألف خير';
      honorWord = 'يا غالي';
    } else if (dialect === 'sharqawi') {
      greeting = 'يا هلا والله وغلا مساك الله بالنور';
      endPhrase = 'وحياكم الله بأي وقت والميدان يثبت';
      honorWord = 'عزيزنا';
    }

    // Core Intent Narrative
    let coreBody = '';
    if (reengagementType === 'past_client') {
      if (tone === 'warm_friendly') {
        coreBody = `${greeting} ${clientName}، عساك بألف صحة وخير يا رب. كنا نسولف اليوم بفريق وكالة شال وتذكرنا التعاون الراقي معكم في ${company} وكم كانت نتائجنا سوا متميزة ولها معزة خاصة عندنا. طريت على بالنا وحبينا نطمن على أحوال تجارتكم، والوكالة الحين طورت خدمة ${sName} بمعايير جديدة ودنا نمرها عليكم كهدية تقدير.`;
      } else if (tone === 'smart_data') {
        coreBody = `${greeting} ${clientName}. شيكنا على أرقام السوق السعودي لقطاع ${company} هالشهر ولقينا إن المنافسين يواجهون هدر عالي بالإعلانات بينما خدمة ${sName} من شال حققت لعملائنا في نفس المجال نمو مبيعات يتجاوز 3.8X وتخفيض 25% في تكلفة الاستحواذ. ودنا نكرر هالنجاح معكم ونبدأ بكامبين تجريبي يثبت الأرقام.`;
      } else if (tone === 'indirect_consultative') {
        coreBody = `${greeting} ${clientName}، عساك بالقوة. مرينا بالصدفة على متجر ومنصات ${company} ولاحظنا فرصة نمو ممتازة في ${sName} ممكن تفوت عليكم مبيعات مؤكدة بالسوق السعودي إذا ما تم معالجتها قبل الموسم. جهزنا لكم تدقيق ومراجعة سريعة بدون أي مقابل مالي، تحب نرسله لك تشوفه؟`;
      } else if (tone === 'vip_promotional') {
        coreBody = `${greeting} ${clientName}. بما أنكم من العملاء المميزين السابقين لوكالة شال، خصصنا لـ ${company} دعوة حصرية لتجربة خدمة ${sName} بخصم 40% وبدون أي ارتباط تعاقدي طويل، مع ضمان تشغيلي مباشر من كبار خبرائنا بالسوق السعودي. المقاعد محدودة لـ 3 شركاء فقط هالشهر.`;
      } else {
        coreBody = `${greeting} ${clientName}. حبيت بس أذكرك إن مواسم الشراء القادمة بالسعودية تقترب بسرعة، وحجز خدمة ${sName} لـ ${company} الآن بيحميكم من زحمة ارتفاع أسعار الإعلانات ويثبت أرباحكم.`;
      }
    } else if (reengagementType === 'contract_expiring') {
      if (tone === 'smart_data') {
        coreBody = `${greeting} ${clientName} ${honorWord}. مع اقتراب موعد تجديد العقد لـ ${company} بنهاية هذا الشهر، فخورين جداً بتحقيق أهداف المرحلة السابقة. جهزنا لكم تقرير العائد على الاستثمار مع خطة الـ 90 يوماً القادمة في ${sName} لتوسيع المبيعات وحماية صدارتكم بالسوق.`;
      } else {
        coreBody = `${greeting} ${clientName}. الشراكة معكم في ${company} قصة نجاح نعتز بها في وكالة شال. وحرصاً على استمرار الزخم بدون أي انقطاع بخوارزميات المنصات، جهزنا عرض تجديد العقد الحالي مع تثبيت نفس التسعير القديم دون أي زيادة، ومع باقة دعم إضافية.`;
      }
    } else if (reengagementType === 'package_upgrade') {
      coreBody = `${greeting} ${clientName}. بعد ما استقرت نتائجنا الأساسية في ${company}، الخطوة المنطقية القادمة لمضاعفة الأرباح هي ترقية الباقة لدمج خدمة ${sName}. هالتطوير بيقفل حلقة المبيعات المفقودة ويوفر عليكم ساعات عمل يومية ويضاعف معدل العودة للشراء.`;
    } else {
      coreBody = `${greeting} ${clientName}. نتشرف في وكالة شال (Shal Agency) بتقديم حلول متخصصة لـ ${company} من خلال خدمة ${sName}: "${currentService.tagline}". حلول مصممة خصيصاً لسلوك المستهلك والقوة الشرائية في المملكة.`;
    }

    // Bonus Addition
    let bonusSnippet = '';
    if (includeFreeBonus && bonusText) {
      bonusSnippet = `\n\n🎁 وكبونص خاص وتقديراً لشراكتنا: بنقدم لكم (${bonusText}) مجاناً بالكامل.`;
    }

    // Call to Action
    const cta = `\n\nوش رأيك ${honorWord}؟ متى يناسبك ندردش دقيقتين بالواتساب أو مكالمة سريعة نوضح لك التفاصيل؟\n${endPhrase}.\n\nأخوك من فريق وكالة شال (Shal Agency)`;

    return `${coreBody}${bonusSnippet}${cta}`;
  }, [
    customClientName, 
    customCompanyName, 
    currentService, 
    reengagementType, 
    tone, 
    dialect, 
    includeFreeBonus, 
    bonusText
  ]);

  // Generated Concise / Short version
  const generatedShortMessage = useMemo(() => {
    const clientName = customClientName.trim() || 'أبو فهد';
    const company = customCompanyName.trim() || 'مشروعكم';
    const sName = currentService.nameAr.split('(')[0].trim();
    return `يا هلا يا ${clientName}، مساك الله بالخير 🚀 طورنا في وكالة شال حل نوعي لـ ${sName} يرفع مبيعات ${company} بالسوق السعودي.${includeFreeBonus && bonusText ? ` ومعها (${bonusText}) مجاناً كهدية.` : ''} ودنا بدردشة سريعة دقيقتين نوضح لك الأرقام؟ تسلم يا بعدي.`;
  }, [customClientName, customCompanyName, currentService, includeFreeBonus, bonusText]);

  // Sync to edited output when generated changes or version switches
  React.useEffect(() => {
    setEditedOutput(versionMode === 'short' ? generatedShortMessage : generatedMessage);
  }, [generatedMessage, generatedShortMessage, versionMode]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    if (settings.soundEnabled) playAlertChime('success');
    setTimeout(() => setCopiedSuccess(false), 2200);
  };

  const handleCopyObjection = (objId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(objId);
    if (settings.soundEnabled) playAlertChime('click');
    setTimeout(() => setCopiedObjId(null), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(editedOutput);
    const cleanPhone = clientPhoneNumber.replace(/[^0-9]/g, '');
    let url = `https://wa.me/?text=${encoded}`;
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }
    safeOpenUrl(url);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`فرصة تطوير استراتيجية لـ ${customCompanyName || 'مشروعكم'} | وكالة شال`);
    const body = encodeURIComponent(editedOutput);
    safeOpenUrl(`mailto:?subject=${subject}&body=${body}`);
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'mobile_app': return Smartphone;
      case 'online_store': return ShoppingBag;
      case 'landing_pages': return Layout;
      case 'media_production': return Video;
      case 'motion_graphics': return PlaySquare;
      case 'media_buying': return TrendingUp;
      case 'seo': return SearchCode;
      case 'ab_testing': return Split;
      case 'google_my_business': return MapPin;
      case 'influencers': return Star;
      case 'email_marketing': return Mail;
      case 'ui_ux_design': return Palette;
      case 'analytics': return BarChart2;
      case 'sem': return Globe2;
      case 'social_media': return Share2;
      case 'content_marketing': return PenTool;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>استوديو وكالة شال الرسمي • السوق السعودي 🇸🇦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              صانع الرسائل الذكية وخدمات وكالة شال (Shal Agency)
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              اختر أي خدمة من خدمات شال الـ 16 واصنع في ثوانٍ رسائل استرجاع ذكية، دخلات غير مباشرة، وعروض تجديد عقود مدروسة بلهجات سعودية أصيلة لا يمكن تجاهلها.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsComposerModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>فتح صانع الرسائل الذكي الشامل (بنسختين عادية وقصيرة) ⚡️</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-28">
              <span className="block text-2xl font-black text-amber-400">16</span>
              <span className="text-[11px] text-slate-300 font-medium">خدمة سعودية</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-28">
              <span className="block text-2xl font-black text-emerald-400">4</span>
              <span className="text-[11px] text-slate-300 font-medium">نبرات تواصل</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-28">
              <span className="block text-2xl font-black text-blue-400">100%</span>
              <span className="text-[11px] text-slate-300 font-medium">لهجة مدققة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Service Selector & Catalog | Right Live Message Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 16 Services Selector (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                خدمات وكالة شال (16 خدمة)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              اضغط على أي خدمة للتجهيز
            </span>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة (SEO، تطبيقات، موشن، سناب...)"
                className="w-full text-xs sm:text-sm pr-9 pl-3 py-2.5 rounded-2xl border bg-white dark:bg-slate-900 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'الكل (16)' },
                { id: 'mobile_web', label: 'تطبيقات ومتاجر' },
                { id: 'media_creative', label: 'صناعة وإنتاج' },
                { id: 'marketing_growth', label: 'إعلانات ونمو' },
                { id: 'strategy_optimization', label: 'تحليل واستراتيجية' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services List Scroll */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredServices.map(service => {
              const isSelected = selectedServiceId === service.id;
              const Icon = getServiceIcon(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    if (settings.soundEnabled) playAlertChime('click');
                  }}
                  className={`
                    p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-start group
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105
                      ${isSelected 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                          {service.nameAr}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {service.nameEn.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {service.tagline}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                          {service.categoryLabelAr}
                        </span>
                        <span className={`font-bold flex items-center gap-0.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          <span>تفعيل بالقالب</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Service Deep Dive Card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 eye-care:bg-[#ede5d8] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                كيف تفيد خدمة ({currentService.nameAr.split('(')[0]}) التاجر السعودي؟
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {currentService.saudiBusinessBenefit}
            </p>
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500">مخرجات العمل القياسية:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentService.typicalDeliverables.map((del, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                    ✓ {del}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Smart Message Generator (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Studio Controls Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    محددات صانع الرسائل المخصص
                  </h3>
                  <p className="text-xs text-slate-500">
                    الخدمة الحالية: <span className="font-semibold text-blue-600 dark:text-blue-400">{currentService.nameAr}</span>
                  </p>
                </div>
              </div>

              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 font-bold">
                توليد فوري ⚡
              </span>
            </div>

            {/* Client Context Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اختر من قائمة العملاء المسجلين (اختياري)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="">-- إدخال يدوي حر --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.companyName || 'بدون شركة'} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الواتساب للإرسال المباشر
                </label>
                <input
                  type="text"
                  value={clientPhoneNumber}
                  onChange={(e) => setClientPhoneNumber(e.target.value)}
                  placeholder="مثال: 966501234567"
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Custom Variables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو كنية العميل (النداء السعودي)
                </label>
                <input
                  type="text"
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  placeholder="مثال: أبو فهد / أستاذة ريم"
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المتجر أو الشركة المستهدفة
                </label>
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="مثال: متجر أصايل / شركة البنيان"
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Intent / Reengagement Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                هدف الرسالة والمسار (Reengagement Intent)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'past_client', label: 'استرجاع عميل قديم 🔄', desc: 'إعادة فتح باب التعاون' },
                  { id: 'contract_expiring', label: 'تجديد عقد حالي ⏳', desc: 'قبل انتهاء المدة' },
                  { id: 'package_upgrade', label: 'ترقية باقة 🚀', desc: 'زيادة الخدمات والعقد' },
                  { id: 'new_collaboration', label: 'عرض فرصة جديدة 🤝', desc: 'باقة مشتركة حصرية' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setReengagementType(item.id as ClientReengagementType)}
                    className={`p-2.5 rounded-xl border text-start transition-all ${
                      reengagementType === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${reengagementType === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone & Dialect Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نبرة الخطاب (Tone of Voice)
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as MessageTone)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                >
                  <option value="indirect_consultative">🔍 استشاري وغير مباشر وفحص مجاني (الأعلى قبولاً)</option>
                  <option value="warm_friendly">💖 أخوي وودي واطمئنان على التجارة (عاطفي)</option>
                  <option value="smart_data">📊 أرقام وعائد استثماري ونمو مبيعات (عقلاني)</option>
                  <option value="vip_promotional">💎 باقة VIP حصرية ومقاعد محدودة (ترويجي ناعم)</option>
                  <option value="urgent_gentle">⏳ حجز مبكر وتثبيت أسعار قبل الموسم (تنبيه لطيف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نكهة اللهجة السعودية (Regional Dialect)
                </label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value as SaudiDialectSubtype)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                >
                  <option value="general_saudi">🇸🇦 لهجة بيضاء سعودية مهنية (الرياض وكافة المدن)</option>
                  <option value="najdi">🇸🇦 نكهة نجدية (يا بعدي، ازهلها، ما يصير خاطرك إلا طيب)</option>
                  <option value="hijazi">🇸🇦 نكهة حجازية (يا سيدي، تكرم عينك، يسعد مساك)</option>
                  <option value="sharqawi">🇸🇦 نكهة شرقية (يا هلا وغلا، عزيزنا، حياكم)</option>
                </select>
              </div>
            </div>

            {/* Bonus Hook Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeFreeBonus}
                  onChange={(e) => setIncludeFreeBonus(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>تضمين بونص مجاني أو قيمة مضافة مغرية (Value Add)</span>
              </label>
              {includeFreeBonus && (
                <input
                  type="text"
                  value={bonusText}
                  onChange={(e) => setBonusText(e.target.value)}
                  placeholder="مثال: تدقيق سرعة المتجر مجاناً"
                  className="w-full sm:w-64 text-xs p-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* LIVE OUTPUT & ACTION DOCK */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  معاينة الرسالة الجاهزة (قابلة للتعديل الحي)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Version switcher toggle pills */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setVersionMode('standard')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      versionMode === 'standard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    📄 نسخة عادية
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersionMode('short')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      versionMode === 'short'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    ⚡️ نسخة مختصرة
                  </button>
                </div>

                <button
                  onClick={() => setEditedOutput(versionMode === 'short' ? generatedShortMessage : generatedMessage)}
                  title="استعادة النص المقترح الأصلي"
                  className="p-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تعيين</span>
                </button>
              </div>
            </div>

            {/* Editable Output Textarea */}
            <div className="relative">
              <textarea
                value={editedOutput}
                onChange={(e) => setEditedOutput(e.target.value)}
                rows={9}
                className="w-full text-xs sm:text-sm p-4 rounded-2xl border bg-slate-50/70 dark:bg-slate-800/70 eye-care:bg-[#ede5d8] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-emerald-500 transition-colors"
                placeholder="سيظهر نص الرسالة المولد هنا..."
              />
              <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {editedOutput.length} حرف
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5 pt-2">
              <button
                onClick={() => handleCopyText(editedOutput)}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  copiedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white shadow-slate-900/20'
                }`}
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>تم النسخ بنجاح للحافظة!</span>
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
                className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>إرسال واتساب مباشر</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>إيميل</span>
              </button>
            </div>
          </div>

          {/* SAUDI OBJECTION CHEAT SHEET */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  دليل التعامل مع اعتراضات التاجر السعودي (Objection Handling)
                </h4>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                ردود جاهزة ومجربة 🎯
              </span>
            </div>

            <div className="space-y-3">
              {SAUDI_OBJECTION_HANDLERS.map(obj => (
                <div 
                  key={obj.id}
                  className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 eye-care:bg-[#ede5d8] border border-amber-200/60 dark:border-amber-900/40 space-y-2 text-start"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {obj.category}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                        اعتراض العميل: "{obj.objectionText}"
                      </h5>
                    </div>
                    <button
                      onClick={() => handleCopyObjection(obj.id, obj.bestReplySaudi)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                    >
                      {copiedObjId === obj.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedObjId === obj.id ? 'تم النسخ' : 'نسخ الرد'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/40">
                    💡 <strong className="text-amber-800 dark:text-amber-300">الرد السعودي المقترح:</strong> {obj.bestReplySaudi}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Smart Dual Message Composer Modal */}
      <SmartMessageComposerModal
        isOpen={isComposerModalOpen}
        onClose={() => setIsComposerModalOpen(false)}
        clients={clients}
        settings={settings}
        initialClient={clients.find(c => c.id === selectedClientId) || null}
      />

    </div>
  );
};
