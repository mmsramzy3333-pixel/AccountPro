import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Glasses, 
  Bell, 
  Volume2, 
  VolumeX, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCcw, 
  ShieldCheck, 
  Palette, 
  Globe, 
  Sliders, 
  Check, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { AppSettings, ThemeMode, AccentColor, AppLanguage } from '../types';
import { getT } from '../utils/translations';
import { downloadBackupJson, restoreBackupJson, resetDemoData, playAlertChime } from '../utils/storage';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onReloadAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onReloadAllData,
}) => {
  const t = getT(settings.language);
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'pipeline' | 'backup'>('general');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    restoreBackupJson(
      file,
      () => {
        setRestoreStatus('تمت استعادة البيانات بنجاح!');
        onReloadAllData();
        if (settings.soundEnabled) playAlertChime('success');
      },
      (err) => {
        setRestoreStatus('خطأ: ' + err);
      }
    );
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط البيانات إلى النماذج التجريبية الافتراضية؟')) {
      resetDemoData();
      onReloadAllData();
      if (settings.soundEnabled) playAlertChime('success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                {t.settings} والتخصيص الشامل
              </h3>
              <p className="text-xs text-slate-500">
                تخصيص الواجهات، التنبيهات الذكية، مراحل دورة العميل، والنسخ الاحتياطي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'general'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            المظهر والحساب
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'notifications'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            التنبيهات الذكية
          </button>

          <button
            onClick={() => setActiveSection('pipeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'pipeline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            مراحل دورة العميل
          </button>

          <button
            onClick={() => setActiveSection('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'backup'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            النسخ الاحتياطي والأمان
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: General & Appearance */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              
              {/* Theme Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  نمط العرض ومظهر الشاشة:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-slate-900 text-white shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">الوضع الليلي (Dark)</div>
                      <div className="text-[10px] text-slate-400">مريح للعين والإضاءة الخافتة</div>
                    </div>
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, theme: 'eye-care' })}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      settings.theme === 'eye-care'
                        ? 'border-amber-600 bg-[#f6f2e9] text-[#2c2720] shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">راحة العين (Sepia)</div>
                      <div className="text-[10px] text-slate-400">درجات دافئة طبيعية للقراءة</div>
                    </div>
                    <Glasses className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-white text-slate-900 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">الوضع النهاري (Light)</div>
                      <div className="text-[10px] text-slate-400">تباين واضح وناصع</div>
                    </div>
                    <Sun className="w-4 h-4 text-amber-500" />
                  </button>
                </div>
              </div>

              {/* Account Manager Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    اسم مدير الحسابات (Account Manager):
                  </label>
                  <input
                    type="text"
                    value={settings.accountManagerName}
                    onChange={(e) => onUpdateSettings({ ...settings, accountManagerName: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    البريد الإلكتروني للعمل:
                  </label>
                  <input
                    type="email"
                    value={settings.accountManagerEmail}
                    onChange={(e) => onUpdateSettings({ ...settings, accountManagerEmail: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Language & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    اللغة الافتراضية للواجهة:
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value as AppLanguage })}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <option value="ar">العربية (Arabic - RTL)</option>
                    <option value="en">English (US)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    العملة الافتراضية للعقود:
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <option value="USD">دولار أمريكي (USD $)</option>
                    <option value="SAR">ريال سعودي (SAR ر.س)</option>
                    <option value="EGP">جنيه مصري (EGP ج.م)</option>
                    <option value="AED">درهم إماراتي (AED د.إ)</option>
                    <option value="EUR">يورو (EUR €)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Smart Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    نغمات التنبيه الصوتية الذكية
                  </div>
                  <div className="text-xs text-slate-500">
                    تشغيل نغمة لطيفة عند إنجاز مهمة أو وصول تنبيه عاجل
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    تنبيهات استحقاق مهام اليوم
                  </div>
                  <div className="text-xs text-slate-500">
                    إظهار إشعار فوري عند وجود مهام ومتابعات مجدولة لليوم
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnDueTasks}
                  onChange={(e) => onUpdateSettings({ ...settings, notifyOnDueTasks: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    تنبيهات اقتراب تجديد العقود
                  </div>
                  <div className="text-xs text-slate-500">
                    تنبيه مسبق قبل انتهاء العقد لضمان بدء مفاوضات التجديد في الوقت المثالي
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnRenewals}
                  onChange={(e) => onUpdateSettings({ ...settings, notifyOnRenewals: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  فترة التنبيه المسبق لتجديد العقد:
                </label>
                <select
                  value={settings.renewalAlertDays}
                  onChange={(e) => onUpdateSettings({ ...settings, renewalAlertDays: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <option value={15}>قبل 15 يوماً من التجديد</option>
                  <option value={30}>قبل 30 يوماً من التجديد (موصى به)</option>
                  <option value={45}>قبل 45 يوماً من التجديد</option>
                  <option value={60}>قبل 60 يوماً من التجديد</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 3: Custom Pipeline Stages */}
          {activeSection === 'pipeline' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                يمكنك تخصيص مسميات مراحل دورة حياة العميل (Pipeline Stages) وفق نموذج عمل شركتك:
              </p>

              {settings.customStages.map((stage, idx) => (
                <div 
                  key={stage.id} 
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3"
                >
                  <span className="text-xs font-bold text-slate-400 w-16">{stage.id}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={stage.labelAr}
                      onChange={(e) => {
                        const updated = [...settings.customStages];
                        updated[idx].labelAr = e.target.value;
                        onUpdateSettings({ ...settings, customStages: updated });
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-800"
                      placeholder="المسمى بالعربية"
                    />
                    <input
                      type="text"
                      value={stage.labelEn}
                      onChange={(e) => {
                        const updated = [...settings.customStages];
                        updated[idx].labelEn = e.target.value;
                        onUpdateSettings({ ...settings, customStages: updated });
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-800"
                      placeholder="Label in English"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Cloud Backup & Security */}
          {activeSection === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    أمان وتشفير البيانات (AES-256)
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                    جميع بيانات الحسابات، جهات الاتصال، وأرقام العقود محفوظة ومحمية محلياً وسحابياً بأعلى معايير الخصوصية.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={downloadBackupJson}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-right transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      تنزيل نسخة احتياطية (JSON)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      تصدير كافة العملاء والمهام والإعدادات بملف مشفر
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </button>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-right transition-all flex items-center justify-between group cursor-pointer">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      استرجاع نسخة احتياطية
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      رفع ملف نسخة سابقة واستعادة البيانات فوراً
                    </div>
                  </div>
                  <Upload className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>

              {restoreStatus && (
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold text-center">
                  {restoreStatus}
                </div>
              )}

              {/* Reset to Demo Data */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                    إعادة ضبط البيانات التجريبية
                  </div>
                  <div className="text-[11px] text-slate-400">
                    يعيد تحميل النماذج التجريبية للعملاء والمهام في حال أردت البدء من جديد
                  </div>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 transition-colors"
                >
                  إعادة ضبط
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            تم الحفظ
          </button>
        </div>
      </div>
    </div>
  );
};
