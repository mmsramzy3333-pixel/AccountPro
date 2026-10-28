import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileSpreadsheet, 
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Client, ClientStage, AppSettings, Task } from '../types';
import { getT } from '../utils/translations';
import { calculateClientHealth } from '../utils/clientHealth';

interface ClientsViewProps {
  clients: Client[];
  tasks?: Task[];
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectClient: (client: Client) => void;
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onOpenAiDrafter: (client: Client) => void;
  onOpenAiAdvisor: (client: Client) => void;
  onOpenWinBack?: (client: Client) => void;
  onExportExcel: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  tasks = [],
  settings,
  searchQuery,
  onSearchChange,
  onSelectClient,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onOpenAiDrafter,
  onOpenAiAdvisor,
  onOpenWinBack,
  onExportExcel,
}) => {
  const t = getT(settings.language);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value' | 'health' | 'renewal' | 'name'>('value');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchCompany = c.companyName.toLowerCase().includes(q);
          const matchContact = c.primaryContact?.name.toLowerCase().includes(q) || c.primaryContact?.email.toLowerCase().includes(q);
          const matchIndustry = c.industry?.toLowerCase().includes(q);
          const matchTags = c.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchName && !matchCompany && !matchContact && !matchIndustry && !matchTags) {
            return false;
          }
        }

        // Stage
        if (selectedStage !== 'all' && c.stage !== selectedStage) {
          return false;
        }

        // Health
        if (healthFilter === 'high' && c.healthScore < 80) return false;
        if (healthFilter === 'medium' && (c.healthScore < 60 || c.healthScore >= 80)) return false;
        if (healthFilter === 'low' && c.healthScore >= 60) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value') return (b.annualValue || 0) - (a.annualValue || 0);
        if (sortBy === 'health') return (b.healthScore || 0) - (a.healthScore || 0);
        if (sortBy === 'renewal') return new Date(a.renewalDate || '').getTime() - new Date(b.renewalDate || '').getTime();
        return a.name.localeCompare(b.name);
      });
  }, [clients, searchQuery, selectedStage, healthFilter, sortBy]);

  const stages = [
    { id: 'all', label: t.filterAll },
    { id: 'active', label: t.stage_active },
    { id: 'renewal', label: t.stage_renewal },
    { id: 'onboarding', label: t.stage_onboarding },
    { id: 'at-risk', label: t.stage_at_risk },
    { id: 'lead', label: t.stage_lead },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
            {t.clients}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 eye-care:text-[#766c5d] mt-0.5">
            إدارة متكاملة لبيانات الشركاء، دورة حياة الحساب، العقود، والتواصل الدوري
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newClient}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] space-y-3.5 shadow-xs">
        
        {/* Stages Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStage === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/70 eye-care:bg-[#ede5d8] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Search, Health, Sort, View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 eye-care:border-[#e5dcce]">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Health Filter */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>الصحة:</span>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="high">صحة ممتازة (80%+)</option>
                <option value="medium">صحة متوسطة (60-79%)</option>
                <option value="low">مهدد بالإلغاء (&lt;60%)</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="value">الأعلى قيمة سنوية</option>
                <option value="health">الأعلى صحة للحساب</option>
                <option value="renewal">الأقرب لتجديد العقد</option>
                <option value="name">أبجدياً</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 eye-care:bg-[#ede5d8] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dormant / Churned Win-Back Opportunity Alert */}
      {clients.some(c => c.stage === 'closed' || c.stage === 'at-risk') && onOpenWinBack && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-800/50 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>فرص استرجاع العملاء السابقين (Win-Back Hub) 🎯</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  {clients.filter(c => c.stage === 'closed' || c.stage === 'at-risk').length} عملاء مؤهلين
                </span>
              </h4>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                استخدم دخلات وسيناريوهات الاسترجاع الذكية (باقات سبرنت، دخلات عاطفية، فحص إعلانات مجاني) لإعادة التعاون.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const target = clients.find(c => c.stage === 'closed') || clients.find(c => c.stage === 'at-risk') || clients[0];
              if (target) onOpenWinBack(target);
            }}
            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shrink-0 transition-all transform hover:scale-[1.02]"
          >
            استعراض دخلات وسيناريوهات الاسترجاع ➔
          </button>
        </div>
      )}

      {/* Clients Display: Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const health = calculateClientHealth(client, tasks);
            const renewalDiff = Math.ceil(
              (new Date(client.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={client.id}
                className="group rounded-2xl p-5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Stage badge & Health Score */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      client.stage === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : client.stage === 'renewal'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                        : client.stage === 'at-risk'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : client.stage === 'onboarding'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {client.stage === 'active' ? t.stage_active
                        : client.stage === 'renewal' ? t.stage_renewal
                        : client.stage === 'at-risk' ? t.stage_at_risk
                        : client.stage === 'onboarding' ? t.stage_onboarding
                        : t.stage_lead}
                    </span>

                    {/* Health Score Pill with Status (نشط / خامل / في خطر) */}
                    <div 
                      title={`مؤشر صحة الحساب: ${health.score}% - حالة الحساب: ${health.statusLabelAr}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border shadow-2xs ${health.badgeBgClass} ${health.badgeTextClass} ${health.badgeBorderClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${health.dotColorClass} ${health.status === 'at-risk' ? 'animate-ping' : ''}`} />
                      <span>{health.statusLabelAr} ({health.score}%)</span>
                    </div>
                  </div>

                  {/* Company Name & Sector - Colored by Status */}
                  <h3 
                    onClick={() => onSelectClient(client)}
                    className={`font-black text-base cursor-pointer line-clamp-1 transition-colors hover:underline ${health.nameColorClass}`}
                  >
                    {client.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 eye-care:text-[#6a6051] line-clamp-1">
                    {client.companyName} • {client.industry}
                  </p>

                  {/* Primary Contact Person */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 eye-care:bg-[#efe8dc] border border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 eye-care:text-[#2c2720]">
                        {client.primaryContact.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {client.primaryContact.role}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      {client.primaryContact.phone && (
                        <a 
                          href={`tel:${client.primaryContact.phone}`}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[11px] ltr:font-mono">{client.primaryContact.phone}</span>
                        </a>
                      )}
                      {client.primaryContact.email && (
                        <a 
                          href={`mailto:${client.primaryContact.email}`}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[11px] truncate max-w-[130px]">{client.primaryContact.email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Financial & Renewal Data */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">قيمة العقد السنوية</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {client.annualValue?.toLocaleString()} {client.currency}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">موعد التجديد</span>
                      <span className={`font-bold ${renewalDiff <= 30 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {renewalDiff > 0 ? `خلال ${renewalDiff} يوم` : 'منتهي'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAiDrafter(client)}
                      title="صياغة إيميل ذكي للعميل بالذكاء الاصطناعي"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>إيميل ذكي</span>
                    </button>
                    <button
                      onClick={() => onOpenAiAdvisor(client)}
                      title="تحليل صحة الحساب وخطة العمل بالذكاء الاصطناعي"
                      className="p-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                    {onOpenWinBack && (
                      <button
                        onClick={() => onOpenWinBack(client)}
                        title="دخلات وسيناريوهات استرجاع العميل 🎯"
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          client.stage === 'closed' || client.stage === 'at-risk'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/40 shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استرجاع</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      title="تعديل بيانات العميل"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectClient(client)}
                      title="عرض الملف الكامل"
                      className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      <span>الملف</span>
                      <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clients Display: Table Mode */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] overflow-hidden bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 eye-care:bg-[#eee7dc] border-b border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">اسم العميل والشركة</th>
                  <th className="py-3 px-4">المرحلة</th>
                  <th className="py-3 px-4">صحة الحساب</th>
                  <th className="py-3 px-4">قيمة العقد</th>
                  <th className="py-3 px-4">جهة الاتصال</th>
                  <th className="py-3 px-4">موعد التجديد</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 eye-care:divide-[#e5dcce]">
                {filteredClients.map((client) => {
                  const health = calculateClientHealth(client, tasks);
                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 eye-care:hover:bg-[#efe8dc] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onSelectClient(client)}
                          className={`font-black cursor-pointer flex items-center gap-1.5 transition-colors hover:underline ${health.nameColorClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${health.dotColorClass} shrink-0`} />
                          <span>{client.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${health.badgeBgClass} ${health.badgeTextClass} ${health.badgeBorderClass}`}>
                            {health.statusLabelAr}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{client.companyName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                          {client.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${health.badgeBgClass} ${health.badgeTextClass} ${health.badgeBorderClass}`}>
                          {health.score}%
                        </span>
                      </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {client.annualValue?.toLocaleString()} {client.currency}
                    </td>
                    <td className="py-3 px-4">
                      <div>{client.primaryContact?.name}</div>
                      <div className="text-xs text-slate-400">{client.primaryContact?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {client.renewalDate}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAiDrafter(client)}
                          title="صياغة إيميل ذكي"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 hover:bg-blue-100"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        {onOpenWinBack && (
                          <button
                            onClick={() => onOpenWinBack(client)}
                            title="دخلات وسيناريوهات استرجاع العميل 🎯"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectClient(client)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                        >
                          عرض
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredClients.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            لم يتم العثور على أي عملاء
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            جرب تغيير معايير البحث أو الفلتر، أو أضف عميلاً جديداً الآن.
          </p>
        </div>
      )}
    </div>
  );
};
