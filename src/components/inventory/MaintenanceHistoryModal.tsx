import React from 'react';
import { 
  X, 
  Clock, 
  Wrench, 
  Calendar, 
  DollarSign, 
  User,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface MaintenanceEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  performedBy: string;
}

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
}

export function MaintenanceHistoryModal({ isOpen, onClose, asset }: MaintenanceHistoryModalProps) {
  if (!asset) return null;

  // Mock maintenance history for demo
  const history: MaintenanceEntry[] = [
    { 
      id: '1', 
      date: '2024-03-15', 
      type: 'Routine', 
      description: 'Internal cleaning and thermal paste replacement.', 
      cost: 45, 
      performedBy: 'IT Support Team' 
    },
    { 
      id: '2', 
      date: '2023-11-20', 
      type: 'Repair', 
      description: 'Battery replacement due to degradation.', 
      cost: 120, 
      performedBy: 'Authorized Service Center' 
    },
    { 
      id: '3', 
      date: '2023-05-10', 
      type: 'Inspection', 
      description: 'Annual hardware calibration and safety check.', 
      cost: 0, 
      performedBy: 'External Inspection Co.' 
    }
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
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E2E8F0]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                   <Wrench className="w-6 h-6 relative z-10" />
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0F172A]">Service Lifecycle</h2>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Historical Logs for {asset.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#F1F5F9] rounded-xl text-[#94A3B8] transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-6 group">
                    {/* Timeline elements */}
                    {index < history.length - 1 && (
                      <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-dashed border-l-2 border-dashed border-[#E2E8F0]" />
                    )}
                    
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl bg-white border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                        entry.type === 'Repair' ? "border-rose-100 text-rose-600 bg-rose-50/30" : 
                        entry.type === 'Routine' ? "border-emerald-100 text-emerald-600 bg-emerald-50/30" : 
                        "border-blue-100 text-blue-600 bg-blue-50/30"
                      )}>
                        {entry.type === 'Repair' ? <CheckCircle2 className="w-5 h-5" /> : 
                         entry.type === 'Routine' ? <Wrench className="w-5 h-5" /> : 
                         <Clock className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="flex-1 bg-white border border-[#F1F5F9] rounded-3xl p-6 transition-all hover:shadow-md group-hover:border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            entry.type === 'Repair' ? "bg-rose-100 text-rose-700" : 
                            entry.type === 'Routine' ? "bg-emerald-100 text-emerald-700" : 
                            "bg-blue-100 text-blue-700"
                          )}>
                            {entry.type}
                          </span>
                          <h4 className="text-lg font-extrabold text-[#0F172A] mt-2 leading-tight">
                            {entry.description}
                          </h4>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                          <p className="text-sm font-black text-[#0F172A]">${entry.cost}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8]">
                            <Calendar className="w-3 h-3" />
                            {entry.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#F8FAFC]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#64748B]">Audit by {entry.performedBy}</span>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline uppercase tracking-widest">
                          Full Report
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Total Expenditure</p>
                  <p className="text-sm font-black text-[#0F172A]">$165.00</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                Close Logs
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
