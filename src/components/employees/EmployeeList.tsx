import { useState, useEffect } from 'react';
import { api } from '../../lib/apiService';
import { Link } from 'react-router-dom';
import { 
  Users,
  Mail,
  Building2,
  Briefcase,
  ChevronRight,
  Plus,
  Package
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AddEmployeeModal } from './AddEmployeeModal';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../ui/Toast';
import { TableSkeleton } from '../ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

export function EmployeeList() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [e, a] = await Promise.all([
        api.get('/api/employees'),
        api.get('/api/assets')
      ]);
      setEmployees(e);
      setAssets(a);
    } catch (err) {
      toast('Personnel data could not be retrieved.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEmployeeAdded = () => {
    toast('New personnel record created correctly.', 'success');
    fetchData();
  };

  if (loading) return <TableSkeleton />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Staff Registry</h1>
          <p className="text-[#64748B]">Directory of personnel and their assigned organizational assets.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {employees.map((employee) => {
          const assignedAssets = assets.filter(a => a.assignedTo === employee.id);
          
          return (
            <motion.div 
              key={employee.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white rounded-[2rem] border border-[#E2E8F0] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/[0.02] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center text-2xl font-bold text-blue-700 shadow-sm transition-all group-hover:shadow-lg group-hover:border-blue-100 group-hover:-translate-y-1">
                    {employee.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-[#EDF2F7] rounded-lg">
                    <Building2 className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">{employee.department}</span>
                  </div>
                  {employee.systemRole && employee.systemRole !== 'user' && (
                    <span className={cn(
                      "mt-2 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest",
                      employee.systemRole === 'admin' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-indigo-100 text-indigo-700"
                    )}>
                      {employee.systemRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                <div>
                  <Link to={`/employees/${employee.id}`} className="block group/link">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-0.5 group-hover/link:text-blue-600 transition-colors truncate" title={employee.name}>{employee.name}</h3>
                  </Link>
                  <p className="text-sm text-[#94A3B8] font-bold uppercase tracking-tight flex items-center gap-1.5 truncate">
                    {employee.role}
                  </p>
                </div>

                <div className="pt-5 border-t border-[#F1F5F9] grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-[#B0BCCB] uppercase tracking-widest">Contact</span>
                    <span className="text-[11px] font-bold text-[#475569] truncate" title={employee.email}>{employee.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-bold text-[#B0BCCB] uppercase tracking-widest">Team Loc</span>
                    <span className="text-[11px] font-bold text-[#475569]">HQ - West</span>
                  </div>
                </div>

                <div className="pt-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5">
                      {assignedAssets.slice(0, 3).map((asset, i) => (
                        <div 
                          key={asset.id} 
                          className="w-10 h-10 rounded-xl border-4 border-white bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm transition-transform hover:scale-110 hover:z-10 group/asset"
                          title={asset.name}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                      ))}
                      {assignedAssets.length > 3 && (
                        <div className="w-10 h-10 rounded-xl border-4 border-white bg-[#F8FAFC] flex items-center justify-center text-[10px] font-bold text-[#64748B] shadow-sm">
                          +{assignedAssets.length - 3}
                        </div>
                      )}
                      {assignedAssets.length === 0 && (
                        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#0F172A]">{assignedAssets.length} Assets</span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Synced</span>
                    </div>
                  </div>
                  <Link 
                    to={`/employees/${employee.id}`}
                    className="w-10 h-10 bg-[#F8FAFC] hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center shadow-sm border border-[#E2E8F0] hover:border-blue-600 transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onSuccess={handleEmployeeAdded} 
      />
    </div>
  );
}
