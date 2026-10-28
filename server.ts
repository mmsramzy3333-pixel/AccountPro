import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Process-level crash prevention
process.on('uncaughtException', (err) => {
  console.error('Safe process protection - uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Safe process protection - unhandledRejection:', reason);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: Draft Follow-Up Email
app.post('/api/ai/draft-email', async (req, res) => {
  try {
    const { clientName, contactName, goal, context, tone, language = 'ar' } = req.body;
    
    if (!ai) {
      return res.json({
        subject: `متابعة الشراكة والخطوات القادمة - ${clientName || 'العميل العزيز'}`,
        body: `عزيزي ${contactName || 'السيد/ة الشريك'},\n\nأتمنى أن تكون بأفضل حال.\n\nأتواصل معك اليوم لمتابعة ما تم الاتفاق عليه بخصوص مشروعنا وخدماتكم مع ${clientName || 'شركتكم الموقرة'}.\n\nالهدف من هذه الرسالة: ${goal || 'التنسيق والاطمئنان على سير العمل'}.\n${context ? `ملاحظات: ${context}\n\n` : ''}يسعدني جداً تحديد موعد لمكالمة سريعة لمدة 15 دقيقة خلال هذا الأسبوع.\n\nمع خالص التقدير والتحيات،\nمدير حسابك الشخصي`,
        isFallback: true,
      });
    }

    const isSaudiTone = tone?.includes('سعودي');
    const langPrompt = isSaudiTone 
      ? 'باللهجة السعودية الخليجية العامية العفوية المحببة والمناسبة لمحادثات الواتساب بين الأكاونت مانجر وعميل وكالة التسويق الرقمي، بدون تكلف رسمي جاف وبأسلوب دافئ ومحترف'
      : language === 'ar' ? 'باللغة العربية الاحترافية واللبقة' : language === 'fr' ? 'en français professionnel' : 'in professional English';
    const prompt = `أنت مساعد خبير لمدير حسابات العملاء (Senior Account Manager) في وكالة تسويق رقمي وإعلانات.
اكتب رسالة أو بريداً ${langPrompt}.
العميل: ${clientName || 'الشركة'}
المسؤول المستهدف: ${contactName || 'المسؤول'}
الهدف من الرسالة: ${goal || 'متابعة دورية'}
سياق وتفاصيل إضافية: ${context || 'متابعة العمل ومراجعة الاحتياجات'}
نبرة الصوت: ${tone || 'مهنية وودودة'}

أخرج النتيجة بصيغة JSON فقط:
{
  "subject": "عنوان جذاب ومباشر للإيميل",
  "body": "نص الإيميل الكامل والمنسق بفقرات واضحة مع التحية والخاتمة"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      subject: parsed.subject || `متابعة سريعة - ${clientName}`,
      body: parsed.body || response.text,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error drafting email:', error);
    res.status(500).json({ error: 'Failed to generate email draft', details: error?.message });
  }
});

// Endpoint: Account Health & Strategic Advice
app.post('/api/ai/account-advice', async (req, res) => {
  try {
    const { client, language = 'ar' } = req.body;

    if (!ai) {
      return res.json({
        summary: `خطة عمل سريعة لحساب ${client?.name || 'العميل'}: يوصى بجدولة مكالمة مراجعة ربع سنوية، والتأكد من تلبية جميع متطلبات الفريق الفني لديهم لضمان تجديد العقد بسهولة.`,
        actionItems: [
          'إرسال تقرير إنجازات الشهر الماضي للعميل لإبراز القيمة العائدة عليهم (ROI).',
          'التواصل مع متخذ القرار الرئيسي قبل 30 يوماً من موعد التجديد.',
          'اقتراح ميزة إضافية أو توسع (Upsell) لحل مشكلتهم الأخيرة.'
        ],
        isFallback: true,
      });
    }

    const prompt = `أنت مستشار استراتيجي لمديري حسابات العملاء (Customer Success & Key Account Management Advisor).
حلل بيانات العميل التالية وقدم نصائح عملية ومحددة لزيادة الاحتفاظ به (Retention) وتجنب الإلغاء (Churn Prevention) واقتناص فرص التوسع (Upsell):
بيانات العميل:
- الاسم: ${client?.name}
- القطاع: ${client?.industry || 'غير محدد'}
- الحالة: ${client?.status}
- مؤشر صحة الحساب: ${client?.healthScore}/100
- قيمة العقد السنوية: ${client?.dealValue || 0}
- آخر تواصل: ${client?.lastContactDate || 'غير مسجل'}
- ملاحظات ومشاكل سابقة: ${client?.notes || 'لا يوجد'}

أجب بصيغة JSON:
{
  "summary": "ملخص تقييمي سريع ومباشر في سطرين",
  "riskLevel": "منخفض" أو "متوسط" أو "مرتفع",
  "actionItems": [
    "الخطوة الأولى المحددة",
    "الخطوة الثانية المحددة",
    "الخطوة الثالثة المحددة"
  ],
  "recommendedUpsell": "فكرة ذكية لتطوير التعاون إن أمكن"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in account advice:', error);
    res.status(500).json({ error: 'Failed to generate account advice', details: error?.message });
  }
});

// Endpoint: Daily Executive Briefing
app.post('/api/ai/daily-briefing', async (req, res) => {
  try {
    const { tasks, clients, stats, language = 'ar' } = req.body;

    if (!ai) {
      return res.json({
        greeting: 'صباح النشاط والإنتاجية! 🚀',
        topPriority: 'متابعة العميل ذو الأولوية العاجلة وإغلاق مهام اليوم لتأمين رضا العملاء.',
        briefing: 'لديك اليوم مهام مجدولة لمتابعة أهم الشركاء. الحفاظ على سرعة الاستجابة يرفع نسبة تجديد العقود بنسبة 35%. ركز على الأولويات الأولى أولاً.',
        energyTip: 'ابدأ بمكالمة العميل الأكثر أهمية في أول 90 دقيقة من يوم العمل.',
        isFallback: true,
      });
    }

    const prompt = `أنت مساعد وموجه تنفيذي لمدير حسابات العملاء (Account Manager).
لدينا البيانات التالية لليوم:
- عدد المهام المعلقة لليوم: ${tasks?.length || 0}
- أهم مهام اليوم: ${JSON.stringify(tasks?.slice(0, 4) || [])}
- إجمالي العملاء المدارين: ${clients?.length || 0}
- إحصائيات سريعة: ${JSON.stringify(stats || {})}

قم بتوليد إيجاز تنفيذي ذكي ومحفز وموجز جداً لليوم يساعد مدير الحساب على تنظيم وقته وتحقيق أفضل أداء.
أجب بصيغة JSON:
{
  "greeting": "تحية صباحية نشطة واحترافية",
  "topPriority": "أهم أولوية واحدة مطلقة يجب إنجازها اليوم",
  "briefing": "ملخص ملهم في فقرة مركزة ومريحة للقراءة",
  "energyTip": "نصيحة ذهبية لمدير الحسابات اليوم"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating daily briefing:', error);
    res.status(500).json({ error: 'Failed to generate daily briefing', details: error?.message });
  }
});

// Endpoint: AI Daily Task & Client Prioritization (Optimal Order of Operations)
app.post('/api/ai/prioritize-tasks', async (req, res) => {
  try {
    const { tasks, clients, language = 'ar' } = req.body;

    if (!ai) {
      // High-grade fallback prioritization logic
      const sorted = [...(tasks || [])].sort((a: any, b: any) => {
        const clientA = (clients || []).find((c: any) => c.id === a.clientId);
        const clientB = (clients || []).find((c: any) => c.id === b.clientId);
        const aRisk = clientA?.stage === 'at-risk' || (clientA?.healthScore && clientA.healthScore < 60) ? 1 : 0;
        const bRisk = clientB?.stage === 'at-risk' || (clientB?.healthScore && clientB.healthScore < 60) ? 1 : 0;
        if (aRisk !== bRisk) return bRisk - aRisk;
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        const valA = clientA?.annualValue || 0;
        const valB = clientB?.annualValue || 0;
        return valB - valA;
      });

      const timeslots = ['09:30 - 10:15', '10:30 - 11:15', '11:45 - 12:30', '14:00 - 14:45', '15:15 - 16:00', '16:15 - 17:00'];
      const scheduledTasks = sorted.map((t: any, idx: number) => {
        const client = (clients || []).find((c: any) => c.id === t.clientId);
        const isCritical = client?.stage === 'at-risk' || t.priority === 'urgent';
        return {
          taskId: t.id,
          taskTitle: t.title,
          clientName: client?.name || t.clientName || 'مهمة عامة',
          suggestedTimeSlot: timeslots[idx] || `16:${30 + idx * 10} - 17:00`,
          impactScore: isCritical ? 95 - idx * 2 : 80 - idx * 4,
          urgencyLevel: isCritical ? 'critical' : t.priority === 'high' ? 'high' : 'medium',
          reasoning: isCritical
            ? `أولوية قصوى: العميل لديه مؤشر صحة حساس (${client?.healthScore || 50}%) أو العقد في مرحلة حرجة. التدخل الصباحي السريع ينقذ الحساب ويضمن رضاهم.`
            : `متابعة منتظمة لضمان سير المشروع وتأكيد مواعيد التسليم مع الشركاء.`,
          suggestedAction: isCritical ? 'مكالمة هاتفية فورية مع متخذ القرار' : 'إرسال رسالة واتساب رسمية ومتابعة الإيميل',
        };
      });

      return res.json({
        strategySummary: 'الخطة المقترحة لليوم: البدء فوراً بحل شكاوى الحسابات الأكثر عرضة للخطر لتفادي الإلغاء، ثم حسم عقود التجديد السنوية ذات القيمة الأعلى قبل فترة الظهيرة.',
        focusRationale: 'التدخل في أول ساعتين من دوام العميل يرفع احتمالية تجاوب متخذ القرار بنسبة 65% مقارنة بالتواصل بعد الظهر.',
        scheduledTasks,
        generatedAt: new Date().toISOString(),
      });
    }

    const prompt = `أنت كبير مسؤولي عمليات إدارة الحسابات (VP of Account Management & Operations).
حلل المهام اليومية التالية للعملاء وقدم ترتيباً زمنياً ذكياً ومثالياً (Optimal Order of Operations) لليوم.
معايير التحليل:
1. المواعيد النهائية وعجلة المهام (Deadlines & Task Urgency).
2. تاريخ وسجل تواصل العميل وصحة حسابه وقيمة العقد (Client ARR & Churn Risk & Health Score).
3. التأثير المالي والعلاقاتي المحتمل (Impact Score).

المهام المتاحة:
${JSON.stringify(tasks || [])}

بيانات العملاء المرتبطين:
${JSON.stringify((clients || []).map((c: any) => ({
  id: c.id,
  name: c.name,
  stage: c.stage,
  healthScore: c.healthScore,
  annualValue: c.annualValue,
  lastContact: c.lastContactDate,
  renewalDate: c.renewalDate
})))}

قم بإنشاء جدول منظم لليوم يبدأ من الصباح (09:00) وحتى نهاية الدوام.
أجب بصيغة JSON حصراً:
{
  "strategySummary": "خلاصة استراتيجية اليوم في سطرين توضح فلسفة ترتيب الأولويات",
  "focusRationale": "لماذا يجب البدء بهذه المهمة بالذات في أول اليوم",
  "scheduledTasks": [
    {
      "taskId": "id المهمة الأصلي",
      "taskTitle": "عنوان المهمة",
      "clientName": "اسم العميل",
      "suggestedTimeSlot": "مثال: 09:30 - 10:15",
      "impactScore": 95,
      "urgencyLevel": "critical" أو "high" أو "medium",
      "reasoning": "سبب منطقي ومقنع لاختيار هذا الوقت بالذات استناداً لقيمة العميل وخطورته",
      "suggestedAction": "الإجراء الأمثل الموصى به (مكالمة هاتفية، واتساب خليجي رسمي، إيميل)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      strategySummary: parsed.strategySummary || 'جدول العمل الذكي لليوم تم ترتيبه لتعظيم الحفاظ على العقود.',
      focusRationale: parsed.focusRationale || 'التركيز الصباحي على الحسابات الحساسة.',
      scheduledTasks: parsed.scheduledTasks || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in prioritize-tasks:', error);
    res.status(500).json({ error: 'Failed to prioritize tasks', details: error?.message });
  }
});

// Endpoint: Personalize message in Authentic Everyday Saudi Marketing Agency Dialect
app.post('/api/ai/personalize-saudi-template', async (req, res) => {
  try {
    const { templateText, clientName, contactName, goal, context } = req.body;

    if (!ai) {
      const personalized = `يا هلا والله ومساء الخير يا ${contactName || 'غالي'} ☕️ عساك طيب ومروق.
شيكت لك الحين مع تيم الماركتنج والتصميم بخصوص ${clientName || 'شغلنا سوا'}، وكل الأمور ماشية تمام الحمد لله.
حابين نتطمن على سير العمل ونسمع رايك بمحتوى وحملات الفترة هذي، وإذا ودك نعدل أو نضيف أي فكرة ترانا حاضرين وتحت أمرك بأي وقت.
ودنا بمكالمة سريعة خمس دقايق متى ما ناسبك ندردش بالخطوات الجاية.
يسعد مساك يا بعدي!`;
      return res.json({ message: personalized });
    }

    const prompt = `أنت أكاونت مانجر (Account Manager) شاطر ومحترف في وكالة تسويق رقمي وإعلانات في السعودية (Marketing Agency in Riyadh).
تتواصل مع عميلك (صاحب براند / متجر / مدير تسويق) عبر الواتساب بشكل يومي.
المطلوب:
أعد صياغة وتخصيص الرسالة التالية لتكون:
1. أقل رسمية وأكثر واقعية وعفوية، تشبه تماماً محادثات الواتساب اليومية الحقيقية بين الأكاونت مانجر والعميل في وكالات التسويق في السعودية.
2. لهجة سعودية خليجية عامية طبيعية 100% ومريحة ومحببة (يا هلا والله ومساء الخير يا غالي / يا بو فلان، عساك مروق، أبشر بعزك، شيكت لك مع تيم التصميم والميديا باير، عطنا رايك واعتمادك، حقك علينا وما يصير خاطرك إلا طيب، ودنا بمكالمة سريعة خمس دقايق، إلخ).
3. بدون لغة عربية فصحى جافة أو كليشيهات رسمية متكلفة وبدون أي أسلوب بنكي أو حكومي.

بيانات العميل:
العميل / البراند: ${clientName || 'الشركة'}
اسم المسؤول: ${contactName || 'يا غالي'}
الهدف وسياق المهمة: ${goal || 'متابعة وتسليم شغل'}
تفاصيل وملاحظات إضافية: ${context || 'متابعة أداء وحملات'}
القالب المرجعي: ${templateText || ''}

أخرج فقط نص رسالة الواتساب النهائي الجاهز للإرسال مباشرة، بدون أي مقدمات أو شروحات.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ message: response.text?.trim() || templateText });
  } catch (error: any) {
    console.error('Error in personalize-saudi-template:', error);
    res.status(500).json({ error: 'Failed to personalize message', details: error?.message });
  }
});

// Endpoint: AI Saudi Dialect Linguistic Enhancer
app.post('/api/ai/suggest-saudi-dialect', async (req, res) => {
  try {
    const { text, gender = 'male', situation = 'general' } = req.body;
    if (!text || !text.trim()) {
      return res.json({ enhancedText: '', suggestions: [], score: 100 });
    }

    if (!ai) {
      return res.json({
        enhancedText: text,
        suggestions: [],
        score: 85,
        isFallback: true,
      });
    }

    const prompt = `أنت خبير لغوي واستشاري تسويق متخصص في اللهجة الخليجية السعودية لبيئة الأعمال والوكالات التسويقية.
المهمة:
قم بتحليل رسالة مسودة مكتوبة بواسطة مدير حسابات (Account Manager) واقترح التعديلات اللازمة لتصبح باللهجة السعودية العفوية والمهنية المعتمدة لعملاء الماركتنج في الرياض والمملكة.
الجنس المستهدف: ${gender === 'female' ? 'مؤنث (أستاذة / أم فلان)' : gender === 'neutral' ? 'محايد / لفريق وقروب العمل' : 'مذكر (أستاذ / بو فلان)'}
السياق والمناسبة: ${situation}

النص الحالي:
"""${text}"""

المطلوب:
1. استبدال أي كلمات رسمية جافة أو فصحى ثقيلة أو كلمات من لهجات أخرى (مثل: لو سمحت، عايز، شو رأيك، هلق، دلوقتي، معلش، يا باشا) ببدائل سعودية أصيلة وراقية (مثل: لاهنت، ودنا، وش رايك، الحين، أبشر بعزك، حقك علينا، يا بو فهد).
2. إخراج نتيجة JSON فقط بالهيكل التالي:
{
  "enhancedText": "النص الكامل بعد تطبيق كافة التحسينات والبدائل السعودية المناسبة",
  "suggestions": [
    {
      "originalPhrase": "العبارة الأصلية المستبدلة",
      "suggestedPhrase": "البديل السعودي المقترح",
      "reason": "السبب وشرح اللباقة السعودية"
    }
  ],
  "score": 95,
  "feedbackSummary": "ملخص سريع لتقييم النبرة والتحسينات"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      enhancedText: parsed.enhancedText || text,
      suggestions: parsed.suggestions || [],
      score: parsed.score || 90,
      feedbackSummary: parsed.feedbackSummary || 'تم تحسين الصياغة للهجة السعودية بنجاح.',
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error in suggest-saudi-dialect:', error);
    res.status(500).json({ error: 'Failed to analyze dialect', details: error?.message });
  }
});

// Endpoint: 24/7 Live Support & AM Copilot Chat
app.post('/api/ai/chat-support', async (req, res) => {
  try {
    const { messages, userRole = 'Account Manager' } = req.body;

    if (!ai) {
      const lastMsg = messages?.[messages.length - 1]?.text || '';
      return res.json({
        reply: `أهلاً بك! أنا مساعدك الشخصي لإدارة الحسابات والدعم الفني المباشر. استفسارك بخصوص: "${lastMsg.slice(0, 40)}..." تم استلامه. يمكنك دائماً تصدير بياناتك، أو تعديل مراحل العملاء، أو الاستفادة من التنبيهات المجدولة. هل تحتاج لمساعدة في صياغة عرض أو حل مشكلة مع عميل محدد؟`,
        isFallback: true,
      });
    }

    const conversationHistory = (messages || []).map((m: any) => `${m.sender === 'user' ? 'مدير الحساب' : 'المساعد'}: ${m.text}`).join('\n');
    
    const prompt = `أنت المساعد الذكي المباشر المدمج في منصة "أكاونت برو" (AccountPro Copilot & 24/7 Support).
أنت تجمع بين:
1. الدعم الفني الفوري لأي ميزة في المنصة (التنبيهات، تصدير إكسل/بي دي إف، المزامنة، تخصيص المراحل والواجهات، وضع القراءة المريح).
2. مستشار إدارة حسابات خبير (Key Account Management Specialist) يساعد المستخدم على التعامل مع العملاء الغاضبين، وتفاوض الأسعار، وتجديد العقود، وصياغة الرسائل.

كن دقيقاً، لبقاً، مختصراً ومباشراً بدون حشو.

المحادثة الحالية:
${conversationHistory}

الرد المقترح كـ "المساعد":`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      reply: response.text || 'أنا جاهز لمساعدتك في أي وقت.',
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error in chat support:', error);
    res.status(500).json({ error: 'Failed to respond', details: error?.message });
  }
});

// Endpoint: Smart Dual Message Composer (Standard & Short versions based on situation, client state, tone, & gender)
app.post('/api/ai/smart-message-composer', async (req, res) => {
  try {
    const {
      clientName = 'أبو فهد',
      companyName = 'الشركة',
      situation = 'followup',
      clientState = 'normal',
      tone = 'general_saudi',
      gender = 'male',
      serviceOrTaskName = 'الحملات التسويقية',
      attachmentLink = '',
      dueDateTime = '',
      bonusOrOffer = '',
      extraNotes = ''
    } = req.body;

    if (!ai) {
      return res.json({
        standard: `مساك الله بالخير والرضا يا بو ${clientName}، عساك بألف صحة وعافية. بخصوص ${serviceOrTaskName} لـ [${companyName}]، كل الأمور تحت المتابعة والتجهيز وفق أعلى المعايير. ${attachmentLink ? `رابط المعاينة: ${attachmentLink}` : ''} ${extraNotes ? `ملاحظة: ${extraNotes}` : ''} ترانا بالخدمة في أي وقت وفالك التوفيق والنجاح.`,
        short: `يا هلا يا بو ${clientName}، متابعة سريعة لـ ${serviceOrTaskName} لـ [${companyName}] 🚀 ${attachmentLink || ''} ننتظر توجيهك الكريم للانطلاق.`,
        subject: `متابعة وتحديث - ${companyName} - ${serviceOrTaskName}`,
        tips: ['أرسل الرسالة في أوقات العمل الرسمية وتأكد من الرد خلال دقائق لتثبيت انطباع الاحترافية.'],
        isFallback: true,
      });
    }

    const situationLabels: Record<string, string> = {
      confirmation: 'تأكيد (تأكيد استلام ملفات أو موعد أو دفعة)',
      delivery: 'تسليم وإنجاز (تسليم مسودة، مشروع نهائي، إطلاق حملة)',
      followup: 'متابعة وتذكير (متابعة دورية، متابعة عدم رد)',
      approval: 'طلب موافقة واعتماد (اعتماد ميزانية، خطة، تصاميم، عقد)',
      revision: 'تعديل وملاحظات (طلب تعديلات العميل أو تأكيد استلامها)',
      review: 'مراجعة وتدقيق (مراجعة قبل الإطلاق، مراجعة ربع سنوية)',
      renewal: 'تجديد وترقية (تجديد عقد أو ترقية باقة بالأرقام)',
      apology: 'اعتذار وحل مشكلة (تدارك تأخير أو خطأ تقني بمهنية)',
      winback: 'استرجاع عميل قديم (عرض خاص أو فحص مجاني)',
      welcome: 'ترحيب وتهيئة (بداية التعاقد وطلب المتطلبات)',
    };

    const clientStateLabels: Record<string, string> = {
      normal: 'طبيعي ومتعاون',
      urgent: 'عاجل ومستعجل وتحت ضغط وقت عالي',
      delayed_reply: 'متأخر عن الرد ويحتاج تحفيزاً وتذكيراً لطيفاً غير محرج',
      satisfied: 'راضي وفخور بالنتائج ومتحمس للخطوة القادمة',
      hesitant: 'متردد ومحتاط ويحتاج طمأنة وتوضيح بالأرقام والضمانات',
      objecting: 'معترض أو لديه عتاب وملاحظات تتطلب امتصاصاً راقياً وتأكيد الحل',
    };

    const toneLabels: Record<string, string> = {
      executive_royal: 'رسمي فخم ورفيع (سعادة الأستاذ/ة، تقدير كريم، عبارات مؤسسية فخمة)',
      friendly_warm: 'ودي أخوي دافئ وقريب (يا غالي، يا بعدي، بدون تكلف ورسميات جافة)',
      direct_concise: 'مباشر وسريع ومحدد بدون مقدمات حشوية',
      marketing_numbers: 'تسويقي مركز على الأرقام والنمو والـ ROI ومعدلات التحويل',
      najdi: 'لهجة نجدية أصيلة (سم وأبشر، عساك مروق، يا بعدي، فالك التوفيق)',
      hijazi: 'لهجة حجازية رايقة (يا سيدي، يسعد مساك، ربي يبارك لك، أبشر بعزك)',
      general_saudi: 'لهجة سعودية أعمال خليجية عامة دارجة ولبقة في كبرى الوكالات',
    };

    const genderLabels: Record<string, string> = {
      male: 'مذكر (أستاذ / بو فلان / يا غالي)',
      female: 'مؤنث (أستاذة / أم فلان / يا بعدي)',
      neutral: 'محايد أو فريق عمل وشركاء (فريق [الشركة]، شركاءنا الأعزاء)',
    };

    const prompt = `أنت خبير صياغة الرسائل وكبير مديري الحسابات (Lead Account Manager) في وكالة التسويق الرقمي والتطوير "Shal Agency" في السوق السعودي.
المطلوب كتابة رسالة بنسختين محكمتين ودقيقتين (نسخة عادية كاملة + نسخة مختصرة أو قصيرة جداً للواتساب السريع):

معطيات الحالة:
- العميل: ${clientName} (${genderLabels[gender] || gender})
- الشركة/المتجر: ${companyName}
- الموقف/الغرض: ${situationLabels[situation] || situation}
- حالة ونفسية العميل: ${clientStateLabels[clientState] || clientState}
- النبرة والصيغة المطلوبة: ${toneLabels[tone] || tone}
- الخدمة أو المهمة: ${serviceOrTaskName}
${attachmentLink ? `- الرابط المرفق: ${attachmentLink}` : ''}
${dueDateTime ? `- الموعد المستهدف: ${dueDateTime}` : ''}
${bonusOrOffer ? `- العرض أو الهدية/البونص: ${bonusOrOffer}` : ''}
${extraNotes ? `- ملاحظات إضافية: ${extraNotes}` : ''}

قواعد الصياغة:
1. النسخة العادية (standard): رسالة مفصلة، احترافية، فخمة، تشتمل على تحية راقية مناسبة للنبرة، شرح الخطوة وسياق العمل، رابط المعاينة، دعاء لبق، واستعداد للمساعدة.
2. النسخة المختصرة (short): رسالة سريعة من سطر إلى سطرين فقط، قاطعة ومباشرة ومناسبة لرسائل الواتساب السريعة والتنبيهات المباشرة.
3. التوافق التام مع اللهجة والنبرة السعودية المحددة، ومراعاة نفسية العميل (امتصاص الغضب، أو الاستفادة من الرضا، أو حث المتأخر بلباقة).

أخرج النتيجة بصيغة JSON حصراً كالتالي:
{
  "standard": "نص النسخة العادية المفصلة",
  "short": "نص النسخة المختصرة السريعة",
  "subject": "عنوان جذاب للإيميل أو الموضوع",
  "tips": [
    "نصيحة تكتيكية لإرسال هذه الرسالة وضمان أفضل نتيجة",
    "نصيحة ثانية حول التوقيت وطريقة المتابعة"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      standard: parsed.standard || '',
      short: parsed.short || '',
      subject: parsed.subject || `تحديث هام - ${companyName}`,
      tips: parsed.tips || ['تأكد من إرسال الرسالة في الوقت الأنسب للعميل.'],
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error in smart-message-composer:', error);
    res.status(500).json({ error: 'Failed to compose smart message', details: error?.message });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AccountPro server listening on port ${port}`);
  });
}

startServer();
