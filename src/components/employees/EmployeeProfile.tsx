import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/apiService';
import { 
  ArrowLeft, 
  Mail, 
  Building2, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Package, 
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  Clock,
  History,
  UserMinus,
  Wrench,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { EditEmployeeModal } from './EditEmployeeModal';
import { AssetDetailModal } from '../inventory/AssetDetailModal';
import { QuickAssetSelectModal } from '../inventory/QuickAssetSelectModal';
import { MaintenanceHistoryModal } from '../inventory/MaintenanceHistoryModal';
import { useToast } from '../ui/Toast';

export function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [allEmployees, allAssets] = await Promise.all([
        api.get('/api/employees'),
        api.get('/api/assets')
      ]);
      
      const currentEmployee = allEmployees.find((e: any) => e.id === id);
      if (!currentEmployee) {
        navigate('/employees');
        return;
      }
      
      setEmployee(currentEmployee);
      setEmployees(allEmployees);
      setAllAssets(allAssets);
      setAssets(allAssets.filter((a: any) => a.assignedTo?.split(',').includes(id)));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const handleUnassign = async (asset: any) => {
    if (!confirm(`Unassign "${asset.name}" from ${employee?.name}?`)) return;
    const remaining = (asset.assignedTo || '')
      .split(',')
      .filter((x: string) => x && x !== id);
    const nextAssignedTo = remaining.length > 0 ? remaining.join(',') : null;
    const nextStatus = nextAssignedTo ? asset.status : 'available';
    try {
      await api.put(`/api/assets/${asset.id}`, {
        ...asset,
        assignedTo: nextAssignedTo,
        status: nextStatus,
      });
      toast(`Unassigned ${asset.name}`, 'success');
      await fetchData();
    } catch (err) {
      console.error('Unassign failed', err);
      toast('Failed to unassign asset', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[#64748B]">Loading profile...</div>;
  if (!employee) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/employees" className="inline-flex items-center gap-2 text-[#64748B] hover:text-blue-600 font-bold transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Registry</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setEditModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] hover:bg-gray-50 transition-all"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            Manage Permissions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/5 to-transparent" />
            
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center text-3xl font-extrabold text-blue-700 shadow-inner mb-6 border-4 border-white mx-auto">
                {employee.name[0]}
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] leading-tight mb-1">{employee.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {employee.department}
                </span>
              </div>

              <div className="space-y-4 pt-6 border-t border-[#F1F5F9]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-[#475569]">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Current Role</p>
                    <p className="text-sm font-bold text-[#475569]">{employee.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Workplace</p>
                    <p className="text-sm font-bold text-[#475569]">HQ - Section 4B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Security Clearance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={cn(
                    "w-5 h-5",
                    employee.systemRole === 'admin' ? "text-blue-400" : employee.systemRole === 'manager' ? "text-indigo-400" : "text-emerald-400"
                  )} />
                  <span className="text-sm font-bold">
                    {employee.systemRole === 'admin' ? 'System Administrator' : employee.systemRole === 'manager' ? 'Asset Manager' : 'Standard Member'}
                  </span>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]",
                  employee.systemRole === 'admin' ? "bg-blue-400 shadow-blue-400/50" : employee.systemRole === 'manager' ? "bg-indigo-400 shadow-indigo-400/50" : "bg-emerald-400 shadow-emerald-400/50"
                )} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                {employee.systemRole === 'admin' 
                  ? "User has full administrative control over the entire system, including infrastructure and settings." 
                  : employee.systemRole === 'manager'
                  ? "User is authorized to manage inventory, update asset states, and handle staff assignments."
                  : "User is authorized to handle internal assets and access restricted company hardware within their department."}
              </p>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">Assigned Assets</h3>
              <p className="text-sm text-[#64748B]">Currently under custody of this personnel.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setAssignModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Asset
              </button>
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-extrabold text-blue-700">{assets.length} Assets</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.length > 0 ? assets.map((asset) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={asset.id} 
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{asset.category}</p>
                    <p className="text-sm font-extrabold text-[#0F172A] mt-0.5">${asset.value}</p>
                  </div>
                </div>
                <h4 className="font-bold text-[#0F172A] mb-1 line-clamp-1">{asset.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md uppercase">
                    {asset.serialNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      asset.status === 'available' ? "bg-emerald-500" : asset.status === 'assigned' ? "bg-blue-500" : "bg-rose-500"
                    )} />
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">{asset.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setHistoryModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-amber-50 text-[#64748B] hover:text-amber-600 rounded-lg transition-all" title="Maintenance History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleUnassign(asset)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
                      title="Unassign from this employee"
                    >
                      <UserMinus className="w-3 h-3" />
                      Unassign
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setDetailModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 bg-[#F8FAFC] border border-[#E2E8F0] border-dashed rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#64748B]">No assets assigned</p>
                <p className="text-xs text-[#94A3B8] mt-1">This employee has no inventory in their custody.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <EditEmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        employee={employee}
        onSuccess={fetchData}
      />
      
      <AssetDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        employees={employees}
        onSuccess={fetchData}
      />

      <QuickAssetSelectModal 
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        employee={employee}
        assets={allAssets}
        onSuccess={fetchData}
      />

      <MaintenanceHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
      />
    </div>
  );
}
