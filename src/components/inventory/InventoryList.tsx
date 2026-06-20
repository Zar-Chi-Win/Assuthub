import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/apiService';
import { 
  Laptop, 
  Smartphone, 
  Monitor, 
  Printer, 
  Cpu, 
  Package, 
  MoreVertical, 
  ExternalLink, 
  History, 
  Filter, 
  ArrowUpDown,
  Trash2,
  Search,
  Command,
  Info,
  Calendar,
  Tag,
  ShieldAlert,
  X,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { addYears } from 'date-fns';
import { FilterSidebar } from './FilterSidebar';
import { BulkEditModal } from './BulkEditModal';
import { AssetDetailModal } from './AssetDetailModal';
import { QuickAssignModal } from './QuickAssignModal';
import { MaintenanceHistoryModal } from './MaintenanceHistoryModal';
import { AddAssetModal } from './AddAssetModal';
import { TableSkeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { geminiService } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

// Parser for smart search queries
function parseSearchQuery(query: string) {
  const result: {
    text: string;
    status: string | null;
    condition: string | null;
    category: string | null;
    after: string | null;
    before: string | null;
    vendor: string | null;
    location: string | null;
    minValue: number | null;
    maxValue: number | null;
  } = {
    text: '',
    status: null,
    condition: null,
    category: null,
    after: null,
    before: null,
    vendor: null,
    location: null,
    minValue: null,
    maxValue: null
  };

  if (!query) return result;

  const parts = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  
  parts.forEach((part: string) => {
    if (part.includes(':')) {
      const splitPart = part.split(':');
      let key = splitPart[0].toLowerCase();
      let value = splitPart[1];
      if (value) value = value.replace(/"/g, '').toLowerCase();

      if (key === 'status' || key === 's') result.status = value;
      else if (key === 'condition' || key === 'c') result.condition = value;
      else if (key === 'category' || key === 't') result.category = value;
      else if (key === 'vendor' || key === 'v') result.vendor = value;
      else if (key === 'location' || key === 'l') result.location = value;
      else if (key === 'value' || key === 'p') {
        if (value.startsWith('>')) result.minValue = parseFloat(value.substring(1));
        else if (value.startsWith('<')) result.maxValue = parseFloat(value.substring(1));
        else result.minValue = parseFloat(value);
      }
      else if (key === 'after' || key === 'a') result.after = value;
      else if (key === 'before' || key === 'b') result.before = value;
      else if (key === 'date' || key === 'd') {
        if (value && value.includes('..')) {
           const dateSplit = value.split('..');
           result.after = dateSplit[0];
           result.before = dateSplit[1];
        } else {
           result.after = value;
        }
      }
    } else {
      result.text += (result.text ? ' ' : '') + part.replace(/"/g, '').toLowerCase();
    }
  });

  return result;
}

const categoryIcons: Record<string, any> = {
  Laptop: Laptop,
  Mobile: Smartphone,
  Monitor: Monitor,
  Printer: Printer,
  Workstation: Cpu,
  Other: Package,
};

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  assigned: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  damaged: 'bg-rose-100 text-rose-700',
  retired: 'bg-slate-100 text-slate-700',
};

export function InventoryList() {
  const { isAdmin } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [] as string[],
    conditions: [] as string[],
    departments: [] as string[],
    locations: [] as string[]
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const { toast } = useToast();

  const categories = useMemo(() => Array.from(new Set(assets.map(a => a.category))), [assets]);
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))), [employees]);
  const locations = useMemo(() => Array.from(new Set(assets.map(a => a.location))), [assets]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [a, e] = await Promise.all([
        api.get('/api/assets'),
        api.get('/api/employees')
      ]);
      setAssets(a);
      setEmployees(e);
    } catch (err) {
      toast('Failed to reach server. Please try again.', 'error');
    } finally {
      // Slight delay for skeleton visibility
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/api/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
      toast(`${name} removed successfully`, 'success');
    } catch (err) {
      toast('Authorization denied or netork error.', 'error');
    }
  };

  const smartQuery = useMemo(() => parseSearchQuery(search), [search]);

  if (loading) return <TableSkeleton />;

  const filteredAssets = assets.filter(a => {
    // 1. Sidebar Tabs Filter
    const matchesStatusTab = filter === 'all' || a.status === filter;
    
    // 2. Smart Query Filter
    const matchesQueryStatus = !smartQuery.status || a.status.toLowerCase() === smartQuery.status;
    const matchesQueryCondition = !smartQuery.condition || a.condition.toLowerCase() === smartQuery.condition;
    const matchesQueryCategory = !smartQuery.category || a.category.toLowerCase() === smartQuery.category;
    const matchesQueryVendor = !smartQuery.vendor || (a.vendor || '').toLowerCase() === smartQuery.vendor;
    const matchesQueryLocation = !smartQuery.location || (a.location || '').toLowerCase().includes(smartQuery.location);
    const matchesValueMin = smartQuery.minValue === null || a.value >= smartQuery.minValue;
    const matchesValueMax = smartQuery.maxValue === null || a.value <= smartQuery.maxValue;
    
    // Date Filtering
    const pDate = a.purchaseDate ? new Date(a.purchaseDate) : null;
    const matchesAfter = !smartQuery.after || (pDate && pDate >= new Date(smartQuery.after));
    const matchesBefore = !smartQuery.before || (pDate && pDate <= new Date(smartQuery.before));

    // Text Search (Name, Serial, Model)
    const matchesText = !smartQuery.text || 
                        (a.name || '').toLowerCase().includes(smartQuery.text) || 
                        (a.serialNumber || '').toLowerCase().includes(smartQuery.text) ||
                        (a.model || '').toLowerCase().includes(smartQuery.text);
    
    // 3. Advanced Sidebar filters (Multi-select)
    const matchesCategory = advancedFilters.categories.length === 0 || advancedFilters.categories.includes(a.category);
    const matchesCondition = advancedFilters.conditions.length === 0 || advancedFilters.conditions.includes(a.condition);
    const matchesLocation = advancedFilters.locations.length === 0 || advancedFilters.locations.includes(a.location);
    
    const employee = a.assignedTo ? employees.find(e => e.id === a.assignedTo) : null;
    const matchesDepartment = advancedFilters.departments.length === 0 || (employee && advancedFilters.departments.includes(employee.department));

    return matchesStatusTab && 
           matchesQueryStatus && 
           matchesQueryCondition && 
           matchesQueryCategory && 
           matchesQueryVendor && 
           matchesQueryLocation &&
           matchesValueMin &&
           matchesValueMax &&
           matchesAfter && 
           matchesBefore && 
           matchesText && 
           matchesCategory && 
           matchesCondition && 
           matchesLocation && 
           matchesDepartment;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Serial', 'Status', 'Value', 'Location'];
    const rows = filteredAssets.map(a => [
      a.id, a.name, a.category, a.serialNumber, a.status, a.value, a.location
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assethub_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortOrder) return 0;
    return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedAssets.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkSuccess = () => {
    fetchData();
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete ${selectedIds.length} assets? This action cannot be undone.`)) return;
    
    try {
      await api.post('/api/assets/bulk-delete', { ids: selectedIds });
      handleBulkSuccess();
    } catch (err) {
      alert('Failed to delete assets');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Inventory</h1>
          <p className="text-[#64748B]">Manage and track all hardware assets in your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={cn(
              "flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-all",
              (advancedFilters.categories.length > 0 || advancedFilters.conditions.length > 0 || advancedFilters.departments.length > 0 || advancedFilters.locations.length > 0) && "border-blue-600 ring-2 ring-blue-50 ring-offset-0"
            )}
          >
            <Filter className={cn("w-4 h-4", (advancedFilters.categories.length > 0 || advancedFilters.conditions.length > 0 || advancedFilters.departments.length > 0 || advancedFilters.locations.length > 0) ? "text-blue-600" : "text-[#64748B]")} />
            <span>Filter</span>
            {(advancedFilters.categories.length + advancedFilters.conditions.length + advancedFilters.departments.length + advancedFilters.locations.length) > 0 && (
              <span className="bg-blue-600 text-white min-w-[16px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center">
                {advancedFilters.categories.length + advancedFilters.conditions.length + advancedFilters.departments.length + advancedFilters.locations.length}
              </span>
            )}
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        categories={categories}
        departments={departments}
        locations={locations}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['all', 'available', 'assigned', 'maintenance'].map((s) => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "p-4 rounded-2xl border transition-all text-left group",
              filter === s 
                ? "bg-white border-blue-600 shadow-sm" 
                : "bg-white/50 border-[#E2E8F0] hover:border-blue-300"
            )}
          >
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors",
              filter === s ? "text-blue-600" : "text-[#94A3B8]"
            )}>
              {s}
            </p>
            <p className="text-2xl font-bold text-[#0F172A]">
              {s === 'all' ? assets.length : assets.filter(a => a.status === s).length}
            </p>
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden relative">
        {/* Selection Toolbar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-16 bg-[#0F172A] z-30 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="p-1 hover:bg-white/10 rounded-md text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <p className="text-white text-sm font-bold">{selectedIds.length} items selected</p>
                  <p className="text-[#94A3B8] text-[10px] font-medium uppercase tracking-wider">Bulk Actions Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsBulkEditOpen(true)}
                  className="bg-white text-[#0F172A] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/90 transition-all shadow-lg active:scale-95"
                >
                  Bulk Edit Details
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button 
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-all font-sans"
                  onClick={handleBulkDelete}
                >
                  Delete Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search assets or use 'key:value'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E2E8F0] rounded-xl outline-none text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder:text-[#94A3B8]"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F1F5F9] rounded-md text-[#94A3B8]"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <AnimatePresence>
              {isSearchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-20 overflow-hidden"
                >
                  <div className="p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Command className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider">Smart Search Tools</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#94A3B8]">PRO TIPS</span>
                  </div>
                  <div className="p-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {[
                      { icon: Tag, label: 'status:available', desc: 'Filter by state' },
                      { icon: ShieldAlert, label: 'condition:poor', desc: 'Hardware health' },
                      { icon: Calendar, label: 'date:2024-01-01', desc: 'Purchase date' },
                      { icon: ArrowUpDown, label: 'value:>1000', desc: 'Price threshold' }
                    ].map((tip, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setSearch(tip.label);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                          <tip.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#0F172A] font-mono">{tip.label}</p>
                          <p className="text-[10px] text-[#64748B] mt-0.5">{tip.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">
                      <Info className="w-3.5 h-3.5" />
                      <span>Use 'date:START..END' for ranges</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-bold text-[#64748B]">
            <span className="shrink-0">Showing {filteredAssets.length} of {assets.length} assets</span>
            <div className="hidden sm:block w-px h-4 bg-[#E2E8F0]" />
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={cn("flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0", sortOrder && "text-blue-600")}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort by Cost {sortOrder ? `(${sortOrder.toUpperCase()})` : ''}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] border border-[#E2E8F0] rounded-2xl bg-white shadow-sm overflow-hidden">
          {sortedAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 relative group">
                <Package className="w-10 h-10 text-slate-300 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-100/20 rounded-3xl scale-0 group-hover:scale-100 transition-transform" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">No assets in this view</h3>
              <p className="text-sm text-[#64748B] max-w-[320px] text-center mt-2 leading-relaxed">
                Adjust your filters or search terms to locate specific hardware items in the repository.
              </p>
              <button 
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                  setAdvancedFilters({
                    categories: [],
                    conditions: [],
                    departments: [],
                    locations: []
                  });
                }}
                className="mt-8 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest"
              >
                Reset Parameters
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[900px]">
              <thead className="tech-grid-header">
                <tr>
                  <th className="py-4 pl-6 w-12 text-center border-r border-[#E2E8F0]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      checked={selectedIds.length === sortedAssets.length && sortedAssets.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="col-header text-left pl-6 border-r border-[#E2E8F0]">Asset Details</th>
                  <th className="col-header text-left pl-6 border-r border-[#E2E8F0]">Status</th>
                  <th className="col-header text-left pl-6 border-r border-[#E2E8F0]">Assignment</th>
                  <th className="col-header text-left pl-6 border-r border-[#E2E8F0]">Book Value</th>
                  <th className="col-header pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sortedAssets.map((asset, index) => {
                  const Icon = categoryIcons[asset.category] || Package;
                  const assignedIds = asset.assignedTo ? asset.assignedTo.split(',') : [];
                  const assignedEmployees = assignedIds.map(id => employees.find(e => e.id === id)).filter(Boolean);
                  
                  return (
                    <motion.tr 
                      key={asset.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={cn(
                        "hover:bg-[#F8FAFC] transition-all group border-b border-[#F1F5F9] last:border-0",
                        selectedIds.includes(asset.id) && "bg-blue-50/30"
                      )}
                    >
                      <td className="py-4 pl-6 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                          checked={selectedIds.includes(asset.id)}
                          onChange={() => toggleSelect(asset.id)}
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            asset.status === 'damaged' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">{asset.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="tech-mono text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded-md border border-[#F1F5F9] inline-block uppercase font-bold">
                                {asset.serialNumber}
                              </p>
                              {asset.purchaseDate && (
                                <div className="flex items-center gap-2">
                                  <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                                    {(() => {
                                      const purchase = new Date(asset.purchaseDate);
                                      let lifespanYears = 4;
                                      const cat = asset.category?.toLowerCase() || '';
                                      if (cat.includes('laptop')) lifespanYears = 3;
                                      else if (cat.includes('monitor')) lifespanYears = 5;
                                      else if (cat.includes('mobile') || cat.includes('phone')) lifespanYears = 2;
                                      const eol = addYears(purchase, lifespanYears);
                                      const progress = Math.min(Math.max(((new Date().getTime() - purchase.getTime()) / (eol.getTime() - purchase.getTime())) * 100, 0), 100);
                                      return (
                                        <div 
                                          className={cn("h-full rounded-full transition-all duration-500", progress > 90 ? "bg-rose-500" : "bg-blue-600")} 
                                          style={{ width: `${progress}%` }} 
                                        />
                                      );
                                    })()}
                                  </div>
                                  <Clock className="w-2.5 h-2.5 text-[#94A3B8]" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full",
                          statusColors[asset.status]
                        )}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {assignedEmployees.length > 0 ? (
                          <div className="flex items-center -space-x-2">
                            {assignedEmployees.slice(0, 3).map((emp) => (
                              <Link 
                                key={emp.id} 
                                to={`/employees/${emp.id}`}
                                className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700 shadow-sm relative group/avatar hover:z-10 transition-all hover:scale-110"
                                title={emp.name}
                              >
                                {emp.name[0]}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0F172A] text-white text-[10px] rounded pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-50 capitalize shadow-lg">
                                  {emp.name}
                                </div>
                              </Link>
                            ))}
                            {assignedEmployees.length > 3 && (
                              <div className="w-7 h-7 rounded-full bg-[#F1F5F9] border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#64748B] shadow-sm">
                                +{assignedEmployees.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 pl-6 border-r border-[#F1F5F9] border-dashed">
                        <span className="tech-mono font-bold text-[#0F172A] tabular-nums bg-slate-50 px-2 py-1 rounded border border-[#E2E8F0]">
                          ${asset.value?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => {
                              const desc = await geminiService.generateAssetDescription(asset);
                              toast(desc, 'info');
                            }}
                            className="p-2 hover:bg-slate-100 text-[#64748B] rounded-lg transition-all" title="AI Insight"
                          >
                            <Command className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsAssignOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all" title="Quick Assign"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDetailOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 text-[#64748B] hover:text-blue-600 rounded-lg transition-all" title="View details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsHistoryOpen(true);
                            }}
                            className="p-2 hover:bg-amber-50 text-[#64748B] hover:text-amber-600 rounded-lg transition-all" title="Maintenance history"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(asset.id, asset.name)}
                              className="p-2 hover:bg-rose-50 text-[#64748B] hover:text-rose-600 rounded-lg transition-all" title="Delete asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          )}
        </div>
      </div>
      <BulkEditModal 
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        selectedIds={selectedIds}
        locations={locations}
        employees={employees}
        onSuccess={handleBulkSuccess}
      />
      <AssetDetailModal 
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        employees={employees}
        onSuccess={fetchData}
      />
      <QuickAssignModal 
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        employees={employees}
        onSuccess={fetchData}
      />
      <MaintenanceHistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
      />
    </div>
  );
}
