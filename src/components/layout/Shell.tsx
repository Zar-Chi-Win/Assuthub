import { ReactNode, useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  Wrench,
  Settings as SettingsIcon, 
  Search, 
  Bell, 
  Plus,
  Menu,
  X,
  Clock,
  Info,
  AlertCircle,
  ChevronRight,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { AddAssetModal } from '../inventory/AddAssetModal';
import { useToast } from '../ui/Toast';
import { api } from '../../lib/apiService';

import { AuthProvider } from '../../context/AuthContext';

interface ShellProps {
  children: ReactNode;
  user: User;
  profile: any;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Inventory', icon: Package, path: '/inventory' },
  { name: 'Employees', icon: Users, path: '/employees' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
  { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { name: 'Configuration', icon: SettingsIcon, path: '/settings' },
];

export function Shell({ children, user, profile }: ShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ assets: any[], employees: any[] }>({ assets: [], employees: [] });
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      toast('Signed out successfully', 'success');
    } catch (err) {
      toast('Failed to sign out', 'error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults({ assets: [], employees: [] });
      return;
    }
    const search = async () => {
      try {
        const [assets, employees] = await Promise.all([
          api.get('/api/assets'),
          api.get('/api/employees')
        ]);
        const q = searchQuery.toLowerCase();
        const filteredAssets = assets.filter((a: any) => 
          a.name.toLowerCase().includes(q) || 
          (a.serialNumber || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
        );
        const filteredEmployees = employees.filter((e: any) => 
          e.name.toLowerCase().includes(q) || 
          (e.department || '').toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q)
        );
        setSearchResults({ assets: filteredAssets.slice(0, 5), employees: filteredEmployees.slice(0, 5) });
      } catch (err) {
        console.error("Search failed", err);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const mockNotifications = [
    { 
      id: 1, 
      title: 'Maintenance due', 
      description: 'MacBook Pro #MBP-089 requires routine maintenance.',
      time: '10m ago',
      type: 'warning',
      icon: Clock
    },
    { 
      id: 2, 
      title: 'New Assignment', 
      description: 'iPad Air assigned to Jane Cooper successfully.',
      time: '2h ago',
      type: 'info',
      icon: Info
    },
    { 
      id: 3, 
      title: 'Low Stock Alert', 
      description: 'Standard perifery monitors are running low in Studio A.',
      time: '5h ago',
      type: 'danger',
      icon: AlertCircle
    }
  ];

  const handleAssetAdded = () => {
    toast('Asset registered successfully', 'success');
    if (window.location.pathname === '/inventory') {
      window.location.reload();
    } else {
      navigate('/inventory');
    }
  };

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

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  return (
    <AuthProvider user={user} profile={profile}>
      <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col bg-white border-r border-[#E2E8F0] z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight">AssetHub</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100" 
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E2E8F0] space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100" 
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <SettingsIcon 
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-500",
                    isActive ? "rotate-90 text-blue-600" : "group-hover:rotate-45"
                  )} 
                />
                {isSidebarOpen && <span>Settings</span>}
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-blue-400/5 blur-md rounded-xl -z-10"
                  />
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-[#1E293B] text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Settings
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>

        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-3 hover:bg-[#F1F5F9] border-t border-[#E2E8F0] flex items-center justify-center text-[#64748B]"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F6F8FB]">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-[#F1F5F9] rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mr-2">
              <Package className="text-blue-600 w-5 h-5 md:hidden" />
              <span className="font-bold text-lg tracking-tight md:hidden">AssetHub</span>
            </div>
            <button 
              onClick={() => setCommandOpen(true)}
              className="max-w-md w-full flex items-center justify-between px-4 py-2 bg-[#F1F5F9] rounded-xl text-[#64748B] hover:bg-[#E2E8F0] transition-all group hidden sm:flex"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Search for assets or employees...</span>
              </div>
              <div className="flex items-center gap-1 border border-[#CBD5E1] bg-white px-1.5 py-0.5 rounded-lg">
                <span className="text-[10px] font-bold">⌘</span>
                <span className="text-[10px] font-bold">K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "p-2.5 rounded-xl transition-all relative",
                  isNotificationsOpen ? "bg-blue-50 text-blue-600" : "text-[#64748B] hover:bg-[#F1F5F9]"
                )}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed sm:absolute top-[72px] sm:top-full left-4 sm:left-auto right-4 sm:right-0 w-auto sm:w-96 bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl z-20 overflow-hidden origin-top sm:origin-top-right mt-1 sm:mt-3"
                    >
                      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]/80 backdrop-blur-sm">
                        <h3 className="font-bold text-[#0F172A] text-sm">Notifications</h3>
                        {isAdmin && (
                          <button 
                            onClick={() => {
                              toast('All notifications marked as read', 'success');
                              setNotificationsOpen(false);
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                        {mockNotifications.map((n) => (
                          <button 
                            key={n.id}
                            className="w-full text-left px-5 py-4 border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all flex gap-3.5 group last:border-0"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                              n.type === 'warning' && "bg-amber-50 text-amber-600 border border-amber-100",
                              n.type === 'info' && "bg-blue-50 text-blue-600 border border-blue-100",
                              n.type === 'danger' && "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                              <n.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#0F172A] mb-0.5 group-hover:text-blue-600 transition-colors">{n.title}</p>
                              <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed font-medium">
                                {n.description}
                              </p>
                              <p className="text-[10px] font-bold text-[#94A3B8] mt-2.5 uppercase tracking-tight flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                                {n.time}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button className="w-full py-3.5 text-xs font-bold text-blue-600 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-all border-t border-[#E2E8F0] bg-white hover:text-blue-700">
                        View all activity
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Asset</span>
              </button>
            )}

            <div className="h-8 w-[1px] bg-[#E2E8F0] mx-1 sm:block hidden" />

            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className={cn(
                  "flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl transition-all group",
                  isProfileOpen ? "bg-blue-50" : "hover:bg-[#F1F5F9]"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {(user.displayName || user.email || 'A').substring(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#0F172A] leading-none mb-1">{user.displayName || 'Administrator'}</p>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-tight">{profile?.role === 'admin' ? 'System Admin' : 'Staff Member'}</p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setProfileOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl z-20 overflow-hidden origin-top-right"
                    >
                      <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-[#0F172A] truncate">{user.email || 'Administrator'}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/settings?tab=profile');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                        >
                          <Users className="w-4 h-4" />
                          Account Details
                        </button>
                        <button 
                          onClick={() => {
                            setProfileOpen(false);
                            setCommandOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                        >
                          <Search className="w-4 h-4" />
                          Global Search
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-40 md:hidden p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-600 w-6 h-6" />
                  <span className="font-bold text-2xl tracking-tight">AssetHub</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F1F5F9] transition-all text-lg font-medium"
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-2">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {(user.displayName || user.email || 'A').substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A]">{user.displayName || 'Administrator'}</p>
                      <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{profile?.role === 'admin' ? 'System Admin' : 'Staff Member'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all text-lg font-medium"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onSuccess={handleAssetAdded} 
      />

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
            >
              <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-4 bg-[#F8FAFC]">
                <Search className="w-5 h-5 text-blue-600" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Type to search anything..."
                  className="w-full bg-transparent border-none outline-none text-base font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setCommandOpen(false)}
                  className="px-2 py-1 text-[10px] font-bold text-[#64748B] border border-[#E2E8F0] rounded-lg bg-white"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!searchQuery ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">Global Command Center</p>
                    <p className="text-xs text-[#64748B] mt-1">Start typing to find assets, employees, or locations.</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {searchResults.assets.length > 0 && (
                      <div>
                        <h3 className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-2">Assets</h3>
                        <div className="space-y-1">
                          {searchResults.assets.map(asset => (
                            <button
                              key={asset.id}
                              onClick={() => {
                                navigate('/inventory');
                                setCommandOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-2xl transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-[#0F172A]">{asset.name}</p>
                                  <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-tight">{asset.serialNumber}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.employees.length > 0 && (
                      <div>
                        <h3 className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-2">Employees</h3>
                        <div className="space-y-1">
                          {searchResults.employees.map(emp => (
                            <button
                              key={emp.id}
                              onClick={() => {
                                navigate(`/employees/${emp.id}`);
                                setCommandOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-2xl transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {emp.name[0]}
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-[#0F172A]">{emp.name}</p>
                                  <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-tight">{emp.department}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.assets.length === 0 && searchResults.employees.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-sm font-bold text-[#64748B]">No matches found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <div className="text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-sm font-bold">↵</div>
                  <span className="text-[10px] font-medium uppercase tracking-tighter">to select</span>
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <div className="text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-sm font-bold">↑↓</div>
                  <span className="text-[10px] font-medium uppercase tracking-tighter">to navigate</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </AuthProvider>
  );
}
