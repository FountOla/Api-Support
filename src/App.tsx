import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plug, 
  TestTube2, 
  GitBranch, 
  History, 
  MessageSquareDiff, 
  Ticket, 
  Settings as SettingsIcon,
  ChevronRight,
  Activity,
  Bot,
  Plus,
  Search,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from './store/appStore';
import Overview from './pages/Overview';
import Integrations from './pages/Integrations';
import TestingLab from './pages/TestingLab';
import AiSupport from './pages/AiSupport';
import Logs from './pages/Logs';
import Workflows from './pages/Workflows';
import Tickets from './pages/Tickets';
import Settings from './pages/Settings';

type Page = 'overview' | 'integrations' | 'testing' | 'workflows' | 'logs' | 'ai-support' | 'tickets' | 'settings';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, setActiveWorkspace } = useAppStore();

  useEffect(() => {
    // Fetch initial workspace
    fetch('/api/integrations')
      .then(res => res.json())
      .then(() => {
        // Just mocking the workspace for now
        setActiveWorkspace({ id: 'default-ws', name: 'Default Workspace', slug: 'default-ws' });
      });
  }, []);

  const navItems = [
    { id: 'overview' as Page, label: 'Overview', icon: LayoutDashboard },
    { id: 'integrations' as Page, label: 'Integrations', icon: Plug },
    { id: 'testing' as Page, label: 'Testing Lab', icon: TestTube2 },
    { id: 'workflows' as Page, label: 'Workflows', icon: GitBranch },
    { id: 'logs' as Page, label: 'Activity Logs', icon: History },
    { id: 'ai-support' as Page, label: 'AI Assistant', icon: Bot },
    { id: 'tickets' as Page, label: 'Support Tickets', icon: Ticket },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <Overview />;
      case 'integrations': return <Integrations />;
      case 'testing': return <TestingLab />;
      case 'workflows': return <Workflows />;
      case 'ai-support': return <AiSupport />;
      case 'tickets': return <Tickets />;
      case 'logs': return <Logs />;
      case 'settings': return <Settings />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-navy text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative bg-surface border-r border-border flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Plug className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold text-xl tracking-tight"
            >
              API Hub
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activePage === item.id 
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              {activePage === item.id && isSidebarOpen && (
                <motion.div layoutId="activeInd" className="ml-auto w-1 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={() => setActivePage('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activePage === 'settings' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate lowercase">Free Plan</p>
              </div>
            )}
            {isSidebarOpen && <LogOut className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" />}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-bottom border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-white/5 rounded-md text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-border mx-2" />
            <h2 className="font-display font-semibold text-lg text-white">
              {navItems.find(i => i.id === activePage)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search integrations..."
                className="bg-white/5 border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-primary transition-all w-64"
              />
            </div>
            <button className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Connector</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
