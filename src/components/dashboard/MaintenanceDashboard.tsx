import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiService';
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Package,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Command
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { geminiService } from '../../services/geminiService';
import { useToast } from '../ui/Toast';
import { Skeleton } from '../ui/Skeleton';
import { LogMaintenanceModal } from './LogMaintenanceModal';

export function MaintenanceDashboard() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [maintenanceData, assetsData] = await Promise.all([
        api.get('/api/maintenance'),
        api.get('/api/assets')
      ]);
      setMaintenanceRecords(maintenanceData);
      setAssets(assetsData);
    } catch (err) {
      console.error('Failed to fetch maintenance data', err);
      toast('Connection error, using offline data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAIPredictions = async () => {
    setIsPredicting(true);
    try {
      const results = await geminiService.predictMaintenance(assets, maintenanceRecords);
      setPredictions(results);
      toast('Intelligence scan complete', 'success');
    } catch (err) {
      toast('AI Assistant is currently unavailable', 'error');
    } finally {
      setIsPredicting(false);
    }
  };

  const getAssetDetails = (assetId: string) => {
    return assets.find(a => a.id === assetId) || { name: 'Unknown Asset', serialNumber: 'N/A' };
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const asset = getAssetDetails(record.assetId);
    return (
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalMaintenanceCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Maintenance Management</h1>
          <p className="text-[#64748B] mt-1 font-medium">Monitor service records and equipment health</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            <Wrench className="w-4 h-4" />
            Log Maintenance
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Total Records</p>
              <p className="text-2xl font-bold text-[#0F172A]">{maintenanceRecords.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Total Cost</p>
              <p className="text-2xl font-bold text-[#0F172A]">${totalMaintenanceCost.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Scheduled</p>
              <p className="text-2xl font-bold text-[#0F172A]">0</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Predictions */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4">
          <div className="w-24 h-24 bg-blue-500 blur-[80px] opacity-20" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Command className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Predictive Maintenance</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md">Gemini AI analyzes usage patterns and hardware lifecycles to suggest priority service.</p>
          </div>
          
          <button 
            onClick={getAIPredictions}
            disabled={isPredicting}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
              isPredicting 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-blue-500/20"
            )}
          >
            {isPredicting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                <span>Analyzing Fleet...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Run Intelligence Scan</span>
              </>
            )}
          </button>
        </div>

        {predictions.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {predictions.map((p, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{p.assetName}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    p.priority === 'High' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {p.priority}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-200 mb-1">{p.predictedIssue}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.recommendation}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Asset Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Type & Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Cost</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRecords.length > 0 ? filteredRecords.map((record) => {
                const asset = getAssetDetails(record.assetId);
                return (
                  <tr key={record.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{asset.name}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{asset.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1",
                          record.type === 'repair' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                          record.type === 'upgrade' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        )}>
                          {record.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#0F172A] font-medium max-w-xs">{record.description}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-[#0F172A]">
                      ${record.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-sm text-[#64748B] font-medium">{record.performedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/inventory?q=${asset.serialNumber}`}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg inline-flex items-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No maintenance records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogMaintenanceModal
        isOpen={isLogModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSuccess={() => fetchData()}
        assets={assets}
      />
    </div>
  );
}
