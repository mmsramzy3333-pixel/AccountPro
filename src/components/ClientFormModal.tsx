import React, { useState } from 'react';
import { X, Building2, User, Phone, Mail, DollarSign, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { Client, ClientStage, AppSettings } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface ClientFormModalProps {
  client?: Client;
  settings: AppSettings;
  onSave: (client: Client) => void;
  onClose: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  client,
  settings,
  onSave,
  onClose,
}) => {
  const t = getT(settings.language);

  const [name, setName] = useState(client?.name || '');
  const [companyName, setCompanyName] = useState(client?.companyName || '');
  const [industry, setIndustry] = useState(client?.industry || 'التقنية والبرمجيات');
  const [stage, setStage] = useState<ClientStage>(client?.stage || 'active');
  const [healthScore, setHealthScore] = useState<number>(client?.healthScore ?? 85);
  const [annualValue, setAnnualValue] = useState<number>(client?.annualValue ?? 50000);
  const [contactName, setContactName] = useState(client?.primaryContact?.name || '');
  const [contactRole, setContactRole] = useState(client?.primaryContact?.role || '');
  const [contactEmail, setContactEmail] = useState(client?.primaryContact?.email || '');
  const [contactPhone, setContactPhone] = useState(client?.primaryContact?.phone || '');
  const [renewalDate, setRenewalDate] = useState(client?.renewalDate || '2026-12-31');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(client?.nextFollowUpDate || new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string>(client?.tags?.join(', ') || 'عميل رئيسي');
  const [notes, setNotes] = useState(client?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedClient: Client = {
      id: client?.id || 'client-' + Date.now(),
      name: name.trim(),
      companyName: companyName.trim() || name.trim(),
      industry: industry.trim(),
      stage,
      healthScore: Number(healthScore),
      annualValue: Number(annualValue),
      currency: settings.currency,
      primaryContact: {
        name: contactName.trim() || 'المسؤول الرئيسي',
        role: contactRole.trim() || 'مدير الحساب',
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        isPrimary: true,
      },
      secondaryContacts: client?.secondaryContacts || [],
      renewalDate,
      lastContactDate: client?.lastContactDate || new Date().toISOString().split('T')[0],
      nextFollowUpDate,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      notes: notes.trim(),
      activities: client?.activities || [],
      createdAt: client?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(savedClient);
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                {client ? t.editClient : t.newClient}
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل بيانات العميل، جهة الاتصال، قيمة العقد، ومؤشر صحة الحساب
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: Company and Legal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                اسم العميل / المؤسسة <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مجموعة الأفق القابضة"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                الاسم التجاري / الشركة:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Horizon Global Corp"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Sector & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                القطاع / مجال العمل:
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="التقنية، التجزئة، الرعاية الصحية..."
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                مرحلة العميل الحالية:
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ClientStage)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none font-semibold"
              >
                <option value="active">نشط ومستقر (Active)</option>
                <option value="renewal">قيد التجديد (In Renewal)</option>
                <option value="onboarding">مرحلة التهيئة (Onboarding)</option>
                <option value="at-risk">مهدد بالإلغاء (At Risk)</option>
                <option value="lead">عميل محتمل (Lead)</option>
                <option value="closed">مغلق / غير نشط</option>
              </select>
            </div>
          </div>

          {/* Row 3: Health Score & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  مؤشر صحة الحساب (Health Score):
                </label>
                <span className={`text-xs font-bold ${healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {healthScore}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                قيمة العقد السنوية ({settings.currency}):
              </label>
              <input
                type="number"
                min="0"
                value={annualValue}
                onChange={(e) => setAnnualValue(Number(e.target.value))}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 outline-none font-bold"
              />
            </div>
          </div>

          {/* Key Contact Person Section */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>بيانات جهة الاتصال الرئيسية:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="اسم الشخص المسؤول..."
                  className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="المسمى الوظيفي (مثال: المدير التنفيذي)..."
                  className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="البريد الإلكتروني..."
                  className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="رقم الهاتف..."
                  className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Dates & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                تاريخ تجديد العقد:
              </label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                تاريخ المتابعة القادمة:
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                وسوم وتصنيفات:
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="عميل VIP, قطاع بنكي..."
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              ملاحظات وتفاصيل إضافية:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي اشتراطات خاصة، أو تفاصيل دارت في الاجتماعات الأخيرة..."
              className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              حفظ بيانات العميل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
