import { dialectComparisons, saudiPhoneticRules, initialSaudiDictionaryEntries } from './saudiDictionaryData';

export interface DialectSuggestion {
  id: string;
  originalPhrase: string;
  suggestedPhrase: string;
  reason: string;
  category: 'politeness' | 'slang' | 'spelling' | 'tone' | 'agency';
  confidence: 'high' | 'medium';
}

export interface DialectAnalysisResult {
  originalText: string;
  enhancedText: string;
  suggestions: DialectSuggestion[];
  score: number; // 0 to 100
  summary: string;
}

// Common non-Saudi or overly formal phrases paired with their authentic Saudi replacements
const dialectReplacementRules: {
  pattern: RegExp;
  originalText: string;
  suggestedText: string;
  reason: string;
  category: DialectSuggestion['category'];
}[] = [
  // Egyptian / Levantine / Overly formal polite words -> Saudi polite words
  {
    pattern: /لو سمحت(ي)?/gi,
    originalText: 'لو سمحت',
    suggestedText: 'لاهنت',
    reason: 'كلمة "لاهنت" هي الكلمة الملكية والأكثر قبولاً في الثقافة والبيئة السعودية للطلب بلباقة.',
    category: 'politeness',
  },
  {
    pattern: /من فضلك/gi,
    originalText: 'من فضلك',
    suggestedText: 'إذا ما عليك كلافة',
    reason: '"إذا ما عليك كلافة" أو "لاهنت" تعطي طلباً غاية في اللطف دون رسميات جافة.',
    category: 'politeness',
  },
  {
    pattern: /من بعد إذنك/gi,
    originalText: 'من بعد إذنك',
    suggestedText: 'إذا ما عليك أمر',
    reason: '"إذا ما عليك أمر" أو "لاهنت" هي العبارة الدارجة في الشات السعودي المهني.',
    category: 'politeness',
  },
  {
    pattern: /حاضر من عيوني/gi,
    originalText: 'حاضر من عيوني',
    suggestedText: 'أبشر بعزك وعلى هالخشم',
    reason: '"أبشر بعزك" أو "على هالخشم" هي الاستجابة السعودية السحرية التي تريح العميل فوراً.',
    category: 'politeness',
  },
  {
    pattern: /تكرم عينك/gi,
    originalText: 'تكرم عينك',
    suggestedText: 'أبشر بعزك وما يصير خاطرك إلا طيب',
    reason: '"أبشر بعزك" تعطي شعوراً أصيلاً بالفأل والشهامة وسرعة التنفيذ.',
    category: 'politeness',
  },
  {
    pattern: /إيه رأيك/gi,
    originalText: 'إيه رأيك',
    suggestedText: 'وش رايك',
    reason: '"وش رايك يا غالي" هي الأسلوب المعتمد لاستشارة العميل السعودي دون فرض الرأي.',
    category: 'slang',
  },
  {
    pattern: /شو رأيك/gi,
    originalText: 'شو رأيك',
    suggestedText: 'وش رايك',
    reason: '"وش رايك" تخلق شعوراً بالشراكة واستطلاع الرأي باحترام.',
    category: 'slang',
  },
  {
    pattern: /عايز(ين)?/gi,
    originalText: 'عايز',
    suggestedText: 'ودنا',
    reason: 'استبدل "عايز" بـ "ودنا" أو "نبي" لتبدو رغبة لطيفة ومحببة في الشات.',
    category: 'slang',
  },
  {
    pattern: /بدنا/gi,
    originalText: 'بدنا',
    suggestedText: 'ودنا نطلب منك',
    reason: '"ودنا" تعبر عن الطلب المهذب بروح الفريق الواحد.',
    category: 'slang',
  },
  {
    pattern: /دلوقتي( حالا)?/gi,
    originalText: 'دلوقتي',
    suggestedText: 'الحين فوراً',
    reason: '"الحين" هي الكلمة الشائعة في الرياض والمملكة للتعبير عن اللحظة الراهنة.',
    category: 'slang',
  },
  {
    pattern: /هلق( فوراً)?/gi,
    originalText: 'هلق',
    suggestedText: 'الحين',
    reason: '"الحين" أو "دحين" للسرعة والوقت الحالي.',
    category: 'slang',
  },
  {
    pattern: /معلش حقك عليا/gi,
    originalText: 'معلش حقك عليا',
    suggestedText: 'أبد حقك علينا وما يصير خاطرك إلا طيب',
    reason: 'هذه العبارة الذهبية تمتص 95% من حدة أي انزعاج أو خطأ لدى العميل السعودي فوراً.',
    category: 'politeness',
  },
  {
    pattern: /متزعلش نفسك/gi,
    originalText: 'متزعلش نفسك',
    suggestedText: 'وسّع صدرك ولا تشيل هم',
    reason: '"وسّع صدرك ولا تشيل هم" تهدئ النفس وتزيل أي توتر.',
    category: 'tone',
  },
  {
    pattern: /لا تاكل هم/gi,
    originalText: 'لا تاكل هم',
    suggestedText: 'لا تشيل هم أبداً وازهلها',
    reason: '"لا تشيل هم وازهلها" تمنح طمأنينة مطلقة ومسؤولية تامة.',
    category: 'tone',
  },
  {
    pattern: /متقلقش خالص/gi,
    originalText: 'متقلقش خالص',
    suggestedText: 'ازهلها وكل الأمور طيبة',
    reason: '"ازهلها" تعني اترك الموضوع علي بالكامل ولا تقلق.',
    category: 'tone',
  },
  {
    pattern: /يا باشا/gi,
    originalText: 'يا باشا',
    suggestedText: 'يا بو [الاسم]',
    reason: 'تجنب "يا باشا" في بيئة الأعمال السعودية واستبدلها بالكنية "يا بو فهد" أو "يا غالي".',
    category: 'tone',
  },
  {
    pattern: /يا فندم/gi,
    originalText: 'يا فندم',
    suggestedText: 'طال عمرك / يا غالي',
    reason: 'المناداة بـ "طال عمرك" أو "يا بعدي" أو "يا غالي" أقرب لروح الأعمال الخليجية.',
    category: 'tone',
  },
  {
    pattern: /يا بيه/gi,
    originalText: 'يا بيه',
    suggestedText: 'يا بو [الاسم]',
    reason: 'النداء بالكنية هو أصل التكريم والتقدير.',
    category: 'tone',
  },
  {
    pattern: /تمام وزي الفل/gi,
    originalText: 'تمام وزي الفل',
    suggestedText: 'مضبوط بالمللي وكل الأمور تفتح النفس',
    reason: '"مضبوط بالمللي وتفتح النفس" تعطي طابعاً احترافياً إيجابياً مبهراً.',
    category: 'agency',
  },
  {
    pattern: /ألف شكر وتسلم إيدك/gi,
    originalText: 'ألف شكر وتسلم إيدك',
    suggestedText: 'بيض الله وجهك وما قصرت وعساك عالقوة',
    reason: '"بيض الله وجهك وعساك عالقوة" هي أرقى عبارة شكر وتقدير متبادل.',
    category: 'politeness',
  },
  {
    pattern: /شكرن/gi,
    originalText: 'شكرن',
    suggestedText: 'شكراً جزيلاً',
    reason: 'تصحيح إملائي: كتابة التنوين نوناً خطأ شائع يقلل من هيبة الأكاونت مانجر.',
    category: 'spelling',
  },
  {
    pattern: /جدن/gi,
    originalText: 'جدن',
    suggestedText: 'جداً / بالحيل',
    reason: 'تصحيح إملائي: التنوين الصحيح بدلاً من النون.',
    category: 'spelling',
  },
  {
    pattern: /مظبوط/gi,
    originalText: 'مظبوط',
    suggestedText: 'مضبوط',
    reason: 'تصحيح إملائي: كتابة مضبوط بحرف الضاد وليس بالظاء.',
    category: 'spelling',
  },
  {
    pattern: /أرسل لي/gi,
    originalText: 'أرسل لي',
    suggestedText: 'لاهنت ودنا ترسل لنا',
    reason: 'تحويل صيغة الأمر المباشرة إلى طلب لبق بروح الفريق.',
    category: 'politeness',
  },
  {
    pattern: /عايزين نتقابل/gi,
    originalText: 'عايزين نتقابل',
    suggestedText: 'ودنا بمكالمة سريعة ربع ساعة',
    reason: 'تحديد وقت المكالمة (ربع ساعة) يعطي راحة للعميل ويشجعه على الموافقة.',
    category: 'agency',
  },
  {
    pattern: /بتاعنا|بتاعكم|بتاع/gi,
    originalText: 'بتاع',
    suggestedText: 'حقنا / حقكم',
    reason: 'استخدم "حق" للتعبير عن النسبة والملكية في اللهجة السعودية (الملف حقنا، الرابط حق الحملة).',
    category: 'slang',
  },
  {
    pattern: /تبعنا|تبعكم|تبع/gi,
    originalText: 'تبع',
    suggestedText: 'حقنا / حق',
    reason: 'استبدل "تبع" بـ "حق" لتكون الرسالة أكثر أصالة ومحلية.',
    category: 'slang',
  },
  {
    pattern: /كتير/gi,
    originalText: 'كتير',
    suggestedText: 'بالحيل / واجد',
    reason: '"بالحيل" أو "مرة" أو "واجد" للتعبير عن الكثرة والشدة.',
    category: 'slang',
  },
  {
    pattern: /أوي/gi,
    originalText: 'أوي',
    suggestedText: 'مرة / بالحيل',
    reason: '"مرة" و"بالحيل" أكثر ملائمة للهجة السعودية.',
    category: 'slang',
  },
  {
    pattern: /سوف نبدأ|سنبدأ/gi,
    originalText: 'سوف نبدأ',
    suggestedText: 'بنبدأ سوا',
    reason: 'الباء الاستقبالية ("بنبدأ"، "بنطلق") أكثر حيوية وقرباً في الشات من "سوف".',
    category: 'slang',
  },
];

/**
 * Analyzes draft message and produces dialect suggestions and an enhanced version
 */
export function analyzeAndSuggestDialect(text: string): DialectAnalysisResult {
  if (!text || !text.trim()) {
    return {
      originalText: text,
      enhancedText: text,
      suggestions: [],
      score: 100,
      summary: 'النص فارغ، ابدأ بكتابة رسالتك لمعاينتها.',
    };
  }

  const suggestions: DialectSuggestion[] = [];
  let enhancedText = text;
  let suggestionIndex = 0;

  for (const rule of dialectReplacementRules) {
    if (rule.pattern.test(enhancedText)) {
      suggestionIndex++;
      suggestions.push({
        id: `sug-${suggestionIndex}`,
        originalPhrase: rule.originalText,
        suggestedPhrase: rule.suggestedText,
        reason: rule.reason,
        category: rule.category,
        confidence: 'high',
      });

      // Replace in enhancedText
      enhancedText = enhancedText.replace(rule.pattern, rule.suggestedText);
    }
  }

  // Calculate Saudi dialect score (100 minus penalty for non-Saudi or rough words)
  let score = 100 - suggestions.length * 15;
  if (score < 40) score = 40;

  // Bonus for presence of authentic Saudi markers
  const saudiMarkers = ['أبشر', 'لاهنت', 'ما قصرت', 'يا بعدي', 'بيض الله وجهك', 'مضبوط', 'عساك', 'ودنا', 'يا بو', 'تفتح النفس', 'بالخدمة'];
  let bonus = 0;
  for (const marker of saudiMarkers) {
    if (enhancedText.includes(marker)) bonus += 5;
  }
  score = Math.min(100, score + bonus);

  let summary = 'نص ممتاز وقريب جداً من اللهجة الخليجية السعودية!';
  if (suggestions.length > 3) {
    summary = `تم رصد ${suggestions.length} فرص لتحسين النص ليصبح باللهجة السعودية العفوية والمهنية.`;
  } else if (suggestions.length > 0) {
    summary = `تم رصد ${suggestions.length} اقتراحات ذكية لجعل الخطاب أكثر لباقة وأقرب للعميل السعودي.`;
  }

  return {
    originalText: text,
    enhancedText,
    suggestions,
    score,
    summary,
  };
}
