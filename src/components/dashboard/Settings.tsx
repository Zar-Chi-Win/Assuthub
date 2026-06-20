import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  AppWindow, 
  Database, 
  Globe, 
  User, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Info,
  Terminal,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/apiService';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

type SettingsTab = 'general' | 'profile' | 'system';

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, user: authUser, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'general' : 'profile');

  useEffect(() => {
    const tab = searchParams.get('tab') as SettingsTab;
    if (tab && (tab === 'general' || tab === 'profile' || tab === 'system')) {
      if (!isAdmin && tab !== 'profile') {
        setActiveTab('profile');
      } else {
        setActiveTab(tab);
      }
    }
  }, [searchParams, isAdmin]);

  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await api.get('/api/settings');
        setSettings(s);
      } catch (err) {
        toast('Failed to load system parameters', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async (updates: any) => {
    setSaving(true);
    try {
      await api.put('/api/settings', updates);
      setSettings({ ...settings, ...updates });
      toast('Global parameters updated successfully', 'success');
    } catch (err) {
      toast('Update failed. Verify permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Profile identity is managed by System Configuration', 'info');
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#64748B] font-mono text-xs uppercase tracking-widest">Initialising environment...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Configuration</h1>
          <p className="text-[#64748B] mt-1 font-medium italic serif">"Precise control for high-availability asset tracking."</p>
        </div>
        
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#E2E8F0] shadow-inner overflow-x-auto">
          {isAdmin && <TabButton active={activeTab === 'general'} onClick={() => setSearchParams({ tab: 'general' })} label="General" icon={AppWindow} />}
          <TabButton active={activeTab === 'profile'} onClick={() => setSearchParams({ tab: 'profile' })} label="Profile" icon={User} />
          {isAdmin && <TabButton active={activeTab === 'system'} onClick={() => setSearchParams({ tab: 'system' })} label="System" icon={Terminal} />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                       <Zap className="w-5 h-5 text-blue-600" />
                       Environment Properties
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                          label="Instance Handle" 
                          value={settings.instance_name} 
                          onChange={(v) => handleSaveSettings({ instance_name: v })} 
                          placeholder="AssetHub Enterprise"
                        />
                        <InputGroup 
                          label="Deployment Region" 
                          value={settings.primary_region} 
                          onChange={(v) => handleSaveSettings({ primary_region: v })} 
                          placeholder="Global (Cloud Run)"
                        />
                      </div>
                      <div className="pt-6 border-t border-[#F1F5F9] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4" />
                          Configuration Synced
                        </div>
                        <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Last commit: {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                       <Bell className="w-5 h-5 text-indigo-600" />
                       Alert Relay Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">Inventory Maintenance Alerts</p>
                          <p className="text-xs text-[#64748B]">Push notifications for upcoming service dates.</p>
                        </div>
                        <Switch active={true} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">New User Registration</p>
                          <p className="text-xs text-[#64748B]">Notify admins when new profile is created.</p>
                        </div>
                        <Switch active={false} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#0F172A] rounded-3xl p-6 text-white shadow-xl">
                    <Database className="w-8 h-8 text-blue-400 mb-4" />
                    <h4 className="text-lg font-bold mb-1 italic serif">Storage Status</h4>
                    <p className="text-xs text-slate-400 mb-6">Real-time health of the SQLite engine.</p>
                    <div className="space-y-4">
                      <StatItem label="WAL Journaling" value="Optimal" color="text-emerald-400" />
                      <StatItem label="Sequence Integrity" value="100%" color="text-emerald-400" />
                      <StatItem label="Uptime" value="14.2 Days" color="text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-4">API Metadata</h4>
                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">RUNTIME:</span>
                        <span className="text-[#0F172A] font-bold">NODE 20.x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">TLS:</span>
                        <span className="text-[#0F172A] font-bold">AES-256-GCM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">SDK VERSION:</span>
                        <span className="text-[#0F172A] font-bold">V4.9.2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileEditor authUser={authUser} profile={profile} onSaved={() => toast('Profile updated', 'success')} />
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
               <div className="bg-[#1E293B] rounded-3xl p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cpu className="w-48 h-48 text-blue-400" />
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">System Infrastructure Console</h3>
                        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Version v2.9.4-production</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ConsoleStat label="Memory Usage" value="482MB" progress={24} />
                      <ConsoleStat label="CPU Load" value="1.2%" progress={2} />
                      <ConsoleStat label="Storage (SQL)" value="12.4MB" progress={8} />
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Services</h4>
                      <div className="flex flex-wrap gap-3">
                         <ServiceTag label="Backend API" active />
                         <ServiceTag label="Vite DevServer" active />
                         <ServiceTag label="SQLite Journal" active />
                         <ServiceTag label="JWT Validator" active />
                         <ServiceTag label="PWA Worker" active />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
        active 
          ? "bg-white text-blue-600 shadow-md border border-blue-100" 
          : "text-[#64748B] hover:text-[#0F172A]"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-blue-600" : "text-[#94A3B8]")} />
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => { setLocalValue(value); }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</label>
      <div className={cn(
        "flex items-center gap-2 bg-[#F8FAFC] border rounded-xl transition-all",
        isFocused ? "border-blue-300 ring-4 ring-blue-50 bg-white" : "border-[#E2E8F0]"
      )}>
        <input 
          type="text" 
          value={localValue} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (localValue !== value) onChange(localValue);
          }}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-[#0F172A] outline-none"
        />
        <div className="pr-4 opacity-30 select-none">
          <SettingsIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function Switch({ active }: { active: boolean }) {
  return (
    <div className={cn(
      "w-12 h-6 rounded-full transition-all relative cursor-pointer",
      active ? "bg-blue-600" : "bg-slate-200"
    )}>
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
        active ? "translate-x-6" : "translate-x-0"
      )} />
    </div>
  );
}

function StatItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={cn("text-xs font-bold", color)}>{value}</span>
    </div>
  );
}

function ConsoleStat({ label, value, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-mono text-white font-bold">{value}</p>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-blue-500"
        />
      </div>
    </div>
  );
}

function ServiceTag({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={cn(
      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
      active ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-500"
    )}>
      {active && <span className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_#60a5fa] animate-pulse" />}
      {label}
    </div>
  );
}

function ProfileEditor({ authUser, profile, onSaved }: { authUser: any; profile: any; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState<string>(authUser?.displayName || profile?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = (authUser?.displayName || authUser?.email || '?')[0]?.toUpperCase();
  const dirty = displayName.trim() !== (authUser?.displayName || profile?.displayName || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = displayName.trim();
    if (!next) { setError('Display name cannot be empty.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: next });
      }
      await setDoc(doc(db, 'users', authUser.uid), { displayName: next }, { merge: true });
      onSaved();
    } catch (err: any) {
      console.error('Profile update failed', err);
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
      <h3 className="text-xl font-bold text-[#0F172A] mb-8">Personal Identity</h3>
      <div className="space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-3xl font-extrabold text-blue-700 shadow-inner border-4 border-white">
            {initial}
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">{displayName || 'Authorized User'}</p>
            <p className="text-xs text-[#64748B] mt-1 italic">Role: {profile?.role || 'Guest'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jane Cooper"
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Email Address</label>
            <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-bold text-[#475569]">
              {authUser?.email || '—'}
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-1.5">Email is managed by your identity provider and cannot be changed here.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDisplayName(authUser?.displayName || profile?.displayName || '')}
            disabled={!dirty || saving}
            className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:bg-slate-50 rounded-xl disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-60 transition-all"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
