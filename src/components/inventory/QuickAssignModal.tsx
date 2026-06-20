import React, { useState, useMemo } from 'react';
import { X, Search, User, Check, Building2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/apiService';
import { useToast } from '../ui/Toast';

interface QuickAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  employees: any[];
  onSuccess: () => void;
}

export function QuickAssignModal({ isOpen, onClose, asset, employees, onSuccess }: QuickAssignModalProps) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredEmployees = useMemo(() => {
    if (!search) return employees.slice(0, 5);
    const s = search.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(s) || 
      e.email.toLowerCase().includes(s) || 
      (e.department || '').toLowerCase().includes(s)
    ).slice(0, 10);
  }, [employees, search]);

  const handleAssign = async (employeeId: string, employeeName: string) => {
    setLoading(employeeId);
    try {
      const currentAssigned = asset.assignedTo ? asset.assignedTo.split(',') : [];
      
      // If already assigned, don't re-assign unless it's a multi-user device? 
      // For simplicity, let's toggle or just add.
      let newAssigned;
      if (currentAssigned.includes(employeeId)) {
        newAssigned = currentAssigned.filter((id: string) => id !== employeeId);
      } else {
        newAssigned = [...currentAssigned, employeeId];
      }

      const status = newAssigned.length > 0 ? 'assigned' : 'available';

      await api.put(`/api/assets/${asset.id}`, { 
        assignedTo: newAssigned.length > 0 ? newAssigned.join(',') : null,
        status: status
      });
      
      toast(`Asset successfully ${newAssigned.includes(employeeId) ? 'assigned to' : 'removed from'} ${employeeName}`, 'success');
      onSuccess();
      if (newAssigned.length > 0) onClose(); // Auto-close on successful primary assignment
    } catch (err) {
      toast('Failed to update assignment', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUnassignAll = async () => {
    setLoading('unassign-all');
    try {
      await api.put(`/api/assets/${asset.id}`, { 
        assignedTo: null,
        status: 'available'
      });
      toast('Asset successfully unassigned from all users', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      toast('Failed to unassign asset', 'error');
    } finally {
      setLoading(null);
    }
  };

  if (!asset) return null;

  const assignedIds = asset.assignedTo ? asset.assignedTo.split(',') : [];

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
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Assign Device</h2>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">{asset.name}</p>
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
                  placeholder="Search employee name, email or dept..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl outline-none text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => {
                    const isAssigned = assignedIds.includes(emp.id);
                    const isProcessing = loading === emp.id;
                    
                    return (
                      <button 
                        key={emp.id}
                        disabled={!!loading}
                        onClick={() => handleAssign(emp.id, emp.name)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-3xl transition-all group border-2 border-transparent",
                          isAssigned ? "bg-blue-50/50 border-blue-100" : "hover:bg-[#F8FAFC] hover:border-[#F1F5F9]"
                        )}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                            isAssigned ? "bg-blue-600 text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50"
                          )}>
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">{emp.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                                <Building2 className="w-3 h-3" />
                                {emp.department}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                                <Briefcase className="w-3 h-3" />
                                {emp.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isAssigned && !isProcessing && (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isProcessing && (
                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                          )}
                          {!isAssigned && !isProcessing && (
                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Quick Assign
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[#64748B]">
                    <Search className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    <p className="text-sm font-bold">No employees found</p>
                    <p className="text-[10px]">Try searching for another name or department</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-between gap-4">
              <button 
                onClick={handleUnassignAll}
                disabled={!!loading || assignedIds.length === 0}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-30 uppercase tracking-widest"
              >
                {loading === 'unassign-all' ? 'Processing...' : 'Return to Storage'}
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
