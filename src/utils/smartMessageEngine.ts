import { 
  SmartMessageSituation, 
  SmartMessageClientState, 
  SmartMessageTone, 
  TemplateGender, 
  GeneratedDualMessage, 
  Client 
} from '../types';

export interface SmartMessageParams {
  client?: Client | null;
  clientName: string;
  companyName: string;
  situation: SmartMessageSituation;
  clientState: SmartMessageClientState;
  tone: SmartMessageTone;
  gender: TemplateGender;
  serviceOrTaskName?: string;
  attachmentLink?: string;
  dueDateTime?: string;
  bonusOrOffer?: string;
  extraNotes?: string;
}

export const SITUATION_OPTIONS: { id: SmartMessageSituation; labelAr: string; icon: string; description: string }[] = [
  { id: 'confirmation', labelAr: 'التأكيد 📋', icon: 'CheckSquare', description: 'تأكيد استلام ملفات، متطلبات، موعد، أو دفعة مالية' },
  { id: 'delivery', labelAr: 'التسليم والإنجاز 🚀', icon: 'PackageCheck', description: 'تسليم مسودة أولى، مشروع نهائي، أو إطلاق حملة' },
  { id: 'followup', labelAr: 'المتابعة والتذكير ⏳', icon: 'Clock', description: 'متابعة دورية، متابعة عدم رد، أو تذكير بالموعد' },
  { id: 'approval', labelAr: 'الموافقة والاعتماد ✍️', icon: 'FileCheck', description: 'طلب اعتماد ميزانية، خطة، تصاميم، أو عقد رسمي' },
  { id: 'revision', labelAr: 'التعديل والملاحظات 🔄', icon: 'Edit3', description: 'طلب تعديلات، تأكيد استلامها، أو توضيح ملاحظة' },
  { id: 'review', labelAr: 'المراجعة والتدقيق 🔍', icon: 'Search', description: 'مراجعة قبل الإطلاق، مراجعة ربع سنوية، أو فحص تقني' },
  { id: 'renewal', labelAr: 'التجديد والترقية 📈', icon: 'TrendingUp', description: 'تجديد العقد، ترقية الباقة، أو توسيع نطاق العمل' },
  { id: 'apology', labelAr: 'الاعتذار وحل المشكلات 🤝', icon: 'ShieldAlert', description: 'تدارك تأخير، معالجة خطأ تقني، أو امتصاص استياء' },
  { id: 'winback', labelAr: 'استرجاع عميل سابق 🎯', icon: 'RotateCcw', description: 'إعادة تفعيل علاقة، فحص مجاني، أو باقة تجريبية' },
  { id: 'welcome', labelAr: 'الترحيب والتهيئة 🌿', icon: 'Heart', description: 'بدء التعاقد، تفعيل الحساب، وطلب أولى المتطلبات' },
];

export const CLIENT_STATE_OPTIONS: { id: SmartMessageClientState; labelAr: string; badgeColor: string; description: string }[] = [
  { id: 'normal', labelAr: 'طبيعي ومتعاون 🟢', badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200', description: 'سير العمل معتاد ولا توجد ضغوط استثنائية' },
  { id: 'urgent', labelAr: 'عاجل ومستعجل 🔥', badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200', description: 'ضغط وقت عالي، موعد قريب، أو فرصة موسمية' },
  { id: 'delayed_reply', labelAr: 'متأخر عن الرد ⏳', badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200', description: 'لم يرد على الرسالة السابقة ونحتاج تحفيزه بلباقة' },
  { id: 'satisfied', labelAr: 'راضي وفخور بالنتائج ⭐', badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200', description: 'معجب بالعمل، فرصة ذهبية للترقية أو طلب توصية' },
  { id: 'hesitant', labelAr: 'متردد ومحتاط 🤔', badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200', description: 'يحتاج طمأنة وتوضيح بالأرقام والضمانات' },
  { id: 'objecting', labelAr: 'معترض أو متطلب ⚠️', badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200', description: 'لديه ملاحظات قوية أو عتاب يحتاج امتصاص راقٍ' },
];

export const TONE_OPTIONS: { id: SmartMessageTone; labelAr: string; description: string }[] = [
  { id: 'executive_royal', labelAr: 'رسمي فخم رفيع 👑', description: 'عبارات راقية، تقدير عالي، مناسب للشركات الكبرى والمتنفذين' },
  { id: 'friendly_warm', labelAr: 'ودي أخوي دافئ 🤍', description: 'عفوي، قريب، يبني علاقة إنسانية متينة بدون كلفة' },
  { id: 'direct_concise', labelAr: 'مباشر وسريع ⚡️', description: 'مركز على الهدف والخطوة القادمة فوراً بدون مقدمات طويلة' },
  { id: 'marketing_numbers', labelAr: 'تسويقي بالأرقام والـ ROI 📊', description: 'لغة نمو، مؤشرات أداء، وعوائد استثمارية واضحة' },
  { id: 'najdi', labelAr: 'لهجة نجدية أصيلة 🇸🇦', description: 'يا بعدي، سم وأبشر، عساك مروق، فالك التوفيق' },
  { id: 'hijazi', labelAr: 'لهجة حجازية رايقة ☕', description: 'يا سيدي، يسعد مساك، ربي يبارك لك، بالخدمة' },
  { id: 'general_saudi', labelAr: 'سعودي أعمال عام 🤝', description: 'المزيج المثالي المعتمد في كبرى وكالات الرياض وجدة' },
];

export function getGreeting(gender: TemplateGender, name: string, tone: SmartMessageTone): string {
  const cleanName = name.trim() || (gender === 'female' ? 'سارة' : 'فهد');
  
  if (tone === 'najdi') {
    if (gender === 'female') return `يا هلا ومسهلا أستاذة ${cleanName}، مساكِ الله بالخير والرضا 🌸`;
    if (gender === 'neutral') return `يا هلا بالجميع وصبحكم الله بالنور والسرور شركاءنا 🌿`;
    return `يا هلا ومسهلا يا بو ${cleanName}، صبحك الله بالخير وطاعة الرحمن ☀️`;
  }

  if (tone === 'hijazi') {
    if (gender === 'female') return `أهلاً وسهلاً أستاذة ${cleanName}، يسعد أوقاتكِ بكل خير وسرور 🌸`;
    if (gender === 'neutral') return `أهلاً بالكرام شركاءنا الأعزاء، يسعد مساكم يارب 🌿`;
    return `يا سيدي يا بو ${cleanName}، يسعد مساك وصباحك بكل خير يا غالي ☕`;
  }

  if (tone === 'executive_royal') {
    if (gender === 'female') return `تحية طيبة وتقدير كريم، سعادة الأستاذة ${cleanName} الموقرة 👑`;
    if (gender === 'neutral') return `تحية احترام وتقدير متبادل لشركاء النجاح فريق العمل الموقر 👑`;
    return `تحية طيبة وتقدير كريم، سعادة الأستاذ ${cleanName} الموقر 👑`;
  }

  if (tone === 'friendly_warm') {
    if (gender === 'female') return `يا هلا أستاذة ${cleanName}، عساكِ بألف صحة وعافية يارب 🤍`;
    if (gender === 'neutral') return `مساكم الله بالخير والبركة جميعاً فريقنا الرائع 🤍`;
    return `يا هلا يا بو ${cleanName}، عساك بألف صحة وعافية ومروق 🤍`;
  }

  if (tone === 'direct_concise') {
    if (gender === 'female') return `أهلاً أستاذة ${cleanName} ⚡️`;
    if (gender === 'neutral') return `تحية طيبة فريق العمل ⚡️`;
    return `يا هلا يا بو ${cleanName} ⚡️`;
  }

  // General Saudi
  if (gender === 'female') return `مساكِ الله بالخير والرضا أستاذة ${cleanName} 🌿`;
  if (gender === 'neutral') return `تحية طيبة ومساء الخير لشركائنا الأعزاء في فريق العمل 🌿`;
  return `مساك الله بالخير والسرور يا بو ${cleanName} 🌿`;
}

/**
 * Intelligent Matrix Generator - Produces Dual Formats (Standard & Short)
 */
export function generateSmartDualMessage(params: SmartMessageParams): GeneratedDualMessage {
  const {
    clientName,
    companyName,
    situation,
    clientState,
    tone,
    gender,
    serviceOrTaskName = 'المخرجات والخدمات التسويقية',
    attachmentLink = 'https://shal.agency/preview',
    dueDateTime = 'اليوم قبل 04:00 مساءً',
    bonusOrOffer,
    extraNotes,
  } = params;

  const greeting = getGreeting(gender, clientName, tone);
  const company = companyName ? `[${companyName}]` : 'مشروعكم';
  const task = serviceOrTaskName || 'المخرجات المتفق عليها';
  const linkText = attachmentLink ? `\nرابط المعاينة المباشر: ${attachmentLink}` : '';
  const notesText = extraNotes ? `\nملاحظة خاصة: ${extraNotes}` : '';

  let standardBody = '';
  let shortBody = '';
  let subject = '';
  let tips: string[] = [];

  switch (situation) {
    case 'confirmation': {
      subject = `تأكيد استلام ومتابعة العمل - ${company}`;
      tips = [
        'أرسل التأكيد خلال أقل من 15 دقيقة من استلام المواد لتعزيز الثقة.',
        'وضح أن العمل قيد المعالجة المباشرة لتجنب تكرار استفسار العميل.',
      ];
      if (clientState === 'urgent') {
        standardBody = `${greeting}
نود التأكيد العاجل بوصول كافة المتطلبات والمواد الخاصة بـ ${task} لحساب ${company} بنجاح تام.
نظراً لأهمية الوقت والفرصة، وجّهنا فريق العمل ببدء التنفيذ الفوري ووضع الحساب في الأولوية القصوى. سنوافيكم بأول مسودة قبل الموعد المحدد (${dueDateTime}) بإذن الله.${notesText}
ترانا متابعين بكل حرص وفالك أعلى النتائج.`;
        shortBody = `تم استلام متطلبات ${task} لـ ${company} وتفعيل التنفيذ الفوري بأولوية قصوى ⚡️ التحديث الأول بيوصلك قبل ${dueDateTime}. تسلم يا غالي.`;
      } else if (clientState === 'delayed_reply') {
        standardBody = `${greeting}
حبينا نؤكد لك استلامنا للملاحظات وتثبيت ما تم الاتفاق عليه بخصوص ${task} لـ ${company}.
مقدرين انشغالك التام، وترانا بدأنا التنفيذ مباشرة لنوفر عليك الوقت ونسلمك العمل في أفضل حلة دون أي إجهاد لجدولكم.${linkText}${notesText}
بالخدمة دائماً وأي جديد يطري عليك ترانا بالانتظار.`;
        shortBody = `تأكيد وصول متطلبات ${task} لـ ${company} وجاري العمل عليها بالكامل لراحتكم 📋 بالخدمة دائماً.`;
      } else {
        standardBody = `${greeting}
نؤكد لكم استلام كافة الملفات والبيانات المتعلقة بـ ${task} لحساب ${company} بدقة واكتمال.
تمت مراجعة المواد من الفريق المختص وتوزيع المهام، والجدول الزمني يسير وفق أعلى المعايير لضمان مخرجات تليق بعلامتكم.${linkText}${notesText}
شاكرين ومقدرين حسن تعاونكم، وترانا تحت أمركم في أي وقت.`;
        shortBody = `تأكيد استلام متطلبات ${task} كاملة لـ ${company} وجاري العمل عليها بكل كفاءة 📋 يعطيك ألف عافية.`;
      }
      break;
    }

    case 'delivery': {
      subject = `تسليم مخرجات العمل - ${company} - ${task}`;
      tips = [
        'أرفق رابط المعاينة السريع واطلب انطباع العميل الأولي بحرارة.',
        'وضح الاستعداد الكامل لتطبيق أي تعديلات ترغب بها الإدارة.',
      ];
      if (clientState === 'urgent') {
        standardBody = `${greeting}
يسعدنا إحاطتكم باكتمال وتجهيز ${task} لـ ${company} في وقت قياسي ومطابق لأدق المعايير المطلوبة:
${linkText}
أنجزنا العمل بتركيز عالٍ لاغتنام موعدكم المستهدف. نرجو التفضل بالمعاينة السريعة واعتمادها لنطلق الخطوة التالية فوراً.${notesText}
فالكم التميز والتوفيق الدائم.`;
        shortBody = `تم إنجاز وتسليم ${task} لـ ${company} في وقت قياسي 🚀 المعاينة: ${attachmentLink} بانتظار إشارتك للاعتماد الفوري.`;
      } else if (clientState === 'satisfied') {
        standardBody = `${greeting}
مبارك الإنجاز! يسعدنا تسليمكم النسخة المعتمدة والمطورة من ${task} لـ ${company}:
${linkText}
بنينا هذا العمل بناءً على النجاحات السابقة التي حققناها سوا، وبإذن الله هذا التسليم سينقل مؤشرات الأداء لمستوى أعلى.${bonusOrOffer ? `\nوكهدية تقديرية من الوكالة: ${bonusOrOffer}` : ''}${notesText}
فخورين جداً بشراكتنا المستمرة ونتطلع لسماع رأيكم الكريم.`;
        shortBody = `مبارك الإنجاز 🏁 تم تسليم ${task} لـ ${company}: ${attachmentLink} فخورين بشراكتنا وفالكم أعلى مبيعات.`;
      } else {
        standardBody = `${greeting}
يسعد فريق الوكالة مشاركتكم مخرجات ${task} لحساب ${company} عبر الرابط التالي:
${linkText}
حرصنا على تطبيق أعلى معايير الجودة والإبداع لتعكس مكانة علامتكم التجارية. نتطلع لمراجعتكم الكريمة ومشاركتنا أي انطباع أو ملاحظات لنعتمدها سوا.${notesText}
يعطيكم ألف عافية وبالخدمة دائماً.`;
        shortBody = `تم تسليم مخرجات ${task} لـ ${company} 🚀 الرابط: ${attachmentLink} بانتظار رأيك وملاحظاتك الكريمة.`;
      }
      break;
    }

    case 'followup': {
      subject = `متابعة واستكمال خطوات العمل - ${company}`;
      tips = [
        'في حال عدم الرد، لا تلم العميل، بل اعرض المساعدة واذكر أنك تسعى لحماية جدوله الزمني.',
        'اطرح سؤالاً ختامياً محدداً وسهل الإجابة بكلمة واحدة أو بنعم/لا.',
      ];
      if (clientState === 'delayed_reply' || clientState === 'urgent') {
        standardBody = `${greeting}
عساك بألف صحة وعافية يارب 🌿
مقدرين جداً انشغالكم ومسؤولياتكم الكثيرة، حابين فقط نتابع معكم بخصوص ${task} لـ ${company} لنتأكد أن كل شي ماشي بالمسار المخطط له وما نتأخر في موعد الإطلاق.${linkText}
إذا سنحت لك دقيقة، هل نعتمد النسخة الحالية وننطلق، أم تحب نعدل أي تفصيلة؟ ردك بكلمة وحدة يسعدنا ويوجهنا.${notesText}
بالخدمة دائماً وأبشر بما يسرك.`;
        shortBody = `عساك بخير ومقدرين انشغالك 🌿 ننتظر فقط إشارتك السريعة على ملف ${company}: ${attachmentLink} لننطلق وما نتأخر بالجدول. تسلم يا بعدي.`;
      } else if (clientState === 'satisfied') {
        standardBody = `${greeting}
حبينا نتابع معكم نتائج الأيام الماضية بعد إطلاق ${task} لـ ${company} 📈
المؤشرات الأولية إيجابية جداً والتفاعل في تصاعد مستمر. ودنا نحدد موعد مكالمة سريعة لمدة 10 دقائق لمناقشة توسيع الحملة والاستفادة القصوى من هذا الزخم.${notesText}
يناسبك وقت قصير اليوم أو بكرة الصباح؟`;
        shortBody = `مؤشرات ${company} تفتح النفس 📈 ودنا بمكالمة سريعة لتعظيم النتائج وتوسيع الحملة. متى يناسبك وقت خفيف؟`;
      } else {
        standardBody = `${greeting}
أتمنى أن تكون بأفضل حال.
حبيت أسلم وأتابع معك إذا سنحت لك الفرصة للاطلاع على ملف ${task} المرفق لـ ${company}:
${linkText}
إذا في أي استفسار أو نقطة ودك نوضحها تراني جاهز وموجود بالخدمة في أي وقت.${notesText}
يومك سعيد وموفق بإذن الله.`;
        shortBody = `صبحك الله بالخير ☕️ حبيت أتابع معك بخصوص ملف ${company}: ${attachmentLink} بشر كيف شفته؟ بالخدمة دائماً.`;
      }
      break;
    }

    case 'approval': {
      subject = `طلب اعتماد وموافقة - ${task} - ${company}`;
      tips = [
        'حدد بالضبط ما المطلوب اعتماده (ميزانية، تصاميم، نص، عقد) واذكر الموعد الأقصى.',
        'وضح الأثر الإيجابي للاعتماد السريع (بدء البث فوراً، حجز الموعد).',
      ];
      if (clientState === 'urgent') {
        standardBody = `${greeting}
نحتاج اعتمادكم الكريم والعاجل لـ ${task} الخاص بـ ${company}:
${linkText}
نظراً لحساسية التوقيت واقتراب موعد الذروة، اعتمادكم خلال الساعات القادمة يضمن لنا تفعيل الحملات دون تفويت الفرصة السوقية.${notesText}
هل نتوكل على الله ونعتمدها للانطلاق فوراً؟`;
        shortBody = `عاجل للاعتماد ⚡️ نحتاج موافقتك على ${task} لـ ${company}: ${attachmentLink} لنطلق الحملات في وقت الذروة الآن.`;
      } else {
        standardBody = `${greeting}
أتممنا تجهيز كافة تفاصيل ${task} لـ ${company} وهي متاحة للاطلاع والاعتماد هنا:
${linkText}
تمت مراجعة الخطة بدقة لتتوافق مع أهداف المبيعات والهوية. نحتاج موافقتكم الكريمة لنتمكن من جدولة النشر والبدء في الإجراءات التنفيذية الميدانية.${notesText}
بانتظار توجيهكم السديد وكلنا حماس للنتائج.`;
        shortBody = `بانتظار اعتمادك الكريم لـ ${task} لـ ${company} ✍️ الرابط: ${attachmentLink} لنبدأ التنفيذ مباشرة. يعطيك العافية.`;
      }
      break;
    }

    case 'revision': {
      subject = `تحديث ومتابعة التعديلات - ${company} - ${task}`;
      tips = [
        'أظهر الترحيب الكامل بملاحظات العميل واجعلها تبدو كخطوة طبيعية نحو الامتياز.',
        'حدد موعداً واضحاً ومحكماً لتسليم النسخة المعدلة.',
      ];
      if (clientState === 'objecting') {
        standardBody = `${greeting}
حقك علينا ورأيك وملاحظاتك محل تقديرنا واهتمامنا البالغ 🤝
استلمنا النقاط التي تفضلت بذكرها حول ${task} لـ ${company}، ووجهنا الفريق فوراً بإعادة صياغة وضبط كل جزئية بما يطابق رؤيتكم وتطلعاتكم بالتمام.
نعدك بأن النسخة القادمة ستنال رضاكم التام وسنسلمها قبل (${dueDateTime}).${notesText}
راحتكم ورضاكم أولويتنا الأولى دائماً، وأبشر بما يطيب خاطرك.`;
        shortBody = `ملاحظاتك على راسنا يا غالي 🤝 استلمنا نقاط التعديل لـ ${company} وشغالين عليها فوراً لتطلع بالشكل اللي يرضيك وزيادة. أبشر بعزك.`;
      } else {
        standardBody = `${greeting}
وصلتنا ملاحظاتك وتعديلاتك الكريمة على ${task} لـ ${company} وواضحة جداً 🛠
الفريق استلمها وبدأ بتطبيقها بكل دقة، وبإذن الله بنشاركك النسخة المعدلة والجاهزة قبل (${dueDateTime}).${notesText}
شكراً لحرصك ومتابعتك الدقيقة، وترانا معك خطوة بخطوة.`;
        shortBody = `وصلت التعديلات لـ ${company} 🛠 شغالين عليها حالياً وبنسلمك النسخة المحدثة قريباً بإذن الله. تسلم.`;
      }
      break;
    }

    case 'review': {
      subject = `ملف التدقيق والمراجعة الشاملة - ${company}`;
      tips = [
        'قدم ملف المراجعة بشكل منظم يسهل تصفحه وإبداء الملاحظات عليه.',
        'اذكر نقاط القوة التي لاحظتموها أثناء الفحص الفني.',
      ];
      standardBody = `${greeting}
نضع بين يديك ملف التدقيق والمراجعة الشاملة لـ ${task} الخاص بـ ${company}:
${linkText}
فحصنا التفاصيل التقنية والتسويقية وربطنا التتبع وتأكدنا من سلامة تجربة المستخدم. نأمل إلقاء نظرتكم الخبيرة لنضمن اكتمال التوافق قبل الانتقال للمرحلة التالية.${notesText}
بانتظار توجيهاتكم الكريمة وبالخدمة دائماً.`;
      shortBody = `ملف المراجعة والتدقيق لـ ${company} جاهز لاطلاعك 🔍 ${attachmentLink} ننتظر نظرتك وتوجيهك الكريم.`;
      break;
    }

    case 'renewal': {
      subject = `تقرير النتائج ومقترح تجديد الشراكة - ${company}`;
      tips = [
        'اذكر أرقام النجاح والنمو التي حققتموها في الفترة السابقة قبل طرح التجديد.',
        'قدم ميزة حصرية أو خصم عملاء التميز للاستمرار السلس.',
      ];
      standardBody = `${greeting}
مع اقتراب موعد تجديد اشتراكنا الشهري لـ ${company}، يسعدنا أولاً شكركم على هذه الشراكة الاستثنائية 📈
خلال الفترة الماضية حققنا معاً نمواً ملموساً واستقراراً في استقطاب العملاء. جهزنا لكم تقرير الأداء ومقترح تجديد وترقية الخطة لتعظيم المكاسب في الموسم القادم:
${linkText}${bonusOrOffer ? `\nومع التجديد خصصنا لكم ميزة استثنائية: ${bonusOrOffer}` : ''}${notesText}
يسعدنا اعتمادكم للاستمرار بنفس القوة والريادة.`;
      shortBody = `تقرير نتائج ${company} ومقترح تجديد الشراكة جاهز لاعتمادكم 📈 ${attachmentLink} فخورين بالاستمرار معكم ومواصلة النمو سوا.`;
      break;
    }

    case 'apology': {
      subject = `توضيح وتحديث هام - ${company}`;
      tips = [
        'تحمل المسؤولية بشجاعة بدون اختلاق أعذار واهية.',
        'قدم الحل الفوري والتعويض أو الميزة الإضافية مباشرة.',
      ];
      standardBody = `${greeting}
نعتذر لكم بصدق عن أي تأخير أو لبس طرأ بخصوص ${task} لـ ${company} 🤝
نقدر تماماً التزامكم وحرصكم، وقد اتخذنا إجراءات فورية لمعالجة الأمر وتسليم العمل بجودة مضاعفة قبل (${dueDateTime}).${bonusOrOffer ? `\nوتقديراً لصبركم وحسن تعاملكم، أضفنا لحسابكم: ${bonusOrOffer}` : ''}${notesText}
ثقتكم أغلى ما نملك، ولن نرضى إلا بما يسعدكم ويرفع الرأس.`;
      shortBody = `نعتذر عن التأخير غير المقصود في ${task} لـ ${company} 🤝 الأمر تحت المعالجة المباشرة وبنسلمك العمل بأعلى جودة اليوم. حقك علينا.`;
      break;
    }

    case 'winback': {
      subject = `فرصة خاصة وتجديد الشراكة الطيبة - ${company}`;
      tips = [
        'لا تضغط للبيع مباشرة، بل اطمئن على العميل وقدم قيمة مجانية أو فحصاً نافعاً.',
        'ذكّر بالنتائج الإيجابية السابقة التي حققتموها معاً.',
      ];
      standardBody = `${greeting}
يعلم الله مكانتكم ومعزتكم غالية عند فريق الوكالة، وكنا وما زلنا فخورين بكل خطوة بنيناها سوا لـ ${company} 🤍
حبينا نتطمن على مسيرتكم وأخباركم. جهزنا لكم تدقيقاً تسويقياً مجانياً لفرص السوق الحالية:
${linkText}${bonusOrOffer ? `\nبالإضافة لباقة تجريبية خاصة جداً: ${bonusOrOffer}` : ''}${notesText}
يسعدنا جداً استعادة العمل معكم وتحقيق قفزات جديدة تليق بكم.`;
      shortBody = `يا هلا ومسهلا بشركائنا الأعزاء في ${company} 🤍 فاقدين تواصلكم وحبينا نتطمن عليكم ونشارككم تقرير فرص جديد: ${attachmentLink} بالخدمة دائماً.`;
      break;
    }

    case 'welcome': {
      subject = `أهلاً وسهلاً بكم في عائلة الوكالة - تفعيل حساب ${company}`;
      tips = [
        'اجعل رسالة الترحيب تشعر العميل بأنه بين أيدٍ أمينة وخبيرة.',
        'وضح الخطوة الأولى المطلوبة منه بدقة واختصار.',
      ];
      standardBody = `${greeting}
أهلاً وسهلاً بكم شركاء النجاح في عائلة الوكالة! سعداء وفخورون جداً بانضمام ${company} إلينا 🌿
تم تعيين فريق عمل مخصص لإدارة حسابكم ومتابعة كافة احتياجاتكم. الخطوة الأولى هي استيفاء المتطلبات الأساسية عبر الرابط:
${linkText}${notesText}
نعدكم بشراكة استثنائية تصنع الفارق في نمو أعمالكم. ترانا معك على مدار الساعة وفالنا التوفيق سوا!`;
      shortBody = `يا أهلاً ومسهلاً بـ ${company} معنا 🌿 بدأنا إجراءات تفعيل الحساب: ${attachmentLink} ونتطلع لرحلة نجاح مشتركة بإذن الله!`;
      break;
    }
  }

  return {
    standard: standardBody.trim(),
    short: shortBody.trim(),
    subject,
    tips,
  };
}
