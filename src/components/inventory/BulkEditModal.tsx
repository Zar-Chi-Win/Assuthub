import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/apiService';
import { useToast } from '../ui/Toast';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  locations: string[];
  employees: any[];
  onSuccess: () => void;
}

export function BulkEditModal({ isOpen, onClose, selectedIds, locations, employees, onSuccess }: BulkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const [updateFields, setUpdateFields] = useState({
    status: '',
    location: '',
    condition: '',
    assignedTo: [] as string[]
  });

  const [isAllEmployeesSelected, setIsAllEmployeesSelected] = useState(false);

  const toggleAllEmployees = () => {
    if (isAllEmployeesSelected) {
      setUpdateFields({ ...updateFields, assignedTo: [] });
    } else {
      setUpdateFields({ ...updateFields, assignedTo: employees.map(e => e.id) });
    }
    setIsAllEmployeesSelected(!isAllEmployeesSelected);
  };

  const handleEmployeeToggle = (id: string) => {
    const current = updateFields.assignedTo;
    const next = current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
    setUpdateFields({ ...updateFields, assignedTo: next });
    setIsAllEmployeesSelected(next.length === employees.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateFields.status === '' && updateFields.location === '' && updateFields.condition === '' && updateFields.assignedTo.length === 0) return;

    setLoading(true);
    try {
      // Create a payload with only selected fields
      const payload: any = {};
      if (updateFields.status) payload.status = updateFields.status;
      if (updateFields.location) payload.location = updateFields.location;
      if (updateFields.condition) payload.condition = updateFields.condition;

      if (updateFields.assignedTo.length > 0) {
        payload.assignedTo = updateFields.assignedTo.join(',');
        // Any explicit assignee forces status=assigned.
        payload.status = 'assigned';
      } else if (updateFields.status === 'assigned') {
        // Status "assigned" requires at least one assignee — block the save.
        toast('Pick at least one employee to set status "Assigned".', 'error');
        setLoading(false);
        return;
      } else if (updateFields.status && updateFields.status !== 'assigned') {
        // Moving to any non-assigned status — clear assignee to keep data consistent.
        payload.assignedTo = null;
      }

      await api.post('/api/assets/bulk-update', {
        ids: selectedIds,
        updates: payload
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setUpdateFields({ status: '', location: '', condition: '', assignedTo: [] });
        setIsAllEmployeesSelected(false);
      }, 1500);
    } catch (err) {
      alert('Failed to update assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0]"
          >
            {success ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Assets Updated</h3>
                <p className="text-[#64748B] mt-2">Successfully updated {selectedIds.length} assets.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">Bulk Edit Assets</h2>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">Updating {selectedIds.length} items</p>
                  </div>
                  <button type="button" onClick={onClose} className="p-2 hover:bg-white rounded-xl text-[#64748B] transition-all border border-transparent hover:border-[#E2E8F0]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      Changes will be applied to all selected assets. Leave fields blank to keep current values.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">New Status</label>
                      <select 
                        value={updateFields.status}
                        onChange={(e) => setUpdateFields({...updateFields, status: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                      >
                        <option value="">No change</option>
                        <option value="available">Available</option>
                        <option value="assigned">Assigned</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="damaged">Damaged</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">New Location</label>
                      <select 
                        value={updateFields.location}
                        onChange={(e) => setUpdateFields({...updateFields, location: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                      >
                        <option value="">No change</option>
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Hardware Condition</label>
                      <select 
                        value={updateFields.condition}
                        onChange={(e) => setUpdateFields({...updateFields, condition: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                      >
                        <option value="">No change</option>
                        <option value="new">New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Assignment (Assign to Team)</label>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden">
                        <div className="p-2 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase px-2">
                            {updateFields.assignedTo.length} selected
                          </span>
                          <button 
                            type="button"
                            onClick={toggleAllEmployees}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
                          >
                            {isAllEmployeesSelected ? 'Select None' : 'Select All'}
                          </button>
                        </div>
                        <div className="max-h-[160px] overflow-y-auto p-1 space-y-0.5">
                          {employees.map(emp => (
                            <label 
                              key={emp.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-white",
                                updateFields.assignedTo.includes(emp.id) && "bg-blue-50/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                  {emp.name[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0F172A]">{emp.name}</p>
                                  <p className="text-[10px] text-[#64748B]">{emp.department}</p>
                                </div>
                              </div>
                              <input 
                                type="checkbox"
                                checked={updateFields.assignedTo.includes(emp.id)}
                                onChange={() => handleEmployeeToggle(emp.id)}
                                className="w-4 h-4 rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500 transition-all"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-[#94A3B8] italic">
                        Note: Bulk assigning to multiple employees will share the asset between them.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-3">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-bold text-[#64748B] hover:bg-white transition-all rounded-xl border border-[#E2E8F0]"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={loading || Object.values(updateFields).every(v => v === '')}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Apply Changes</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
