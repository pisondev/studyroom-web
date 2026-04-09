'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;       // Tambahan untuk override w-64
  buttonClassName?: string; // Tambahan untuk override bg dan border
  iconSize?: number;        // Opsional untuk menyesuaikan ukuran icon
}

export default function CustomDropdown({ 
  options, value, onChange, disabled, 
  className = "w-64", // Tetap w-64 sebagai default agar tidak merusak halaman lain
  buttonClassName, 
  iconSize = 18 
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Style default dipakai hanya jika pemanggil tidak memasukkan buttonClassName
  const defaultBtnClass = `px-4 py-3 bg-slate-900 border ${isOpen ? 'border-indigo-500' : 'border-slate-700'} rounded-xl text-slate-200 hover:border-indigo-400`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${buttonClassName || defaultBtnClass}`}
      >
        <span className="font-medium truncate">{selectedOption?.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 ml-1">
          <ChevronDown size={iconSize} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[120px]"
          >
            {/* Tambahan Scrollbar jika data lebih dari 5 */}
            <div className="max-h-[200px] overflow-y-auto beautiful-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-600/20 transition-colors ${value === option.value ? 'bg-indigo-600/30 text-indigo-300 font-bold' : 'text-slate-300'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}