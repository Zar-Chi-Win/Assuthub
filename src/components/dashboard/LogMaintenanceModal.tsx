import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wrench } from 'lucide-react';
import { api } from '../../lib/apiService';
import { useToast } from '../ui/Toast';

interface LogMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assets: any[];
}

const TYPES = ['repair', 'inspection', 'upgrade'] as const;

export function LogMaintenanceModal({ isOpen, onClose, onSuccess, assets }: LogMaintenanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    type: 'repair' as typeof TYPES[number],
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    setAssetToMaintenance: true,
  });
  const { toast } = useToast();

  const reset = () => setForm({
    assetId: '',
    type: 'repair',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    setAssetToMaintenance: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetId || !form.description || !form.performedBy) {
      toast('Please fill all required fields.', 'error');
      return;
    }
    const costNum = Number(form.cost) || 0;
    if (costNum < 0) {
      toast('Cost must be zero or positive.', 'error');
      return;
    }

    setLoading(true);
    try {
      const recordId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await api.post('/api/maintenance', {
        id: recordId,
        assetId: form.assetId,
        type: form.type,
        description: form.description,
        cost: costNum,
        date: form.date,
        performedBy: form.performedBy,
      });

      if (form.setAssetToMaintenance) {
        const asset = assets.find((a) => a.id === form.assetId);
        if (asset) {
          await api.put(`/api/assets/${form.assetId}`, {
            ...asset,
            status: 'maintenance',
            lastMaintenance: form.date,
          });
        }
      }

      toast('Maintenance record logged.', 'success');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Log maintenance failed', err);
      toast('Failed to save maintenance record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Log Maintenance</h3>
                  <p className="text-xs text-[#64748B]">Record a repair, inspection, or upgrade.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Asset *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select an asset…</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.serialNumber || a.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as typeof TYPES[number] })}
                    className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 capitalize"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Description *</label>
                <input
                  required
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Battery replacement"
                  className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Cost (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0"
                    className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Performed By *</label>
                  <input
                    required
                    type="text"
                    value={form.performedBy}
                    onChange={(e) => setForm({ ...form, performedBy: e.target.value })}
                    placeholder="e.g. In-house IT"
                    className="mt-1.5 w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={form.setAssetToMaintenance}
                  onChange={(e) => setForm({ ...form, setAssetToMaintenance: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Put this asset into maintenance</p>
                  <p className="text-[10px] text-[#64748B]">Changes asset status to <span className="font-mono">maintenance</span>.</p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-60 transition-all"
                >
                  {loading ? 'Saving…' : 'Log Maintenance'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
