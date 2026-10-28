import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Client, 
  Task, 
  AppSettings, 
  NotificationItem,
  SaudiTemplate,
  SaudiDictionaryEntry,
  NavTab
} from './types';
import { 
  getStoredClients, 
  saveStoredClients, 
  getStoredTasks, 
  saveStoredTasks, 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredNotifications, 
  saveStoredNotifications,
  getStoredSaudiTemplates,
  saveStoredSaudiTemplates,
  getStoredSaudiDictionary,
  saveStoredSaudiDictionary,
  exportClientsToCsv,
  exportTasksToCsv,
  exportDailyReportToCsv,
  playAlertChime
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { SmartSidebar } from './components/SmartSidebar';
import { DashboardView } from './components/DashboardView';
import { ShalStudioView } from './components/ShalStudioView';
import { RetentionFunnelView } from './components/RetentionFunnelView';
import { ClientsView } from './components/ClientsView';
import { TasksView } from './components/TasksView';
import { ReportsView } from './components/ReportsView';
import { SaudiDictionaryView } from './components/SaudiDictionaryView';
import { ClientDetailsModal } from './components/ClientDetailsModal';
import { ClientFormModal } from './components/ClientFormModal';
import { TaskFormModal } from './components/TaskFormModal';
import { AiToolsModal } from './components/AiToolsModal';
import { LiveSupportModal } from './components/LiveSupportModal';
import { SettingsModal } from './components/SettingsModal';
import { DashboardCustomizeModal } from './components/DashboardCustomizeModal';
import { SaudiTemplatesWidget } from './components/SaudiTemplatesWidget';
import { WinBackModal } from './components/WinBackModal';
import { SystemDocumentationModal } from './components/SystemDocumentationModal';

export default function App() {
  // Main Data States
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications);
  const [saudiTemplates, setSaudiTemplates] = useState<SaudiTemplate[]>(getStoredSaudiTemplates);
  const [saudiDictionary, setSaudiDictionary] = useState<SaudiDictionaryEntry[]>(getStoredSaudiDictionary);

  // App Navigation & Filters
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Connectivity & Sync Simulation
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [clientFormState, setClientFormState] = useState<{ isOpen: boolean; client?: Client }>({ isOpen: false });
  const [taskFormState, setTaskFormState] = useState<{ isOpen: boolean; task?: Task; initialDueDate?: string }>({ isOpen: false });
  const [aiToolsState, setAiToolsState] = useState<{ isOpen: boolean; mode: 'email' | 'advisor'; client?: Client }>({ isOpen: false, mode: 'email' });
  const [winBackModalState, setWinBackModalState] = useState<{ isOpen: boolean; client?: Client | null }>({ isOpen: false });
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomizeDashboardOpen, setIsCustomizeDashboardOpen] = useState(false);
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Listen to Online/Offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync RTL and Theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    root.lang = settings.language;

    // Handle Theme classes
    root.classList.remove('dark', 'eye-care');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'eye-care') {
      root.classList.add('eye-care');
    }
  }, [settings.language, settings.theme]);

  // Persist Changes
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  }, []);

  const handleUpdateClients = useCallback((newClients: Client[]) => {
    setClients(newClients);
    saveStoredClients(newClients);
  }, []);

  const handleUpdateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  }, []);

  const handleUpdateSaudiTemplates = useCallback((newTemplates: SaudiTemplate[]) => {
    setSaudiTemplates(newTemplates);
    saveStoredSaudiTemplates(newTemplates);
  }, []);

  const handleUpdateDictionary = useCallback((newEntries: SaudiDictionaryEntry[]) => {
    setSaudiDictionary(newEntries);
    saveStoredSaudiDictionary(newEntries);
  }, []);

  const handleReloadAll = useCallback(() => {
    setClients(getStoredClients());
    setTasks(getStoredTasks());
    setSettings(getStoredSettings());
    setNotifications(getStoredNotifications());
    setSaudiTemplates(getStoredSaudiTemplates());
    setSaudiDictionary(getStoredSaudiDictionary());
  }, []);

  // Re-order tasks according to AI Optimal schedule
  const handleApplyAIOrder = useCallback((orderedTaskIds: string[]) => {
    setTasks(prevTasks => {
      const taskMap = new Map(prevTasks.map(t => [t.id, t]));
      const reordered: Task[] = [];
      for (const id of orderedTaskIds) {
        const found = taskMap.get(id);
        if (found) {
          reordered.push({ ...found, isStarred: true });
          taskMap.delete(id);
        }
      }
      for (const remaining of taskMap.values()) {
        reordered.push(remaining);
      }
      saveStoredTasks(reordered);
      return reordered;
    });
  }, []);

  // Client actions
  const handleSaveClient = useCallback((client: Client) => {
    setClients(prevClients => {
      const exists = prevClients.some(c => c.id === client.id);
      const updatedList = exists
        ? prevClients.map(c => c.id === client.id ? client : c)
        : [client, ...prevClients];
      saveStoredClients(updatedList);
      return updatedList;
    });
    setSelectedClientForDetails(prev => (prev?.id === client.id ? client : prev));
  }, []);

  const handleDeleteClient = useCallback((clientId: string) => {
    setClientToDeleteId(clientId);
  }, []);

  const handleConfirmDeleteClient = useCallback(() => {
    if (!clientToDeleteId) return;
    setClients(prevClients => {
      const updated = prevClients.filter(c => c.id !== clientToDeleteId);
      saveStoredClients(updated);
      return updated;
    });
    setSelectedClientForDetails(prev => (prev?.id === clientToDeleteId ? null : prev));
    setClientToDeleteId(null);
    if (settings.soundEnabled) playAlertChime('click');
  }, [clientToDeleteId, settings.soundEnabled]);

  // Task actions
  const handleToggleTask = useCallback((taskId: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState && settings.soundEnabled) {
            playAlertChime('success');
          }
          return {
            ...t,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
          };
        }
        return t;
      });
      saveStoredTasks(updated);
      return updated;
    });
  }, [settings.soundEnabled]);

  const handleToggleStar = useCallback((taskId: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, isStarred: !t.isStarred };
        }
        return t;
      });
      saveStoredTasks(updated);
      return updated;
    });
    if (settings.soundEnabled) playAlertChime('click');
  }, [settings.soundEnabled]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.filter(t => t.id !== taskId);
      saveStoredTasks(updated);
      return updated;
    });
    if (settings.soundEnabled) playAlertChime('click');
  }, [settings.soundEnabled]);

  const handleSaveTask = useCallback((task: Task) => {
    setTasks(prevTasks => {
      const exists = prevTasks.some(t => t.id === task.id);
      const updated = exists
        ? prevTasks.map(t => t.id === task.id ? task : t)
        : [task, ...prevTasks];
      saveStoredTasks(updated);
      return updated;
    });
  }, []);

  // Log activity on client
  const handleLogClientActivity = useCallback((clientId: string, title: string, desc: string) => {
    setClients(prevClients => {
      const target = prevClients.find(c => c.id === clientId);
      if (!target) return prevClients;
      const newAct = {
        id: 'act-' + Date.now(),
        type: 'email' as const,
        title,
        description: desc,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      const updated: Client = {
        ...target,
        lastContactDate: new Date().toISOString().split('T')[0],
        activities: [newAct, ...(target.activities || [])],
      };
      const updatedList = prevClients.map(c => c.id === clientId ? updated : c);
      saveStoredClients(updatedList);
      return updatedList;
    });
  }, []);

  // Force Cloud Sync Simulator
  const handleTriggerSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (settings.soundEnabled) playAlertChime('success');
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        title: 'مزامنة فورية ناجحة',
        message: 'تمت مزامنة كافة بيانات الحسابات والمهام والقوالب بنجاح عبر السحابة.',
        timestamp: 'الآن',
        read: false,
        type: 'system',
      };
      setNotifications(prev => {
        const updatedNotifs = [newNotif, ...prev];
        saveStoredNotifications(updatedNotifs);
        return updatedNotifs;
      });
    }, 900);
  }, [settings.soundEnabled]);

  // Notifications actions
  const handleMarkNotifRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const handleClearNotifs = useCallback(() => {
    setNotifications([]);
    saveStoredNotifications([]);
  }, []);

  // Memoized stats & calculations
  const pendingTasksCount = useMemo(() => {
    return tasks.filter(t => !t.completed).length;
  }, [tasks]);

  const clientsCount = useMemo(() => {
    return clients.length;
  }, [clients]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.theme === 'dark'
        ? 'bg-slate-950 text-slate-100'
        : settings.theme === 'eye-care'
        ? 'bg-[#fcfaf6] text-[#2c2720]'
        : 'bg-slate-50/60 text-slate-900'
    }`}>
      
      {/* Top Application Bar */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotifRead}
        onClearNotifications={handleClearNotifs}
        onOpenNewClient={() => setClientFormState({ isOpen: true })}
        onOpenNewTask={() => setTaskFormState({ isOpen: true })}
        onOpenLiveSupport={() => setIsSupportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocumentation={() => setIsDocModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Floating Smart Animated Sidebar */}
      <SmartSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        clientsCount={clientsCount}
        pendingTasksCount={pendingTasksCount}
        onOpenNewClient={() => setClientFormState({ isOpen: true })}
        onOpenNewTask={() => setTaskFormState({ isOpen: true })}
        onOpenDocumentation={() => setIsDocModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-300 md:pe-22">
        {activeTab === 'dashboard' && (
          <DashboardView
            clients={clients}
            tasks={tasks}
            settings={settings}
            saudiTemplates={saudiTemplates}
            onUpdateSaudiTemplates={handleUpdateSaudiTemplates}
            onToggleTask={handleToggleTask}
            onSelectClient={(client) => setSelectedClientForDetails(client)}
            onOpenNewTask={() => setTaskFormState({ isOpen: true })}
            onOpenNewClient={() => setClientFormState({ isOpen: true })}
            onOpenAiDrafter={(client) => setAiToolsState({ isOpen: true, mode: 'email', client })}
            onOpenAiAdvisor={(client) => setAiToolsState({ isOpen: true, mode: 'advisor', client })}
            onExportExcel={() => exportDailyReportToCsv(clients, tasks, settings)}
            onOpenCustomizeDashboard={() => setIsCustomizeDashboardOpen(true)}
            onLogClientActivity={handleLogClientActivity}
            onApplyAIOrder={handleApplyAIOrder}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenWinBack={(client) => setWinBackModalState({ isOpen: true, client: client || null })}
          />
        )}

        {activeTab === 'shal-studio' && (
          <ShalStudioView
            clients={clients}
            settings={settings}
            onOpenWinBackModal={(client) => setWinBackModalState({ isOpen: true, client: client || null })}
          />
        )}

        {activeTab === 'retention-funnel' && (
          <RetentionFunnelView
            clients={clients}
            settings={settings}
            setActiveTab={setActiveTab}
            onOpenWinBackModal={(client) => setWinBackModalState({ isOpen: true, client: client || null })}
          />
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6 pb-12 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                  قائمة الردود الذكية ورسائل الواتساب السعودية 💬
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  تواصل احترافي باللهجة الخليجية السعودية لمتابعة وتفعيل الشركاء والعملاء في وكالات التسويق
                </p>
              </div>
            </div>
            <SaudiTemplatesWidget
              templates={saudiTemplates}
              clients={clients}
              settings={settings}
              onUpdateTemplates={handleUpdateSaudiTemplates}
              onLogActivity={handleLogClientActivity}
            />
          </div>
        )}

        {activeTab === 'dictionary' && (
          <SaudiDictionaryView
            entries={saudiDictionary}
            settings={settings}
            onUpdateEntries={handleUpdateDictionary}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            tasks={tasks}
            settings={settings}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectClient={(client) => setSelectedClientForDetails(client)}
            onOpenNewClient={() => setClientFormState({ isOpen: true })}
            onEditClient={(client) => setClientFormState({ isOpen: true, client })}
            onDeleteClient={handleDeleteClient}
            onOpenAiDrafter={(client) => setAiToolsState({ isOpen: true, mode: 'email', client })}
            onOpenAiAdvisor={(client) => setAiToolsState({ isOpen: true, mode: 'advisor', client })}
            onOpenWinBack={(client) => setWinBackModalState({ isOpen: true, client })}
            onExportExcel={() => exportClientsToCsv(clients)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            clients={clients}
            settings={settings}
            onToggleTask={handleToggleTask}
            onToggleStar={handleToggleStar}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => setTaskFormState({ isOpen: true })}
            onOpenNewTaskWithDate={(dateStr) => setTaskFormState({ isOpen: true, initialDueDate: dateStr })}
            onEditTask={(task) => handleSaveTask(task)}
            onExportExcel={() => exportTasksToCsv(tasks)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            clients={clients}
            tasks={tasks}
            settings={settings}
          />
        )}
      </main>

      {/* Client Details Modal / Dossier */}
      {selectedClientForDetails && (
        <ClientDetailsModal
          client={selectedClientForDetails}
          tasks={tasks}
          settings={settings}
          onClose={() => setSelectedClientForDetails(null)}
          onEdit={(c) => {
            setSelectedClientForDetails(null);
            setClientFormState({ isOpen: true, client: c });
          }}
          onDelete={(id) => handleDeleteClient(id)}
          onUpdateClient={(updated) => handleSaveClient(updated)}
          onOpenAiDrafter={(client) => setAiToolsState({ isOpen: true, mode: 'email', client })}
          onOpenAiAdvisor={(client) => setAiToolsState({ isOpen: true, mode: 'advisor', client })}
          onOpenWinBack={(c) => {
            setSelectedClientForDetails(null);
            setWinBackModalState({ isOpen: true, client: c });
          }}
        />
      )}

      {/* Add / Edit Client Modal */}
      {clientFormState.isOpen && (
        <ClientFormModal
          client={clientFormState.client}
          settings={settings}
          onSave={handleSaveClient}
          onClose={() => setClientFormState({ isOpen: false })}
        />
      )}

      {/* Add / Edit Task Modal */}
      {taskFormState.isOpen && (
        <TaskFormModal
          task={taskFormState.task}
          initialDueDate={taskFormState.initialDueDate}
          clients={clients}
          settings={settings}
          onSave={handleSaveTask}
          onClose={() => setTaskFormState({ isOpen: false })}
        />
      )}

      {/* AI Tools Modal (Follow-up email drafter & Retention Advisor) */}
      {aiToolsState.isOpen && (
        <AiToolsModal
          initialMode={aiToolsState.mode}
          initialClient={aiToolsState.client}
          clients={clients}
          settings={settings}
          onClose={() => setAiToolsState({ isOpen: false, mode: 'email' })}
          onLogActivity={handleLogClientActivity}
        />
      )}

      {/* 24/7 Live Support & AM Copilot Modal */}
      {isSupportOpen && (
        <LiveSupportModal
          settings={settings}
          onClose={() => setIsSupportOpen(false)}
        />
      )}

      {/* Settings & Customization Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onReloadAllData={handleReloadAll}
        />
      )}

      {/* Dashboard Customize Modal */}
      {isCustomizeDashboardOpen && (
        <DashboardCustomizeModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsCustomizeDashboardOpen(false)}
        />
      )}

      {/* Safe Client Deletion Confirmation Modal */}
      {clientToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                تأكيد حذف ملف العميل
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف هذا العميل وكافة سجلات أنشطته؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setClientToDeleteId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDeleteClient}
                className="px-5 py-2 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win-Back Modal for Dormant & Past Clients */}
      {winBackModalState.isOpen && (
        <WinBackModal
          isOpen={winBackModalState.isOpen}
          initialClient={winBackModalState.client}
          clients={clients}
          settings={settings}
          onLogActivity={handleLogClientActivity}
          onClose={() => setWinBackModalState({ isOpen: false, client: null })}
        />
      )}

      {/* Interactive System Documentation Center Modal */}
      <SystemDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        settings={settings}
      />
    </div>
  );
}
