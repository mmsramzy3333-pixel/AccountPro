import React, { useState } from 'react';
import { 
  X, 
  Layout, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Palette, 
  Sliders,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { AppSettings, DashboardWidgetConfig, DashboardTheme } from '../types';
import { defaultDashboardWidgets, playAlertChime } from '../utils/storage';

interface DashboardCustomizeModalProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    const existing = settings.dashboardWidgets || defaultDashboardWidgets;
    const existingIds = new Set(existing.map(w => w.id));
    const merged = [...existing];
    for (const def of defaultDashboardWidgets) {
      if (!existingIds.has(def.id)) {
        merged.push({ ...def, order: merged.length + 1 });
      }
    }
    return merged.sort((a, b) => a.order - b.order);
  });
  const [theme, setTheme] = useState<DashboardTheme>(settings.dashboardTheme || 'default');

  const themes: { id: DashboardTheme; nameAr: string; desc: string; previewBg: string; border: string }[] = [
    { 
      id: 'default', 
      nameAr: 'الأزرق المؤسسي الكلاسيكي', 
      desc: 'أزرق هادئ وأنيق للأعمال والمحفظة', 
      previewBg: 'from-blue-600 to-indigo-700',
      border: 'border-blue-500' 
    },
    { 
      id: 'desert_gold', 
      nameAr: 'الذهبي الملكي الصحراوي 🇸🇦', 
      desc: 'درجات الذهب والرمال الملكية الفخمة', 
      previewBg: 'from-amber-600 via-yellow-600 to-stone-900',
      border: 'border-amber-500' 
    },
    { 
      id: 'midnight', 
      nameAr: 'منتصف الليل التقني (Midnight)', 
      desc: 'سواد داكن مع لمسات زرقاء ساطعة', 
      previewBg: 'from-slate-950 via-slate-900 to-cyan-900',
      border: 'border-cyan-500' 
    },
    { 
      id: 'emerald', 
      nameAr: 'الأخضر الزمردي (Emerald)', 
      desc: 'طابع الشراكات والنمو المالي والازدهار', 
      previewBg: 'from-emerald-700 via-teal-700 to-slate-900',
      border: 'border-emerald-500' 
    },
    { 
      id: 'indigo_purple', 
      nameAr: 'البنفسجي الإبداعي (Indigo Violet)', 
      desc: 'عصري وحديث للفرق والشركات الرقمية', 
      previewBg: 'from-purple-700 via-indigo-700 to-slate-900',
      border: 'border-purple-500' 
    },
  ];

  // Move widget up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...widgets];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    // Re-assign order numbers
    const updated = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWidgets(updated);
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Move widget down
  const handleMoveDown = (index: number) => {
    if (index >= widgets.length - 1) return;
    const next = [...widgets];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    // Re-assign order numbers
    const updated = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWidgets(updated);
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Toggle widget enable/disable
  const handleToggleWidget = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    setWidgets(updated);
  };

  // Reset to default
  const handleResetToDefault = () => {
    setWidgets(defaultDashboardWidgets);
    setTheme('default');
    if (settings.soundEnabled) playAlertChime('click');
  };

  // Save changes
  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      dashboardWidgets: widgets,
      dashboardTheme: theme,
    });
    if (settings.soundEnabled) playAlertChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 eye-care:bg-[#f6f2e9]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                تخصيص لوحة التحكم المركزية (Dashboard Customization)
              </h3>
              <p className="text-xs text-slate-500">
                إظهار وإخفاء الأقسام، إعادة ترتيبها، واختيار النمط البصري المفضل
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Visual Theme Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>النمط البصري العام للوحة التحكم (Dashboard Theme):</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map(th => (
                <div
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    theme === th.id
                      ? `${th.border} ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-slate-800 shadow-xs`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${th.previewBg} shadow-xs shrink-0 flex items-center justify-center text-white`}>
                    {theme === th.id && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {th.nameAr}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {th.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widgets List & Rearranging */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <span>ترتيب وتفعيل الأقسام والمعلومات (Widgets Order & Visibility):</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  استخدم الأسهم لتغيير الترتيب، أو المفتاح للتحكم في ظهور القسم
                </p>
              </div>

              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط الترتيب</span>
              </button>
            </div>

            <div className="space-y-2">
              {widgets.map((widget, idx) => (
                <div
                  key={widget.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    widget.enabled
                      ? 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                      : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center shadow-2xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {widget.labelAr}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {widget.labelEn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle visibility */}
                    <button
                      onClick={() => handleToggleWidget(widget.id)}
                      title={widget.enabled ? 'إخفاء القسم' : 'إظهار القسم'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        widget.enabled
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                          : 'text-slate-400 bg-slate-200/60 dark:bg-slate-800'
                      }`}
                    >
                      {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      title="تحريك لأعلى"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === widgets.length - 1}
                      title="تحريك لأسفل"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            حفظ وتطبيق التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};
