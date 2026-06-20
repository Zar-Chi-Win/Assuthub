import React, { useState } from 'react';
import { Users, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/apiService';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    systemRole: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate a unique ID for the employee
      const employeeId = `emp_${Math.random().toString(36).substr(2, 9)}`;
      await api.post('/api/employees', { ...formData, id: employeeId });
      onSuccess();
      onClose();
      setFormData({
        name: '',
        email: '',
        role: '',
        department: 'Engineering',
        systemRole: 'user'
      });
    } catch (err) {
      alert('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const systemRoles = [
    { id: 'user', name: 'Staff Member', desc: 'Standard view & assignment access', color: 'bg-slate-50 border-slate-200 text-slate-700' },
    { id: 'manager', name: 'Asset Manager', desc: 'Can manage assets & inventory', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'admin', name: 'System Admin', desc: 'Full administrative privileges', color: 'bg-blue-50 border-blue-200 text-blue-700' }
  ];

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F172A]">Onboard New Staff</h2>
                    <p className="text-sm font-medium text-[#64748B]">Create a professional profile and assign system roles.</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[#E2E8F0] rounded-xl text-[#64748B] transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
 
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {/* Identification Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Personal Identity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Jane Cooper"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 ml-1">Professional Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="jane@company.com"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Work Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 ml-1">Job Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Software Engineer"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 ml-1">Department</label>
                      <select 
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-semibold appearance-none"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                      >
                        <option>Engineering</option>
                        <option>Product</option>
                        <option>Design</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>Human Resources</option>
                        <option>Operations</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Access Roles Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em]">System Permissions</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Required</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {systemRoles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFormData({...formData, systemRole: r.id})}
                        className={cn(
                          "flex flex-col p-4 rounded-2xl border text-left transition-all relative overflow-hidden group",
                          formData.systemRole === r.id 
                            ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100" 
                            : "hover:bg-slate-50 border-slate-200"
                        )}
                      >
                        {formData.systemRole === r.id && (
                          <motion.div layoutId="activeRole" className="absolute top-2 right-2 text-white">
                            <CheckCircle2 className="w-4 h-4 fill-white text-blue-600" />
                          </motion.div>
                        )}
                        <span className={cn(
                          "text-xs font-bold mb-1",
                          formData.systemRole === r.id ? "text-white" : "text-[#0F172A]"
                        )}>{r.name}</span>
                        <span className={cn(
                          "text-[10px] leading-snug",
                          formData.systemRole === r.id ? "text-blue-100" : "text-[#64748B]"
                        )}>{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10 mt-10 border-t border-[#F1F5F9]">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-2xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-[#0F172A] text-white text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Registration
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

// Add this helper if it's not imported or available
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
