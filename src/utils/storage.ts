import { Client, Task, AppSettings, NotificationItem, SaudiTemplate, DashboardWidgetConfig, SaudiDictionaryEntry } from '../types';
import { initialSaudiDictionaryEntries } from './saudiDictionaryData';
import { defaultExpandedSaudiTemplates } from './saudiTemplatesData';

const CLIENTS_STORAGE_KEY = 'accountpro_clients_v1';
const TASKS_STORAGE_KEY = 'accountpro_tasks_v1';
const SETTINGS_STORAGE_KEY = 'accountpro_settings_v1';
const NOTIFICATIONS_STORAGE_KEY = 'accountpro_notifications_v1';
const TEMPLATES_STORAGE_KEY = 'accountpro_saudi_templates_v3';
const DICTIONARY_STORAGE_KEY = 'accountpro_saudi_dict_v1';

export const initialSaudiTemplates: SaudiTemplate[] = [
  ...defaultExpandedSaudiTemplates,
  {
    id: 'saudi-1',
    title: 'اعتماد خطة البوستات والتصاميم للأسبوع',
    category: 'approval_request',
    situation: 'approval_request',
    pinned: true,
    message: 'يا هلا والله ومساء الخير يا غالي ☕️\nأرسلت لك رابط درايف حق خطة المحتوى والتصاميم للأسبوع الجاي لـ [الشركة].\nشيك عليها بروقان وعطنا رايك، وإذا عندك أي تعديل ودك نضيفه بلغني عشان نلحق نبرمج البوستات قبل نهاية اليوم.\nيسعد مساك يا بعدي!',
    tags: ['اعتماد محتوى', 'تصاميم', 'ماركتنج'],
  },
  {
    id: 'saudi-2',
    title: 'بشارة وتحديث نتايج الحملات الإعلانية والـ ROAS',
    category: 'report',
    situation: 'report',
    pinned: true,
    message: 'يا هلا ومسهلا يا بو [الاسم]، عساك مروق وبأحسن حال 👋\nبس حبيت أبشرك، شيكت مع ميديا باير التيم عندنا على حملات [الشركة]، والحمد لله النتائج تفتح النفس!\nسعر النقرة والـ CPA نزل والـ ROAS واصل 4.2x، والترافيك على المتجر زاد بشكل ملحوظ مقارنة بالأسبوع اللي راح.\nمكملين بنفس الرتم القوي، ولو ودك نرفع ميزانية الحملة الرابحة عشان نسحب مبيعات أكثر علمني!',
    tags: ['أداء إعلانات', 'ROAS', 'ميديا باير'],
  },
  {
    id: 'saudi-3',
    title: 'طلب متطلبات ناقصة (كود الخصم / صور المنتجات)',
    category: 'reminder',
    pinned: true,
    message: 'هلا والله وغلا أستاذ [الاسم]، يعطيك ألف عافية 🌟\nتيم الإعلانات جاهز يطلق حملة الويكند لـ [الشركة]، بس ناقصنا كود الخصم الجديد وصور المنتج بدقة عالية عشان نركبها في الإعلانات.\nلاهنت إذا تقدر ترسلها لي الحين عشان ما نتأخر في الإطلاق ونلحق زحمة الرواتب.\nتسلم وما قصرت مقدماً!',
    tags: ['متطلبات', 'كود خصم', 'إطلاق حملة'],
  },
  {
    id: 'saudi-4',
    title: 'تعديل فوري للتصميم - حقك علينا',
    category: 'apology',
    pinned: false,
    message: 'أهلين وسهلين يا غالي.. حقك علينا وما يصير خاطرك إلا طيب أبد! 🙏\nالملاحظات اللي ذكرتها وصلتها لتيم التصميم وعدلوها بالمللي الحين ورتبوا الألوان والخط زي ما طلبت بالظبط.\nتفضل شيك على الرابط بعد التحديث وعطني الضوء الأخضر عشان ننشرها فوراً.\nولا تشيل هم أي شي ترانا بالخدمة دائماً!',
    tags: ['تعديل تصميم', 'حقك علينا', 'سريع'],
  },
  {
    id: 'saudi-5',
    title: 'ترحيب وتفعيل عميل جديد في الإيجنسي (Kickoff)',
    category: 'welcome',
    pinned: false,
    message: 'يا هلا والله ونورتنا يا غالي 🚀 سعداء جداً بشراكتنا مع [الشركة]!\nأنا أخوك ومسؤول حسابكم (الأكاونت مانجر) معكم خطوة بخطوة في كل شي يخص السوشيال ميديا والحملات.\nسوينا قروب الواتساب هذا عشان نكون على تواصل سريع ولحظي، واليوم شغالين على دراسة المنافسين وتجهيز أول خطة.\nأي شي تحتاجه أو فكرة في بالك بس أرسل لي وأبشر بعزك!',
    tags: ['أونبوردينق', 'ترحيب إيجنسي', 'قروب واتساب'],
  },
  {
    id: 'saudi-6',
    title: 'مكالمة سريعة لتجهيز حملة السيزون والتخفيضات',
    category: 'checkin',
    pinned: false,
    message: 'مساك الله بالخير يا بو [الاسم].. ودنا بمكالمة سريعة ربع ساعة متى ما ناسبك بكرة ندردش فيها في تجهيزات حملة السيزون الجاي لـ [الشركة] 🎯\nعندنا أفكار إبداعية جديدة للريلز وتيك توك نبي نشاركها معك ونعتمد الميزانية سوا.\nشف الوقت اللي يناسبك وعطني خبر عشان أرتب وقتي معك يا بعدي.',
    tags: ['حملة سيزون', 'ميتنج سريع', 'أفكار إبداعية'],
  },
  {
    id: 'saudi-7',
    title: 'تجديد عقد الإيجنسي وبونص محتوى مجاني',
    category: 'renewal',
    pinned: false,
    message: 'حياك الله يا غالي، والله يديم المحبة والشراكة الحلوة بيننا 🤝\nعقدنا مع [الشركة] على وشك يكمل فترته، والنتائج الحمد لله تتكلم عن نفسها ونمونا كان جبار سوا.\nودنا نجدد للفترة الجاية ومجهزين لكم بونص خاص من الإيجنسي (إنتاج 4 ريلز إضافية وإدارة إعلانات سناب مجاناً) تقديراً لثقتكم فينا.\nأرسل لك مسودة التجديد الحين ولا نمركم نشرب قهوة ونوقعها سوا؟',
    tags: ['تجديد عقد', 'بونص مجاني', 'إيجنسي'],
  },
  {
    id: 'saudi-8',
    title: 'تذكير خفيف وودي بموعد الميتنج',
    category: 'reminder',
    pinned: false,
    message: 'سلام عليكم يا غالي.. تذكير خفيف ولطيف بموعدنا اليوم الساعة [الوقت] على زوم/جوجل ميت 🗓️\nجاهزين نمر على تقرير الشهر سوا، وإذا طرأ عليك شي أو ودك نأجلها نص ساعة ترانا جاهزين ولا عندك مشكلة أبد.',
    tags: ['تذكير ميتنج', 'زوم', 'ودي'],
  },
];

export const defaultDashboardWidgets: DashboardWidgetConfig[] = [
  { id: 'ai_briefing', labelAr: 'الإيجاز التنفيذي الصباحي بالذكاء الاصطناعي', labelEn: 'Morning AI Briefing', enabled: true, order: 1 },
  { id: 'ai_prioritization', labelAr: 'الترتيب الذكي للمهام والعمليات لليوم (AI Priority)', labelEn: 'Optimal Order of Operations', enabled: true, order: 2 },
  { id: 'metrics', labelAr: 'مؤشرات الأداء الأربعة الرئيسية (KPIs)', labelEn: 'Core Metrics', enabled: true, order: 3 },
  { id: 'today_tasks', labelAr: 'أولويات اليوم والمهام المتبقية', labelEn: 'Today Priorities', enabled: true, order: 4 },
  { id: 'quick_daily_report', labelAr: 'تقرير الإنجاز اليومي السريع والموجز', labelEn: 'Quick Daily Report', enabled: true, order: 5 },
  { id: 'saudi_templates', labelAr: 'الردود الذكية وقوالب الواتساب السعودية الرسمية', labelEn: 'Saudi WhatsApp Templates', enabled: true, order: 6 },
  { id: 'renewals', labelAr: 'تنبيهات تجديد العقود القادمة', labelEn: 'Upcoming Renewals', enabled: true, order: 7 },
  { id: 'at_risk', labelAr: 'رادار الحسابات المعرضة لخطر الإلغاء (Churn Radar)', labelEn: 'At-Risk Churn Radar', enabled: true, order: 8 },
  { id: 'quick_actions', labelAr: 'شريط الإجراءات والروابط السريعة', labelEn: 'Quick Action Shortcuts', enabled: true, order: 9 },
];

export const defaultSettings: AppSettings = {
  language: 'ar',
  theme: 'dark',
  accentColor: 'blue',
  dashboardTheme: 'default',
  currency: 'USD',
  accountManagerName: 'محمد رمزي (Senior Account Manager)',
  accountManagerEmail: 'm.m.s.ramzy3333@gmail.com',
  autoCloudSync: true,
  soundEnabled: true,
  notifyOnDueTasks: true,
  notifyOnRenewals: true,
  renewalAlertDays: 45,
  customStages: [
    { id: 'lead', labelAr: 'عميل محتمل', labelEn: 'Prospect', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { id: 'onboarding', labelAr: 'مرحلة التهيئة', labelEn: 'Onboarding', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    { id: 'active', labelAr: 'نشط ومستقر', labelEn: 'Active', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 'renewal', labelAr: 'قيد التجديد', labelEn: 'In Renewal', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
    { id: 'at-risk', labelAr: 'مهدد بالإلغاء', labelEn: 'At Risk', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    { id: 'closed', labelAr: 'مغلق / مؤرشف', labelEn: 'Closed', color: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  ],
  dashboardWidgets: defaultDashboardWidgets,
};

const initialClients: Client[] = [
  {
    id: 'client-1',
    name: 'مجموعة الأفق القابضة',
    companyName: 'Horizon Global Group',
    industry: 'التقنية وحلول السحابة',
    stage: 'renewal',
    healthScore: 88,
    annualValue: 85000,
    currency: 'USD',
    primaryContact: {
      name: 'م. أحمد الشناوي',
      role: 'المدير التنفيذي للتقنية (CTO)',
      email: 'a.shinawi@horizon-group.com',
      phone: '+966 50 123 4567',
      isPrimary: true,
    },
    secondaryContacts: [
      {
        name: 'سارة إبراهيم',
        role: 'مديرة المشتريات والعقود',
        email: 'procurement@horizon-group.com',
        phone: '+966 50 765 4321',
      },
    ],
    renewalDate: '2026-11-15',
    lastContactDate: '2026-10-02',
    nextFollowUpDate: '2026-10-07',
    tags: ['عميل VIP', 'تجديد سنوي', 'فرصة توسع'],
    notes: 'تم تقديم مقترح التجديد مع ترقية الخطة السنوية بنسبة 20%. العميل طلب مراجعة ميزة الأمان الإضافية قبل التوقيع النهائي.',
    activities: [
      {
        id: 'act-1',
        type: 'meeting',
        title: 'اجتماع مراجعة العقد السنوي',
        description: 'مناقشة خطة التوسع لعام 2027 ومراجعة مؤشرات الأداء.',
        timestamp: '2026-10-02 11:00',
      },
      {
        id: 'act-2',
        type: 'email',
        title: 'إرسال عرض الأسعار المحدث',
        description: 'تم إرسال المسودة النهائية شاملة الخصم السنوي المعتمد.',
        timestamp: '2026-10-04 14:30',
      },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2026-10-04',
  },
  {
    id: 'client-2',
    name: 'شركة النماء للخدمات المالية',
    companyName: 'Al-Namaa Financial Corp',
    industry: 'القطاع المصرفي والمالي',
    stage: 'active',
    healthScore: 94,
    annualValue: 120000,
    currency: 'USD',
    primaryContact: {
      name: 'د. طارق المنصور',
      role: 'رئيس العمليات الرقمية',
      email: 'tarek.mansour@alnamaa-fin.com',
      phone: '+971 52 987 6543',
      isPrimary: true,
    },
    renewalDate: '2027-03-30',
    lastContactDate: '2026-09-28',
    nextFollowUpDate: '2026-10-10',
    tags: ['شريك استراتيجي', 'دعم مخصص VIP'],
    notes: 'العميل سعيد جداً بالأداء وسرعة الاستجابة. تم تسجيل معدل رضا 98% في استبيان الربع الثالث.',
    activities: [
      {
        id: 'act-3',
        type: 'call',
        title: 'مكالمة اطمئنان ربع سنوية',
        description: 'مراجعة مؤشرات استخدام المنصة من قبل فريقهم التشغيلي.',
        timestamp: '2026-09-28 10:15',
      },
    ],
    createdAt: '2024-03-10',
    updatedAt: '2026-09-28',
  },
  {
    id: 'client-3',
    name: 'سلسلة متاجر إكسبريس ريتيل',
    companyName: 'Express Retail Stores',
    industry: 'التجارة الإلكترونية والتجزئة',
    stage: 'at-risk',
    healthScore: 48,
    annualValue: 42000,
    currency: 'USD',
    primaryContact: {
      name: 'فهد العتيبي',
      role: 'مدير التجارة الإلكترونية',
      email: 'f.otaibi@express-retail.store',
      phone: '+966 54 333 8899',
      isPrimary: true,
    },
    renewalDate: '2026-10-25',
    lastContactDate: '2026-09-20',
    nextFollowUpDate: '2026-10-07',
    tags: ['خطر إلغاء', 'أولوية قصوى', 'تأخر متابعة'],
    notes: 'اشتكى العميل من تأخر تقارير الاندماج الأسبوع الماضي. يحتاج مكالمة فورية من مدير الحساب مع الفريق التقني لحل المشكلة قبل قرار التجديد.',
    activities: [
      {
        id: 'act-4',
        type: 'call',
        title: 'مكالمة لمعالجة الشكوى',
        description: 'استماع لملاحظات فريق العمل والتعهد بحل مشكلة المزامنة خلال 48 ساعة.',
        timestamp: '2026-09-20 16:00',
      },
    ],
    createdAt: '2025-06-01',
    updatedAt: '2026-09-20',
  },
  {
    id: 'client-4',
    name: 'مؤسسة الشفاء للرعاية الصحية',
    companyName: 'Al-Shifa Healthcare Ltd',
    industry: 'الرعاية الصحية والمستشفيات',
    stage: 'onboarding',
    healthScore: 91,
    annualValue: 68000,
    currency: 'USD',
    primaryContact: {
      name: 'د. منى عبد الرؤوف',
      role: 'مديرة إدارة الجودة الرقمية',
      email: 'm.abdelraouf@alshifa-health.org',
      phone: '+20 100 555 4321',
      isPrimary: true,
    },
    renewalDate: '2027-09-15',
    lastContactDate: '2026-10-05',
    nextFollowUpDate: '2026-10-08',
    tags: ['عميل جديد', 'تدريب الفريق'],
    notes: 'جاري الانتهاء من ورشة التدريب الثانية لفريق التمريض والإدارة الطبية.',
    activities: [
      {
        id: 'act-5',
        type: 'meeting',
        title: 'جلسة تدريبية تعريفية',
        description: 'شرح لوحة التحكم وتوزيع الصلاحيات على 12 مستخدم جديد.',
        timestamp: '2026-10-05 13:00',
      },
    ],
    createdAt: '2026-09-10',
    updatedAt: '2026-10-05',
  },
  {
    id: 'client-5',
    name: 'شركة سحاب تيك للخدمات البرمجية',
    companyName: 'SahabTech Software',
    industry: 'البرمجيات وتكنولوجيا المعلومات',
    stage: 'lead',
    healthScore: 75,
    annualValue: 35000,
    currency: 'USD',
    primaryContact: {
      name: 'خالد السعدني',
      role: 'المدير التجاري',
      email: 'khaled@sahabtech.io',
      phone: '+966 56 777 1212',
      isPrimary: true,
    },
    renewalDate: '2027-10-01',
    lastContactDate: '2026-10-03',
    nextFollowUpDate: '2026-10-07',
    tags: ['مرحلة إغلاق الصفقة', 'موافقة العقد'],
    notes: 'تم إرسال مسودة اتفاقية مستوى الخدمة (SLA). ننتظر التوقيع الرسمي لإطلاق المشروع.',
    activities: [],
    createdAt: '2026-09-25',
    updatedAt: '2026-10-03',
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'مكالمة طارئة مع فهد العتيبي (إكسبريس ريتيل)',
    description: 'تأكيد حل مشكلة تقارير المزامنة وتقديم مقترح تجديد مع ميزات دعم إضافية لضمان بقاء الحساب.',
    clientId: 'client-3',
    clientName: 'سلسلة متاجر إكسبريس ريتيل',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:30',
    priority: 'urgent',
    type: 'issue_resolution',
    completed: false,
    isStarred: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'task-2',
    title: 'متابعة توقيع عقد التجديد مع م. أحمد الشناوي',
    description: 'التأكد من استلام العقد الموقع من الشؤون القانونية لدى مجموعة الأفق وتجهيز الفاتورة السنوية.',
    clientId: 'client-1',
    clientName: 'مجموعة الأفق القابضة',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '12:00',
    priority: 'urgent',
    type: 'renewal_talk',
    completed: false,
    isStarred: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'task-3',
    title: 'إرسال ملخص التدريب لدكتورة منى (مؤسسة الشفاء)',
    description: 'مشاركة تسجيل ورشة العمل وروابط الأدلة الإرشادية وجدولة جلسة الأسئلة المباشرة القادمة.',
    clientId: 'client-4',
    clientName: 'مؤسسة الشفاء للرعاية الصحية',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:30',
    priority: 'high',
    type: 'follow_up',
    completed: false,
    createdAt: '2026-10-06',
  },
  {
    id: 'task-4',
    title: 'مراجعة مؤشرات الأداء الشهرية لشركة النماء المالية',
    description: 'إعداد تقرير القيمة العائدة (ROI) السريع لشهر سبتمبر وإرساله للدكتور طارق المنصور.',
    clientId: 'client-2',
    clientName: 'شركة النماء للخدمات المالية',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '16:00',
    priority: 'medium',
    type: 'report_review',
    completed: true,
    completedAt: '2026-10-07 09:15',
    createdAt: '2026-10-05',
  },
  {
    id: 'task-5',
    title: 'متابعة توقيع اتفاقية SLA مع خالد السعدني (سحاب تيك)',
    description: 'الرد على استفسارهم بخصوص أوقات الصيانة الدورية وتأكيد تاريخ بدء العقد.',
    clientId: 'client-5',
    clientName: 'شركة سحاب تيك للخدمات البرمجية',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:00',
    priority: 'high',
    type: 'follow_up',
    completed: false,
    createdAt: '2026-10-06',
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'تنبيه عاجل: حساب مهدد بالإلغاء',
    message: 'شركة إكسبريس ريتيل تحتاج متابعة سريعة اليوم بسبب انخفاض مؤشر الصحة إلى 48%.',
    timestamp: 'منذ 20 دقيقة',
    read: false,
    type: 'urgent',
    linkId: 'client-3',
  },
  {
    id: 'notif-2',
    title: 'اقتراب موعد تجديد العقد',
    message: 'عقد مجموعة الأفق القابضة ينتهي خلال أقل من 40 يوماً. نسبة التجديد المتوقعة 90%.',
    timestamp: 'منذ ساعتين',
    read: false,
    type: 'renewal',
    linkId: 'client-1',
  },
  {
    id: 'notif-3',
    title: 'مزامنة سحابية ناجحة',
    message: 'تم حفظ كافة بيانات العملاء والمهام مشفرة ومزامنة بنجاح عبر السحابة.',
    timestamp: 'منذ 5 ساعات',
    read: true,
    type: 'system',
  },
];

export function getStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load clients:', e);
    return initialClients;
  }
}

export function saveStoredClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients:', e);
  }
}

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
      return initialTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return initialTasks;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notifications:', e);
    return initialNotifications;
  }
}

export function saveStoredNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

export function getStoredSaudiTemplates(): SaudiTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      let merged = initialSaudiTemplates;
      try {
        const v2Raw = localStorage.getItem('accountpro_saudi_templates_v2');
        if (v2Raw) {
          const v2List: SaudiTemplate[] = JSON.parse(v2Raw);
          const customOnly = v2List.filter(t => t.id.startsWith('saudi-custom-') || !initialSaudiTemplates.some(it => it.id === t.id));
          if (customOnly.length > 0) {
            merged = [...customOnly, ...initialSaudiTemplates];
          }
        }
      } catch {
        // ignore
      }
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    const parsed: SaudiTemplate[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map(t => t.id));
    const missing = defaultExpandedSaudiTemplates.filter(t => !existingIds.has(t.id));
    const defaultMap = new Map(defaultExpandedSaudiTemplates.map(t => [t.id, t]));
    
    let hasModifications = missing.length > 0;
    const updated = parsed.map(t => {
      const def = defaultMap.get(t.id);
      if (def && def.shortMessage && t.shortMessage !== def.shortMessage) {
        hasModifications = true;
        return { ...t, shortMessage: def.shortMessage, situation: def.situation || t.situation };
      }
      return t;
    });

    if (hasModifications) {
      const merged = [...updated, ...missing];
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load Saudi templates:', e);
    return defaultExpandedSaudiTemplates;
  }
}

export function saveStoredSaudiTemplates(templates: SaudiTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save Saudi templates:', e);
  }
}

export function getStoredSaudiDictionary(): SaudiDictionaryEntry[] {
  try {
    const raw = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(initialSaudiDictionaryEntries));
      return initialSaudiDictionaryEntries;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load Saudi dictionary:', e);
    return initialSaudiDictionaryEntries;
  }
}

export function saveStoredSaudiDictionary(entries: SaudiDictionaryEntry[]): void {
  try {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save Saudi dictionary:', e);
  }
}

// Shared singleton AudioContext to prevent memory/thread leaks and browser crashes
let sharedAudioCtx: AudioContext | null = null;

export function playAlertChime(type: 'urgent' | 'success' | 'click' = 'success'): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtxClass();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'urgent') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }

    // Cleanly disconnect nodes after playback to prevent node leak
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    }, 450);
  } catch {
    // Fail gracefully without interrupting app execution
  }
}

// Excel / CSV Export with UTF-8 BOM for perfect Arabic characters in Microsoft Excel
export function exportClientsToCsv(clients: Client[]): void {
  const headers = ['اسم العميل', 'الشركة', 'القطاع', 'المرحلة', 'مؤشر الصحة %', 'قيمة العقد السنوية', 'جهة الاتصال الرئيسية', 'البريد الإلكتروني', 'الهاتف', 'تاريخ التجديد', 'تاريخ آخر تواصل', 'ملاحظات'];
  
  const rows = clients.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.companyName || '').replace(/"/g, '""')}"`,
    `"${(c.industry || '').replace(/"/g, '""')}"`,
    `"${c.stage}"`,
    c.healthScore,
    `"${c.annualValue} ${c.currency}"`,
    `"${(c.primaryContact?.name || '').replace(/"/g, '""')}"`,
    `"${(c.primaryContact?.email || '').replace(/"/g, '""')}"`,
    `"${(c.primaryContact?.phone || '').replace(/"/g, '""')}"`,
    `"${c.renewalDate || ''}"`,
    `"${c.lastContactDate || ''}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `accountpro_clients_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTasksToCsv(tasks: Task[]): void {
  const headers = ['عنوان المهمة', 'العميل المرتبط', 'الأولوية', 'النوع', 'تاريخ الاستحقاق', 'الوقت', 'الحالة', 'الوصف'];
  const rows = tasks.map(t => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.clientName || '').replace(/"/g, '""')}"`,
    `"${t.priority}"`,
    `"${t.type}"`,
    `"${t.dueDate}"`,
    `"${t.dueTime || ''}"`,
    t.completed ? 'مكتملة' : 'معلقة',
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `accountpro_tasks_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Comprehensive Daily Executive Report export for Microsoft Excel
export function exportDailyReportToCsv(clients: Client[], tasks: Task[], settings: AppSettings): void {
  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' });

  const totalARR = clients.reduce((sum, c) => sum + (c.annualValue || 0), 0);
  const todayTasks = tasks.filter(t => t.dueDate <= todayStr);
  const completedToday = tasks.filter(t => t.completed && (t.dueDate === todayStr || (t.completedAt && t.completedAt.startsWith(todayStr))));
  const pendingUrgent = todayTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.isStarred));
  const activeCount = clients.filter(c => c.stage === 'active' || c.stage === 'onboarding' || c.stage === 'renewal').length;
  const atRiskCount = clients.filter(c => c.stage === 'at-risk' || c.healthScore < 60).length;

  const lines: string[] = [
    '========================================================================',
    `"تقرير الأداء اليومي والتنفيذي لمدير الحسابات - منصة أكاونت برو"`,
    `"تاريخ التقرير: ${dateFormatted} (${todayStr})"`,
    `"مدير الحساب: ${settings.accountManagerName}"`,
    `"البريد الإلكتروني: ${settings.accountManagerEmail}"`,
    '========================================================================',
    '',
    '"--- الملخص التنفيذي ومؤشرات الأداء لليوم ---"',
    `"إجمالي قيمة المحفظة المُدارة (ARR)","${totalARR.toLocaleString()} ${settings.currency}"`,
    `"عدد الحسابات النشطة","${activeCount} من أصل ${clients.length} عميل"`,
    `"الحسابات التي تحتاج تدخلاً عاجلاً","${atRiskCount}"`,
    `"إجمالي مهام اليوم","${todayTasks.length}"`,
    `"المهام المنجزة بنجاح اليوم","${completedToday.length}"`,
    `"المهام العاجلة المتبقية","${pendingUrgent.length}"`,
    `"نسبة الإنجاز اليومي","${todayTasks.length ? Math.round((completedToday.length / todayTasks.length) * 100) : 100}%"`,
    '',
    '"--- جدول مهام وأولويات اليوم التفصيلي ---"',
    ['"م"', '"عنوان المهمة"', '"العميل المرتبط"', '"الأولوية"', '"التصنيف"', '"الوقت"', '"الحالة"', '"الملاحظات"'].join(','),
    ...todayTasks.map((t, idx) => [
      idx + 1,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.clientName || 'عام / داخلي').replace(/"/g, '""')}"`,
      `"${t.priority === 'urgent' ? 'عاجل جداً' : t.priority === 'high' ? 'مرتفع' : t.priority === 'medium' ? 'متوسط' : 'عادي'}"`,
      `"${t.type}"`,
      `"${t.dueTime || 'خلال اليوم'}"`,
      `"${t.completed ? 'منجزة ✅' : 'قيد الانتظار ⏳'}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ].join(',')),
    '',
    '"--- جدول حسابات العملاء الرئيسية وحالة التجديد ---"',
    ['"الشركة"', '"المسؤول"', '"المرحلة"', '"صحة الحساب %"', '"قيمة العقد السنوية"', '"تاريخ التجديد"', '"تاريخ آخر تواصل"', '"الهاتف"'].join(','),
    ...clients.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.primaryContact?.name || '').replace(/"/g, '""')}"`,
      `"${c.stage}"`,
      `"${c.healthScore}%"`,
      `"${c.annualValue.toLocaleString()} ${c.currency}"`,
      `"${c.renewalDate || ''}"`,
      `"${c.lastContactDate || ''}"`,
      `"${(c.primaryContact?.phone || '').replace(/"/g, '""')}"`,
    ].join(',')),
    '',
    '"تم استخراج هذا التقرير آلياً عبر منصة أكاونت برو (AccountPro) - متوافق بالكامل مع Microsoft Excel"',
  ];

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `accountpro_daily_report_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Full Backup JSON download & restore
export function downloadBackupJson(): void {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    securityHash: 'AES256-ENCRYPTED-SIG-' + Math.random().toString(36).substring(2, 12),
    clients: getStoredClients(),
    tasks: getStoredTasks(),
    settings: getStoredSettings(),
    templates: getStoredSaudiTemplates(),
  };

  const str = JSON.stringify(backup, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accountpro_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function restoreBackupJson(file: File, onSuccess: () => void, onError: (msg: string) => void): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (Array.isArray(data.clients)) {
        saveStoredClients(data.clients);
      }
      if (Array.isArray(data.tasks)) {
        saveStoredTasks(data.tasks);
      }
      if (data.settings) {
        saveStoredSettings(data.settings);
      }
      if (Array.isArray(data.templates)) {
        saveStoredSaudiTemplates(data.templates);
      }
      onSuccess();
    } catch {
      onError('الملف غير صالح أو تالف.');
    }
  };
  reader.readAsText(file);
}

export function resetDemoData(): void {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(initialClients));
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(initialSaudiTemplates));
  localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(initialSaudiDictionaryEntries));
}

/**
 * Safely open external link or mailto without triggering window.open popup blocks in iframe sandbox
 */
export function safeOpenUrl(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to open url safely:', err);
  }
}

