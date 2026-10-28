export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type ClientStage = 'lead' | 'onboarding' | 'active' | 'renewal' | 'at-risk' | 'closed';

export type TaskType = 'follow_up' | 'meeting' | 'renewal_talk' | 'issue_resolution' | 'report_review' | 'general';

export interface ContactPerson {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  createdBy?: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  industry: string;
  stage: ClientStage;
  healthScore: number; // 0 to 100
  annualValue: number; // MRR * 12 or contract value
  currency: string;
  primaryContact: ContactPerson;
  secondaryContacts?: ContactPerson[];
  renewalDate: string; // YYYY-MM-DD
  lastContactDate: string; // YYYY-MM-DD
  nextFollowUpDate: string; // YYYY-MM-DD
  tags: string[];
  notes: string;
  activities: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  type: TaskType;
  completed: boolean;
  completedAt?: string;
  reminderMinutesBefore?: number;
  isStarred?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'renewal' | 'follow_up' | 'system';
  linkId?: string;
}

export type ThemeMode = 'light' | 'dark' | 'eye-care';
export type AccentColor = 'blue' | 'emerald' | 'purple' | 'amber';
export type AppLanguage = 'ar' | 'en' | 'fr';

export type DashboardTheme = 'default' | 'midnight' | 'desert_gold' | 'emerald' | 'indigo_purple';

export type NavTab = 
  | 'dashboard' 
  | 'shal-studio' 
  | 'retention-funnel' 
  | 'clients' 
  | 'tasks' 
  | 'reports' 
  | 'templates' 
  | 'dictionary';

export type ShalServiceCategory = 'mobile_web' | 'media_creative' | 'marketing_growth' | 'strategy_optimization';

export interface ShalService {
  id: string;
  nameEn: string;
  nameAr: string;
  category: ShalServiceCategory;
  categoryLabelAr: string;
  tagline: string;
  description: string;
  saudiBusinessBenefit: string;
  targetAudience: string;
  pastClientWinBackHook: string;
  renewalHook: string;
  upsellHook: string;
  typicalDeliverables: string[];
  suggestedKpis: string[];
}

export type MessageTone = 'warm_friendly' | 'smart_data' | 'indirect_consultative' | 'vip_promotional' | 'urgent_gentle';
export type SaudiDialectSubtype = 'general_saudi' | 'najdi' | 'hijazi' | 'sharqawi' | 'formal_saudi_business';
export type ClientReengagementType = 'past_client' | 'contract_expiring' | 'package_upgrade' | 'new_collaboration';

export interface RetentionStage {
  id: 'triage_audit' | 'warm_outreach' | 'contract_renewal' | 'loyalty_shield';
  stepNumber: number;
  titleAr: string;
  subtitleAr: string;
  objectiveAr: string;
  tactics: {
    id: string;
    title: string;
    approach: 'emotional' | 'smart_data' | 'indirect_consultative' | 'vip_promotional';
    description: string;
    saudiDialectScript: string;
    actionableStep: string;
  }[];
  checklists: string[];
  kpis: string[];
}

export interface RetentionLesson {
  id: string;
  stageId: string;
  title: string;
  readTime: string;
  level: 'مبتدئ' | 'متقدم' | 'استراتيجي';
  summary: string;
  corePrinciples: string[];
  saudiMarketNuance: string;
  practicalScenario: {
    clientType: string;
    challenge: string;
    winningApproach: string;
    sampleConversation: { speaker: string; text: string }[];
  };
  objectionsAndAnswers: { objection: string; recommendedResponse: string }[];
}

export interface SaudiDictionaryEntry {
  id: string;
  letter: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  context: 'courtesy' | 'appreciation' | 'urgency' | 'agreement' | 'marketing' | 'apology' | 'greeting' | 'general';
  contextLabel: string;
  chatExample: string;
  chatTip: string;
  isCommonInBusiness: boolean;
  tags: string[];
  region?: 'najdi' | 'hijazi' | 'sharqawi' | 'janoubi' | 'general';
  equivalentInEgyptian?: string;
  equivalentInLevantine?: string;
}

export type DashboardWidgetId = 
  | 'ai_briefing'
  | 'ai_prioritization'
  | 'metrics'
  | 'today_tasks'
  | 'quick_daily_report'
  | 'saudi_templates'
  | 'renewals'
  | 'at_risk'
  | 'quick_actions';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  labelAr: string;
  labelEn: string;
  enabled: boolean;
  order: number;
}

export type TemplateGender = 'male' | 'female' | 'neutral';

export type TemplateSituation = 
  | 'morning'
  | 'evening'
  | 'start_of_day'
  | 'start_of_work'
  | 'end_of_day'
  | 'end_of_work'
  | 'welcome'
  | 'activation'
  | 'meeting_request'
  | 'approval_request'
  | 'confirmation'
  | 'delivery'
  | 'followup'
  | 'approval'
  | 'revision'
  | 'review'
  | 'winback'
  | 'report'
  | 'renewal'
  | 'apology'
  | 'general';

export type SmartMessageSituation = 
  | 'confirmation'
  | 'delivery'
  | 'followup'
  | 'approval'
  | 'revision'
  | 'review'
  | 'renewal'
  | 'apology'
  | 'winback'
  | 'welcome';

export type SmartMessageClientState = 
  | 'normal'        // طبيعي ومتعاون
  | 'urgent'        // عاجل ومستعجل
  | 'delayed_reply' // متأخر عن الرد
  | 'satisfied'     // راضي وفخور
  | 'hesitant'      // متردد ومحتاط
  | 'objecting';    // معترض أو متطلب

export type SmartMessageTone = 
  | 'executive_royal'    // رسمي فخم رفيع
  | 'friendly_warm'      // ودي أخوي دافئ
  | 'direct_concise'     // مباشر ومختصر وسريع
  | 'marketing_numbers'  // تسويقي بالأرقام والـ ROI
  | 'najdi'              // نجدي أصيل
  | 'hijazi'             // حجازي رايق
  | 'general_saudi';     // سعودي عام

export interface GeneratedDualMessage {
  standard: string;       // النسخة العادية (المفصلة والكاملة)
  short: string;          // النسخة المختصرة (السريعة للواتساب)
  subject?: string;       // عنوان مقترح للإيميل أو التنبيه
  tips?: string[];        // نصيحة سريعة لإرسال الرسالة
}

export type WinBackApproach = 
  | 'smart_indirect'
  | 'emotional_warmth'
  | 'value_audit'
  | 'promotional_pilot'
  | 'past_success'
  | 'seasonal_event'
  | 'agency_upgrade';

export interface WinBackHook {
  id: string;
  title: string;
  approach: WinBackApproach;
  approachBadge: string;
  situationContext: string;
  psychologicalTrigger: string;
  timingAdvice: string;
  messages: {
    male: string;
    female: string;
    neutral: string;
  };
  clientResponsesAndHandling: {
    ifClientSays: string;
    suggestedReply: string;
    tacticNote: string;
  }[];
  goldenRule: string;
}

export interface SaudiTemplate {
  id: string;
  title: string;
  category: 'welcome' | 'checkin' | 'renewal' | 'apology' | 'report' | 'reminder' | 'winback' | 'confirmation' | 'delivery' | 'followup' | 'approval' | 'revision' | 'review' | string;
  situation?: TemplateSituation;
  gender?: TemplateGender;
  message: string;
  shortMessage?: string;
  tone?: string;
  pinned?: boolean;
  tags?: string[];
  lastUsedAt?: string;
}

export interface AIPrioritizedTaskItem {
  taskId: string;
  taskTitle: string;
  clientName?: string;
  suggestedTimeSlot: string; // e.g. "09:30 - 10:15"
  reasoning: string;
  impactScore: number; // 0 to 100
  urgencyLevel: 'critical' | 'high' | 'medium';
  suggestedAction: string;
}

export interface AIPrioritizationResult {
  strategySummary: string;
  focusRationale: string;
  scheduledTasks: AIPrioritizedTaskItem[];
  generatedAt: string;
}

export interface AppSettings {
  language: AppLanguage;
  theme: ThemeMode;
  accentColor: AccentColor;
  dashboardTheme: DashboardTheme;
  currency: string;
  accountManagerName: string;
  accountManagerEmail: string;
  autoCloudSync: boolean;
  soundEnabled: boolean;
  notifyOnDueTasks: boolean;
  notifyOnRenewals: boolean;
  renewalAlertDays: number;
  customStages: { id: ClientStage; labelAr: string; labelEn: string; color: string }[];
  dashboardWidgets: DashboardWidgetConfig[];
}
