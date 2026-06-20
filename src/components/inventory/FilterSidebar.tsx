import React, { useState } from 'react';
import { X, RotateCcw, Check, ChevronDown, Monitor, Laptop, Smartphone, Printer, Box, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: string[];
    conditions: string[];
    departments: string[];
    locations: string[];
  };
  setFilters: (filters: any) => void;
  categories: string[];
  departments: string[];
  locations: string[];
}

const categoryIcons: Record<string, any> = {
  Laptop: Laptop,
  Mobile: Smartphone,
  Monitor: Monitor,
  Printer: Printer,
  Workstation: Cpu,
  Other: Box,
};

export function FilterSidebar({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  categories,
  departments,
  locations 
}: FilterSidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleReset = () => {
    setFilters({
      categories: [],
      conditions: [],
      departments: [],
      locations: []
    });
  };

  const toggleMulti = (key: keyof typeof filters, value: string) => {
    const current = filters[key];
    if (current.includes(value)) {
      setFilters({ ...filters, [key]: current.filter(v => v !== value) });
    } else {
      setFilters({ ...filters, [key]: [...current, value] });
    }
  };

  const conditions = ['new', 'good', 'fair', 'poor'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-8 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Filters</h2>
                <p className="text-xs text-[#64748B] mt-1 font-medium">Narrow down your inventory view</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-white rounded-2xl text-[#64748B] hover:text-[#0F172A] shadow-sm hover:shadow transition-all border border-transparent hover:border-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Asset Category - Grid Layout */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Asset Category</label>
                  {filters.categories.length > 0 && (
                    <button 
                      onClick={() => setFilters({...filters, categories: []})}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => {
                    const Icon = categoryIcons[cat] || Box;
                    const isSelected = filters.categories.includes(cat);
                    return (
                      <button 
                        key={cat}
                        onClick={() => toggleMulti('categories', cat)}
                        className={cn(
                          "group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200",
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 ring-2 ring-blue-50 ring-offset-0" 
                            : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-blue-200 hover:bg-blue-50/30"
                        )}
                      >
                        <Icon className={cn("w-6 h-6 mb-2 transition-transform group-hover:scale-110", isSelected ? "text-white" : "text-[#94A3B8]")} />
                        <span className="text-xs font-bold truncate w-full text-center">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Hardware Condition - Segmented View */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Condition</label>
                  {filters.conditions.length > 0 && (
                    <button 
                      onClick={() => setFilters({...filters, conditions: []})}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(cond => {
                    const isSelected = filters.conditions.includes(cond);
                    return (
                      <button 
                        key={cond}
                        onClick={() => toggleMulti('conditions', cond)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                          isSelected 
                            ? "bg-[#0F172A] border-[#0F172A] text-white" 
                            : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#0F172A]"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span className="capitalize">{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Department & Location - Custom Multi-Select Dropdowns */}
              {[
                { label: 'Department', key: 'departments', options: departments, icon: Box },
                { label: 'Storage Location', key: 'locations', options: locations, icon: Box }
              ].map((group) => (
                <section key={group.key}>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-4">{group.label}</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {group.options.map(opt => {
                        const isSelected = filters[group.key as keyof typeof filters].includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleMulti(group.key as keyof typeof filters, opt)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                              isSelected
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                            )}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="p-8 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-4">
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-xs font-extrabold text-[#64748B] hover:bg-white/80 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-blue-600 rounded-2xl text-xs font-extrabold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
