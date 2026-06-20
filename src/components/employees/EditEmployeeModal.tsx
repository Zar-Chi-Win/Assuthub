import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Mail, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/apiService';
import { cn } from '../../lib/utils';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess: () => void;
}

export function EditEmployeeModal({ isOpen, onClose, employee, onSuccess }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    systemRole: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        role: employee.role || '',
        systemRole: employee.systemRole || 'user'
      });
    }
  }, [employee]);

  const systemRoles = [
    { id: 'user', name: 'Staff Member', desc: 'Standard view access', color: 'bg-slate-50' },
    { id: 'manager', name: 'Asset Manager', desc: 'Manage assets', color: 'bg-indigo-50' },
    { id: 'admin', name: 'System Admin', desc: 'Full access', color: 'bg-blue-50' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/employees/${employee.id}`, formData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to update employee', err);
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
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E2E8F0]"
          >
            {success ? (
              <div className="p-12 text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Profile Updated</h3>
                <p className="text-[#64748B]">Employee information has been synchronized.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F172A]">Edit Personnel File</h2>
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-1">Official Registry Record</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                    <X className="w-5 h-5 text-[#64748B]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                          <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                            placeholder="Employee Name"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Department</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                          <select
                            required
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold appearance-none"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Operations">Operations</option>
                            <option value="Human Resources">HR</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                          placeholder="email@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Job Title / Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                          placeholder="e.g. Senior Frontend Engineer"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                       <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">System Permissions</label>
                       <div className="grid grid-cols-3 gap-2">
                         {systemRoles.map((r) => (
                           <button
                             key={r.id}
                             type="button"
                             onClick={() => setFormData({...formData, systemRole: r.id})}
                             className={cn(
                               "px-3 py-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                               formData.systemRole === r.id 
                                 ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                                 : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                             )}
                           >
                             <span className="text-[10px] font-bold uppercase tracking-tight">{r.name}</span>
                             {formData.systemRole === r.id && (
                               <motion.div layoutId="editRoleCheck" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                 <CheckCircle2 className="w-3 h-3 fill-white text-blue-600" />
                               </motion.div>
                             )}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 bg-white border border-[#E2E8F0] text-[#64748B] rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all"
                    >
                      Discard Changes
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-1 py-4 bg-[#0F172A] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 shadow-lg shadow-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : null}
                      Save Personnel Data
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
