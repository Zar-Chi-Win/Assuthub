import React, { useState } from 'react';
import { Package, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/apiService';
import Confetti from 'react-confetti';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Laptop',
    serialNumber: '',
    model: '',
    vendor: '',
    status: 'available',
    condition: 'new',
    value: 0,
    department: 'Engineering',
    location: 'HQ - Floor 1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate a unique ID for the asset
      const assetId = `ast_${Math.random().toString(36).substr(2, 9)}`;
      await api.post('/api/assets', { ...formData, id: assetId });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onSuccess();
        onClose();
      }, 2500);
      setFormData({
        name: '',
        category: 'Laptop',
        serialNumber: '',
        model: '',
        vendor: '',
        status: 'available',
        condition: 'new',
        value: 0,
        department: 'Engineering',
        location: 'HQ - Floor 1'
      });
    } catch (err) {
      alert('Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.15} />}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl relative overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Add New Asset</h2>
                  <p className="text-sm text-[#64748B]">Register a new device into inventory</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#F1F5F9] rounded-xl text-[#64748B] transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Asset Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. MacBook Pro 16"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-300 transition-all text-sm font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-300 transition-all text-sm font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Laptop</option>
                    <option>Mobile</option>
                    <option>Monitor</option>
                    <option>Printer</option>
                    <option>Workstation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Serial Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="SN-123456"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-300 transition-all text-sm font-medium"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Asset Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-300 transition-all text-sm font-medium"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Condition</label>
                  <select 
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-300 transition-all text-sm font-medium"
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
                  >
                    <option value="new">Brand New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Save Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
