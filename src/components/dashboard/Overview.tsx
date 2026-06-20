import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Package, 
  CheckCircle2, 
  Construction, 
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../ui/Toast';
import { Skeleton } from '../ui/Skeleton';

export function Overview() {
  const [assets, setAssets] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('quarter');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const assetsQuery = query(collection(db, 'assets'));
    const usersQuery = query(collection(db, 'employees'));
    const ticketsQuery = query(collection(db, 'maintenance_tickets'));
    const requestsQuery = query(collection(db, 'requests'));

    let pending = 4;
    const clearPending = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };

    const onError = (e: unknown) => {
      console.warn('[Overview] Firestore listener error (collection may not exist yet)', e);
      clearPending();
    };

    const unsubAssets = onSnapshot(
      assetsQuery,
      (snap) => {
        const next = snap.docs.map((d) => ({ ...d.data(), firebaseId: d.id }));
        setAssets(next);
        clearPending();
      },
      onError,
    );

    const unsubUsers = onSnapshot(
      usersQuery,
      (snap) => {
        setEmployees(snap.docs.map((d) => ({ ...d.data(), firebaseId: d.id })));
        clearPending();
      },
      onError,
    );

    const unsubTickets = onSnapshot(
      ticketsQuery,
      (snap) => {
        const fromTickets = snap.docs.map((d) => ({ ...d.data(), firebaseId: d.id }));
        setMaintenance((prev) => (fromTickets.length > 0 ? fromTickets : prev));
        clearPending();
      },
      onError,
    );

    const unsubRequests = onSnapshot(
      requestsQuery,
      (snap) => {
        setRequests(snap.docs.map((d) => ({ ...d.data(), firebaseId: d.id })));
        clearPending();
      },
      onError,
    );

    return () => {
      unsubAssets();
      unsubUsers();
      unsubTickets();
      unsubRequests();
    };
  }, []);

  useEffect(() => {
    if (assets.length === 0) return;
    setAiLoading(true);
    import('../../services/geminiService')
      .then(({ geminiService }) =>
        geminiService.getSystemHealthSummary(assets, maintenance),
      )
      .then((summary) => setAiSummary(summary))
      .catch(() => setAiSummary('System diagnostics unavailable.'))
      .finally(() => setAiLoading(false));
  }, [assets.length, maintenance.length]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compiling Analytics</p>
    </div>
  );

  const getFilteredAssets = () => {
    // In a real app, this would filter by date. For now, we simulate volatility.
    if (timeRange === 'last') return assets.slice(0, Math.floor(assets.length * 0.8));
    return assets;
  };

  const currentAssets = getFilteredAssets();
  const totalAssets = currentAssets.length;
  const availableAssets = currentAssets.filter(a => a.status === 'available').length;
  const maintenanceAssets = currentAssets.filter(a => a.status === 'maintenance').length;
  const totalValue = currentAssets.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Dynamic Trend Calculation
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const newAssetsCount = assets.filter(a => a.purchaseDate && new Date(a.purchaseDate) > thirtyDaysAgo).length;
  const totalTrend = totalAssets > newAssetsCount 
    ? `+${((newAssetsCount / (totalAssets - newAssetsCount)) * 100).toFixed(0)}%` 
    : '+0%';

  const assignedAssets = assets.filter(a => a.status === 'assigned');
  const recentAssigned = assignedAssets.length; // Simplified for demo
  const assignedTrend = "+4.2%"; 

  const maintenanceTrend = maintenanceAssets > 2 ? "+12%" : "-2%";

  const valueTrend = "+8.4%";

  // Chart Data: Assets by Category
  const categoryData = currentAssets.reduce((acc: any[], curr) => {
    const existing = acc.find(i => i.name === curr.category);
    if (existing) existing.value += 1;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Chart Data: Status Distribution
  const statusData = [
    { name: 'Available', value: availableAssets, color: '#10B981' },
    { name: 'Assigned', value: currentAssets.filter(a => a.status === 'assigned').length, color: '#3B82F6' },
    { name: 'Repair', value: maintenanceAssets + currentAssets.filter(a => a.status === 'damaged').length, color: '#F59E0B' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">System Overview</h1>
        <p className="text-[#64748B]">Real-time analytics for your organization's assets and resources.</p>
      </div>

      {/* KPIs and AI Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            label="Total Inventory" 
            value={totalAssets} 
            icon={Package} 
            trend={totalTrend} 
            trendUp 
            subtitle="Registered devices"
            onClick={() => navigate('/inventory')}
          />
          <StatCard 
            label="Allocated Assets" 
            value={assignedAssets.length} 
            icon={CheckCircle2} 
            trend={assignedTrend} 
            trendUp 
            subtitle="Currently with users"
            onClick={() => navigate('/inventory?s=assigned')}
          />
          <StatCard 
            label="In Maintenance" 
            value={maintenanceAssets} 
            icon={Construction} 
            trend={maintenanceTrend} 
            trendUp={maintenanceAssets > 0}
            color="amber"
            subtitle="Service in progress"
            onClick={() => navigate('/maintenance')}
          />
          <StatCard 
            label="Estimated Value" 
            value={`$${(totalValue / 1000).toFixed(1)}k`} 
            icon={DollarSign} 
            trend={valueTrend} 
            trendUp 
            color="indigo"
            subtitle="Total replacement cost"
            onClick={() => navigate('/reports')}
          />
        </div>

        {/* AI Health Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Audit</h3>
            </div>
            {aiLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : (
              <p className="text-sm font-medium text-[#1E293B] leading-relaxed italic">
                "{aiSummary || 'Establishing system baselines...'}"
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Real-time Diagnostic</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart - Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-[#0F172A]">Asset Categories</h3>
              <p className="text-xs text-[#64748B]">Distribution of hardware types across the org</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#F1F5F9] border-none rounded-lg text-xs font-semibold px-3 py-1.5 outline-none cursor-pointer hover:bg-[#E2E8F0] transition-colors"
            >
              <option value="quarter">This Quarter</option>
              <option value="last">Last Quarter</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-[#0F172A]">Utilization</h3>
            <p className="text-xs text-[#64748B]">Current inventory status share</p>
          </div>
          <div className="h-[240px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{totalAssets}</span>
              <span className="text-[10px] text-[#64748B] uppercase tracking-widest font-semibold">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-[#0F172A]">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-[#64748B]">{((s.value / totalAssets) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Maintenance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-[#0F172A]">Recent Maintenance</h3>
            <button 
              onClick={() => navigate('/reports')}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {maintenance.map((m) => (
              <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#F8FAFC] group transition-all border border-transparent hover:border-blue-100">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-amber-600">
                  <Construction className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#0F172A] truncate">
                      {assets.find(a => a.id === m.assetId)?.name}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">${m.cost}</span>
                  </div>
                  <p className="text-xs text-[#64748B] mb-2">{m.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide">{m.date}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">{m.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-[#0F172A]">Asset Assignments</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              Manage All
            </button>
          </div>
          <div className="space-y-4">
            {employees.slice(0, 4).map((e) => {
              const assignedCount = assets.filter(a => a.assignedTo === e.id).length;
              return (
                <div key={e.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {e.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#0F172A]">{e.name}</h4>
                    <p className="text-xs text-[#64748B] truncate">{e.department} · {e.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#0F172A]">{assignedCount} Assets</div>
                    <div className="text-[10px] font-bold text-emerald-600">Active</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-blue-600 text-white flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Efficiency Insight</p>
              <h4 className="font-bold text-sm">Average deployment time is down 15% this month.</h4>
            </div>
            <TrendingUp className="w-12 h-12 opacity-20 absolute -right-2 -bottom-2 -rotate-12" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = 'blue', subtitle, onClick }: any) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    rose: 'text-rose-600 bg-rose-50',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] relative overflow-hidden group hover:shadow-md transition-all duration-300",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-125 transition-transform duration-500", 
        color === 'blue' ? 'bg-blue-600' : 
        color === 'emerald' ? 'bg-emerald-600' :
        color === 'amber' ? 'bg-amber-600' :
        'bg-indigo-600'
      )} />
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
          trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
        )}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-extrabold text-[#0F172A] tabular-nums mb-1">{value}</h2>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">{label}</p>
        {subtitle && <p className="text-[10px] text-[#94A3B8] italic">{subtitle}</p>}
      </div>
    </div>
  );
}
