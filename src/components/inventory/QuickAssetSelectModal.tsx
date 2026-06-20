import React, { useState, useMemo } from 'react';
import { X, Search, Box, Check, Package, Tag, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/apiService';
import { useToast } from '../ui/Toast';

interface QuickAssetSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  assets: any[];
  onSuccess: () => void;
}

export function QuickAssetSelectModal({ isOpen, onClose, employee, assets, onSuccess }: QuickAssetSelectModalProps) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const availableAssets = useMemo(() => {
    // Only show available assets or ones not already assigned to this employee
    return assets.filter(a => a.status === 'available');
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (!search) return availableAssets.slice(0, 5);
    const s = search.toLowerCase();
    return availableAssets.filter(a => 
      a.name.toLowerCase().includes(s) || 
      (a.serialNumber || '').toLowerCase().includes(s) || 
      (a.category || '').toLowerCase().includes(s)
    ).slice(0, 10);
  }, [availableAssets, search]);

  const handleAssign = async (asset: any) => {
    setLoading(asset.id);
    try {
      const currentAssigned = asset.assignedTo ? asset.assignedTo.split(',') : [];
      if (currentAssigned.includes(employee.id)) {
         toast('Asset already assigned to this employee', 'info');
         return;
      }
      
      const newAssigned = [...currentAssigned, employee.id];

      await api.put(`/api/assets/${asset.id}`, { 
        assignedTo: newAssigned.join(','),
        status: 'assigned'
      });
      
      toast(`${asset.name} successfully assigned to ${employee.name}`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      toast('Failed to assign asset', 'error');
    } finally {
      setLoading(null);
    }
  };

  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#E2E8F0] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Assign Asset</h2>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">Pick available hardware for {employee.name}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-[#64748B] border border-transparent hover:border-[#E2E8F0] transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search by name, serial, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl outline-none text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => {
                    const isProcessing = loading === asset.id;
                    
                    return (
                      <button 
                        key={asset.id}
                        disabled={!!loading}
                        onClick={() => handleAssign(asset)}
                        className="w-full flex items-center justify-between p-4 rounded-3xl transition-all group border-2 border-transparent hover:bg-[#F8FAFC] hover:border-[#F1F5F9]"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] flex items-center justify-center group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
                            <Box className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">{asset.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
                                <Hash className="w-3 h-3" />
                                {asset.serialNumber}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                                <Tag className="w-3 h-3" />
                                {asset.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                          ) : (
                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Select Asset
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[#64748B]">
                    <Box className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    <p className="text-sm font-bold">No available assets found</p>
                    <p className="text-[10px]">Ensure assets are marked as 'available' in inventory</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
