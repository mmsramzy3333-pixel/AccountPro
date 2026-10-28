import { Client, Task } from '../types';

export type ClientHealthStatus = 'active' | 'dormant' | 'at-risk';

export interface ClientHealthReport {
  score: number; // 0 - 100
  status: ClientHealthStatus;
  statusLabelAr: string; // 'نشط' | 'خامل' | 'في خطر'
  nameColorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  dotColorClass: string;
  
  // Breakdown
  recencyScore: number; // 0 - 100
  recencyWeight: number; // 35%
  daysSinceLastContact: number;
  lastContactText: string;
  
  activityScore: number; // 0 - 100
  activityWeight: number; // 35%
  activityCount: number;
  
  tasksScore: number; // 0 - 100
  tasksWeight: number; // 30%
  completedTasksCount: number;
  totalTasksCount: number;
  
  recommendation: string;
}

export function calculateClientHealth(client: Client, allTasks: Task[] = []): ClientHealthReport {
  // 1. Calculate days since last contact
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysSinceLastContact = 999;
  let lastContactDateStr = client.lastContactDate || client.updatedAt;

  if (lastContactDateStr) {
    const contactDate = new Date(lastContactDateStr);
    if (!isNaN(contactDate.getTime())) {
      const diffMs = today.getTime() - contactDate.getTime();
      daysSinceLastContact = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  // Recency Score (0 - 100)
  let recencyScore = 15;
  let lastContactText = 'لم يتم التواصل بعد';
  if (daysSinceLastContact === 0) {
    recencyScore = 100;
    lastContactText = 'تواصل اليوم';
  } else if (daysSinceLastContact <= 3) {
    recencyScore = 95;
    lastContactText = `منذ ${daysSinceLastContact} أيام`;
  } else if (daysSinceLastContact <= 7) {
    recencyScore = 80;
    lastContactText = `منذ ${daysSinceLastContact} أيام`;
  } else if (daysSinceLastContact <= 14) {
    recencyScore = 60;
    lastContactText = `منذ أسبوعين (${daysSinceLastContact} يوم)`;
  } else if (daysSinceLastContact <= 30) {
    recencyScore = 35;
    lastContactText = `منذ شهر (${daysSinceLastContact} يوم)`;
  } else if (daysSinceLastContact < 999) {
    recencyScore = 15;
    lastContactText = `أكثر من شهر (${daysSinceLastContact} يوم)`;
  }

  // 2. Activity Volume (0 - 100)
  const activities = client.activities || [];
  const activityCount = activities.length;
  let activityScore = 20;

  if (activityCount >= 8) {
    activityScore = 100;
  } else if (activityCount >= 5) {
    activityScore = 85;
  } else if (activityCount >= 3) {
    activityScore = 70;
  } else if (activityCount >= 1) {
    activityScore = 50;
  } else {
    activityScore = 20;
  }

  // 3. Completed Tasks Volume & Velocity (0 - 100)
  const clientTasks = allTasks.filter(t => t.clientId === client.id);
  const totalTasksCount = clientTasks.length;
  const completedTasksCount = clientTasks.filter(t => t.completed).length;

  let tasksScore = 50; // default if no tasks assigned yet
  if (totalTasksCount > 0) {
    const ratio = completedTasksCount / totalTasksCount;
    if (ratio >= 0.8 && completedTasksCount >= 2) {
      tasksScore = 100;
    } else if (ratio >= 0.6) {
      tasksScore = 80;
    } else if (ratio >= 0.3 || completedTasksCount >= 1) {
      tasksScore = 60;
    } else {
      tasksScore = 30;
    }
  } else {
    // If no specific tasks, inherit part of client.healthScore or stage
    if (client.stage === 'active') tasksScore = 75;
    else if (client.stage === 'renewal') tasksScore = 65;
    else if (client.stage === 'at-risk') tasksScore = 30;
  }

  // Weighted Total Score
  const rawScore = (recencyScore * 0.35) + (activityScore * 0.35) + (tasksScore * 0.30);
  const score = Math.max(5, Math.min(100, Math.round(rawScore)));

  // Health Classification
  let status: ClientHealthStatus = 'active';
  let statusLabelAr = 'نشط';
  let nameColorClass = 'text-emerald-700 dark:text-emerald-400 font-extrabold';
  let badgeBgClass = 'bg-emerald-50 dark:bg-emerald-950/60';
  let badgeTextClass = 'text-emerald-700 dark:text-emerald-300';
  let badgeBorderClass = 'border-emerald-200 dark:border-emerald-800';
  let dotColorClass = 'bg-emerald-500';

  if (score < 45) {
    status = 'at-risk';
    statusLabelAr = 'في خطر';
    nameColorClass = 'text-rose-700 dark:text-rose-400 font-extrabold';
    badgeBgClass = 'bg-rose-50 dark:bg-rose-950/60';
    badgeTextClass = 'text-rose-700 dark:text-rose-300';
    badgeBorderClass = 'border-rose-200 dark:border-rose-800';
    dotColorClass = 'bg-rose-500';
  } else if (score < 70) {
    status = 'dormant';
    statusLabelAr = 'خامل';
    nameColorClass = 'text-amber-700 dark:text-amber-400 font-extrabold';
    badgeBgClass = 'bg-amber-50 dark:bg-amber-950/60';
    badgeTextClass = 'text-amber-700 dark:text-amber-300';
    badgeBorderClass = 'border-amber-200 dark:border-amber-800';
    dotColorClass = 'bg-amber-500';
  }

  // Actionable Recommendation
  let recommendation = '';
  if (status === 'at-risk') {
    if (daysSinceLastContact > 14) {
      recommendation = `انقطاع التواصل منذ ${daysSinceLastContact} يوماً! يُوصى بجدولة مكالمة طارئة مع ${client.primaryContact?.name || 'العميل'} واستخدام نموذج استرجاع أو اعتذار فوري.`;
    } else if (tasksScore <= 40) {
      recommendation = 'تراكم المهام المعلقة دون إنجاز يهدد استقرار العقد! يجب إنجاز المهام الحرجة وتحديث العميل بالنتائج فوراً.';
    } else {
      recommendation = 'حساب في مرحلة حرجة. يُوصى بتدخل مدير الحسابات وتقديم ميزة إضافية مجانية لإنعاش العلاقة وبناء الثقة.';
    }
  } else if (status === 'dormant') {
    if (daysSinceLastContact > 7) {
      recommendation = `مضى ${daysSinceLastContact} أيام دون تواصل دوري. أرسل رسالة سريعة عبر الواتساب للاطمئنان ومشاركة تحديث خفيف حول الأداء.`;
    } else if (activityCount < 3) {
      recommendation = 'سجل التفاعل خامل نسبياً؛ احرص على توثيق المكالمات والملاحظات وتحديد موعد اجتماع أسبوعي قادم.';
    } else {
      recommendation = 'الحساب مستقر لكن يحتاج تفعيلاً استباقياً لضمان تجديد العقد السنوي في موعده.';
    }
  } else {
    recommendation = 'الحساب في أفضل حالات النشاط والتفاعل 🚀 فرصة ممتازة لاقتراح خدمات جديدة (Upsell) أو طلب تقييم وتوصية لشريك آخر.';
  }

  return {
    score,
    status,
    statusLabelAr,
    nameColorClass,
    badgeBgClass,
    badgeTextClass,
    badgeBorderClass,
    dotColorClass,
    recencyScore,
    recencyWeight: 35,
    daysSinceLastContact,
    lastContactText,
    activityScore,
    activityWeight: 35,
    activityCount,
    tasksScore,
    tasksWeight: 30,
    completedTasksCount,
    totalTasksCount,
    recommendation,
  };
}
