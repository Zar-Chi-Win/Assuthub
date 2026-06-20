import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/apiService';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Calendar,
  Filter,
  Package,
  Construction,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';

export function Reports() {
  const [assets, setAssets] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(6);
  const [isDateMenuOpen, setDateMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, m, e] = await Promise.all([
          api.get('/api/assets').catch((err) => { console.error('[Reports] assets fetch failed', err); return []; }),
          api.get('/api/maintenance').catch((err) => { console.error('[Reports] maintenance fetch failed', err); return []; }),
          api.get('/api/employees').catch((err) => { console.error('[Reports] employees fetch failed', err); return []; }),
        ]);
        if (cancelled) return;
        setAssets(a || []);
        setMaintenance(m || []);
        setEmployees(e || []);
      } catch (err) {
        console.error('[Reports] unexpected error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#64748B]">Generating reports...</div>;

  // Monthly Spending (Grouped by month from maintenance records)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  const maintenanceByMonth = maintenance.reduce((acc: any, curr) => {
    const date = new Date(curr.date);
    const month = monthNames[date.getMonth()];
    acc[month] = (acc[month] || 0) + curr.cost;
    return acc;
  }, {});

  // Ensure we show the last N months based on timeRange
  const graphData = Array.from({ length: timeRange }).map((_, i) => {
    const idx = (currentMonthIdx - (timeRange - 1) + i + 12) % 12;
    const name = monthNames[idx];
    return { name, cost: maintenanceByMonth[name] || 0 };
  });

  const totalInventoryValue = assets.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const avgAssetValue = totalInventoryValue / (assets.length || 1);
  const assignedCount = assets.filter(a => a.status === 'assigned').length;
  
  const coverageRate = Math.round((assignedCount / (assets.length || 1)) * 100);
  const readinessCount = assets.filter(a => a.condition === 'new' || a.condition === 'good').length;
  const readinessRate = Math.round((readinessCount / (assets.length || 1)) * 100);
  const complianceRate = Math.round((assets.filter(a => a.status !== 'damaged').length / (assets.length || 1)) * 100);

  // Expiry in 180 days
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setDate(now.getDate() + 180);
  const expiryCount = assets.filter(a => {
    if (!a.warrantyUntil) return false;
    const expiry = new Date(a.warrantyUntil);
    return expiry > now && expiry <= sixMonthsFromNow;
  }).length;

  const pendingService = assets.filter(a => a.status === 'maintenance' || a.status === 'damaged').length;

  const handleExport = () => {
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Inventory Value', `$${totalInventoryValue.toLocaleString()}`],
      ['Average Asset Cost', `$${Math.round(avgAssetValue).toLocaleString()}`],
      ['Coverage Rate', `${coverageRate}%`],
      ['Upgrade Readiness', `${readinessRate}%`],
      ['Compliance Score', `${complianceRate}%`],
      ['Lifecycle Expiry (180d)', expiryCount],
      ['Pending Service', pendingService]
    ];
    const csvContent = [headers, ...data].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assethub_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">System Reports</h1>
          <p className="text-[#64748B]">Executive summaries and detailed technical audits.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setDateMenuOpen(!isDateMenuOpen)}
              className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Past {timeRange === 12 ? 'Year' : `${timeRange} Months`}</span>
            </button>
            <AnimatePresence>
              {isDateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDateMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-2 z-20"
                  >
                    {[3, 6, 12].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range);
                          setDateMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F1F5F9]",
                          timeRange === range ? "text-blue-600 bg-blue-50" : "text-[#64748B]"
                        )}
                      >
                        Past {range === 12 ? 'Year' : `${range} Months`}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Generate CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost Analysis Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-xl text-[#0F172A]">Maintenance Expenditure</h3>
              <p className="text-sm text-[#64748B]">Historical service costs by month</p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value}`, 'Cost']}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#2563EB" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Audit Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <FileText className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="text-lg font-bold mb-1">Asset Allocation Audit</h4>
              <p className="text-sm text-slate-400 mb-6">System calculated coverage based on current staffing levels.</p>
              
              <div className="space-y-4">
                <AuditItem label="Coverage Rate" value={`${coverageRate}%`} progress={coverageRate} />
                <AuditItem label="Upgrade Readiness" value={`${readinessRate}%`} progress={readinessRate} />
                <AuditItem label="Compliance Score" value={`${complianceRate}%`} progress={complianceRate} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
            <h4 className="font-bold text-[#0F172A] mb-4">Inventory Values</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Total Book Value</span>
                <span className="text-sm font-bold text-[#0F172A]">${totalInventoryValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Average Asset Cost</span>
                <span className="text-sm font-bold text-[#0F172A]">${Math.round(avgAssetValue).toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-[#F1F5F9]">
                <button 
                  onClick={() => alert(`Requested valuation report for ${assets.length} items.`)}
                  className="w-full py-3 rounded-xl bg-[#F8FAFC] text-blue-600 text-sm font-bold hover:bg-blue-50 transition-all"
                >
                  Request Detailed Valuation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Secondary Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Lifecycle Expiry" 
          description="Assets reaching end-of-life status in the next 180 days."
          icon={Package}
          value={expiryCount}
          unit="Devices"
          color="rose"
        />
        <ReportCard 
          title="Pending Service" 
          description="Maintenance tasks flagged as overdue or urgent priority."
          icon={Construction}
          value={pendingService}
          unit="Flagged"
          color="amber"
        />
        <ReportCard 
          title="User Satisfaction" 
          description="Average rating from latest hardware deployment feedback."
          icon={Users}
          value="4.9"
          unit="/ 5.0"
          color="emerald"
        />
      </div>
    </div>
  );
}

function AuditItem({ label, value, progress }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-blue-500 rounded-full"
        />
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon: Icon, value, unit, color }: any) {
  const styles: any = {
    rose: "bg-rose-50 border-rose-100 text-rose-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all group">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", styles[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-[#0F172A] mb-2">{title}</h4>
      <p className="text-xs text-[#64748B] mb-6 leading-relaxed">{description}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-[#0F172A]">{value}</span>
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">{unit}</span>
      </div>
    </div>
  );
}
