import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Hash, MapPin, Tag, ShieldCheck, Box, Calendar, DollarSign, PenSquare, ChevronRight, Zap, Clock, ShieldAlert, Package, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/apiService';
import { format, addYears, isAfter, isBefore } from 'date-fns';

import { QRCodeSVG } from 'qrcode.react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  employees: any[];
  onSuccess: () => void;
}

export function AssetDetailModal({ isOpen, onClose, asset, employees, onSuccess }: AssetDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [empSearch, setEmpSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'finance' | 'tag'>('details');

  const getLifecycleData = (asset: any) => {
    if (!asset.purchaseDate) return null;
    
    const purchase = new Date(asset.purchaseDate);
    let lifespanYears = 4;
    const cat = asset.category?.toLowerCase() || '';
    if (cat.includes('laptop')) lifespanYears = 3;
    else if (cat.includes('monitor')) lifespanYears = 5;
    else if (cat.includes('mobile') || cat.includes('phone')) lifespanYears = 2;
    
    const eol = addYears(purchase, lifespanYears);
    const warranty = asset.warrantyUntil ? new Date(asset.warrantyUntil) : null;
    const now = new Date();
    
    const totalDuration = eol.getTime() - purchase.getTime();
    const elapsed = now.getTime() - purchase.getTime();
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
    return {
      purchase,
      warranty,
      eol,
      progress,
      isExpired: warranty ? isAfter(now, warranty) : false,
      isEndOfLife: isAfter(now, eol),
      lifespanYears
    };
  };

  const getDepreciationData = (asset: any) => {
    const lifecycle = getLifecycleData(asset);
    if (!lifecycle || !asset.value) return [];
    
    const initialValue = parseFloat(asset.value);
    const years = lifecycle.lifespanYears;
    const data = [];
    
    for (let i = 0; i <= years; i++) {
      const yearDate = addYears(lifecycle.purchase, i);
      // Straight line depreciation to 10% salvage value
      const salvageValue = initialValue * 0.1;
      const annualDepreciation = (initialValue - salvageValue) / years;
      const currentValue = Math.max(salvageValue, initialValue - (annualDepreciation * i));
      
      data.push({
        year: yearDate.getFullYear(),
        value: Math.round(currentValue),
        label: i === 0 ? 'Purchase' : `Year ${i}`
      });
    }
    return data;
  };

  useEffect(() => {
    if (asset) {
      setAssignedTo(asset.assignedTo ? asset.assignedTo.split(',') : []);
    }
  }, [asset]);

  const handleUpdateAssignment = async () => {
    setLoading(true);
    try {
      await api.put(`/api/assets/${asset.id}`, { assignedTo: assignedTo.length > 0 ? assignedTo.join(',') : null });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setIsEditing(false);
      }, 1000);
    } catch (err) {
      alert('Failed to update assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  const deprecationData = getDepreciationData(asset);

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
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">{asset.name}</h2>
                  <p className="text-xs text-[#64748B] font-medium">Asset ID: {asset.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl mr-4">
                  {[
                    { id: 'details', label: 'Details' },
                    { id: 'finance', label: 'Finance' },
                    { id: 'tag', label: 'QR Tag' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === tab.id 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-[#64748B] hover:text-[#0F172A]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-[#64748B] border border-transparent hover:border-[#E2E8F0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-6">Device Specs</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailItem icon={Hash} label="Serial Number" value={asset.serialNumber} isMono />
                        <DetailItem icon={Tag} label="Category" value={asset.category} />
                        <DetailItem icon={ShieldCheck} label="Condition" value={asset.condition || 'New'} />
                        <DetailItem icon={Calendar} label="Registered" value={format(new Date(asset.createdAt || Date.now()), 'MMM dd, yyyy')} />
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-[#E2E8F0]">
                      <h3 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Lifecycle Timeline
                      </h3>
                      {asset.purchaseDate ? (() => {
                        const data = getLifecycleData(asset);
                        if (!data) return null;
                        return (
                          <div className="space-y-6">
                            <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden relative">
                              <div 
                                className={cn("h-full bg-blue-600 rounded-full", data.isEndOfLife && "bg-rose-500")}
                                style={{ width: `${data.progress}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Est. Retirement</p>
                                <p className="text-sm font-bold text-[#0F172A]">{format(data.eol, 'MMM yyyy')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Lifespan</p>
                                <p className="text-sm font-bold text-[#0F172A]">{data.lifespanYears} Years</p>
                              </div>
                            </div>
                          </div>
                        );
                      })() : <p className="text-xs text-[#94A3B8] italic">No purchase data set</p>}
                    </div>
                  </div>

                  {/* Right Column: Assignment */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Ownership Management</h3>
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all",
                      isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50" : "bg-[#F8FAFC] border-[#E2E8F0]"
                    )}>
                      {!isEditing ? (
                        <div className="space-y-6">
                          {assignedTo.length > 0 ? (
                            <div className="space-y-3">
                              {assignedTo.map(id => {
                                const emp = employees.find(e => e.id === id);
                                if (!emp) return null;
                                return (
                                  <Link key={id} to={`/employees/${id}`} className="flex items-center gap-3 p-3 bg-white border border-[#E2E8F0] rounded-2xl hover:border-blue-300 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">{emp.name[0]}</div>
                                    <div>
                                      <p className="text-sm font-bold text-[#0F172A]">{emp.name}</p>
                                      <p className="text-[10px] text-[#64748B]">{emp.department}</p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm font-bold text-[#64748B]">Currently In Storage</p>
                              <p className="text-xs text-[#94A3B8] mt-1">Available for check-out</p>
                            </div>
                          )}
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="w-full py-3 bg-white border border-[#E2E8F0] text-blue-600 rounded-2xl text-xs font-bold hover:bg-white shadow-sm flex items-center justify-center gap-2"
                          >
                            <PenSquare className="w-4 h-4" />
                            Modify Custodian
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                            <input 
                              type="text" 
                              placeholder="Search employees..."
                              value={empSearch}
                              onChange={(e) => setEmpSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                            />
                          </div>
                          <div className="max-h-[240px] overflow-y-auto space-y-1 p-1 custom-scrollbar">
                            {employees
                              .filter(e => 
                                e.name.toLowerCase().includes(empSearch.toLowerCase()) || 
                                e.email.toLowerCase().includes(empSearch.toLowerCase()) ||
                                (e.department || '').toLowerCase().includes(empSearch.toLowerCase())
                              )
                              .map(emp => (
                                <label key={emp.id} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-blue-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{emp.name[0]}</div>
                                  <span className="text-xs font-bold text-[#0F172A]">{emp.name}</span>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={assignedTo.includes(emp.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setAssignedTo([...assignedTo, emp.id]);
                                    else setAssignedTo(assignedTo.filter(id => id !== emp.id));
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-xs font-bold text-[#64748B] hover:bg-slate-50 rounded-2xl">Cancel</button>
                            <button 
                              onClick={handleUpdateAssignment}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                            >
                              {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Change'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Original cost</p>
                      <p className="text-2xl font-bold text-emerald-700">${asset.value || 0}</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Depreciated</p>
                      <p className="text-2xl font-bold text-blue-700">-${Math.round((asset.value || 0) * 0.4)}</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-3xl">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Current Book</p>
                      <p className="text-2xl font-bold text-amber-700">${Math.round((asset.value || 0) * 0.6)}</p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-8">
                    <h3 className="text-sm font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Straight-Line Depreciation Projection
                    </h3>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={deprecationData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', background: '#fff' }}
                            labelStyle={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tag' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 flex flex-col items-center gap-8 group">
                    <div className="p-4 bg-white border-2 border-slate-900 rounded-3xl transition-transform group-hover:scale-105 duration-500">
                      <QRCodeSVG 
                        value={`assethub://asset/${asset.id}`} 
                        size={200}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#0F172A] tracking-tight">{asset.name}</p>
                      <p className="text-sm font-mono text-[#64748B] mt-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block">{asset.serialNumber}</p>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan to log</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                          <PenSquare className="w-5 h-5" />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit</span>
                      </div>
                    </div>
                  </div>
                  <button className="mt-12 flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                   Print Physical Label
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DetailItem({ icon: Icon, label, value, isMono = false, isStatus = false }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{label}</p>
        <p className={cn(
          "text-sm font-bold flex items-center",
          isMono ? "font-mono text-[#475569]" : "text-[#0F172A]",
          isStatus && "capitalize"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
