"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

type DataType = 'Nominal' | 'Ordinal' | 'Interval' | 'Ratio' | null;

interface DataItem {
  id: string;
  label: string;
  correctType: DataType;
  explanation: string;
}

const rawData: DataItem[] = [
  { id: '1', label: 'Nomor Induk Mahasiswa (NIM)', correctType: 'Nominal', explanation: 'Hanya label pembeda, tidak punya nilai matematis.' },
  { id: '2', label: 'Rating Hotel (Bintang 1-5)', correctType: 'Ordinal', explanation: 'Punya urutan tingkat, tapi jarak antar bintang tidak terukur pasti.' },
  { id: '3', label: 'Suhu 30° Celcius', correctType: 'Interval', explanation: 'Ada jarak pasti, tapi tidak punya nilai nol mutlak (0°C bukan berarti tidak ada suhu).' },
  { id: '4', label: 'Harga Barang Rp 50.000', correctType: 'Ratio', explanation: 'Bisa dihitung matematis dan punya nol mutlak (Rp 0 berarti gratis).' },
];

const categories: DataType[] = ['Nominal', 'Ordinal', 'Interval', 'Ratio'];

export default function DataTypesInteractive() {
  const [items, setItems] = useState<DataItem[]>(rawData);
  const [placedItems, setPlacedItems] = useState<{ item: DataItem; placedIn: DataType; isCorrect: boolean }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedItemId(id === selectedItemId ? null : id);
  };

  const handlePlace = (category: DataType) => {
    if (!selectedItemId) return;

    const itemToPlace = items.find(i => i.id === selectedItemId);
    if (!itemToPlace) return;

    const isCorrect = itemToPlace.correctType === category;

    setPlacedItems(prev => [...prev, { item: itemToPlace, placedIn: category, isCorrect }]);
    setItems(prev => prev.filter(i => i.id !== selectedItemId));
    setSelectedItemId(null);
  };

  const handleReset = () => {
    setItems(rawData);
    setPlacedItems([]);
    setSelectedItemId(null);
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
      
      {/* Area Bank Data (Pilih Data di sini) */}
      <div className="min-h-[80px]">
        {items.length > 0 ? (
          <p className="text-slate-400 text-sm mb-3 text-center">Pilih data di bawah ini, lalu klik kotak kategori yang sesuai:</p>
        ) : (
          <p className="text-emerald-400 text-sm font-bold mb-3 text-center">Semua data telah diklasifikasikan! 🎉</p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <AnimatePresence>
            {items.map((item) => (
              <motion.button
                key={item.id}
                layoutId={`item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedItemId === item.id 
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Area Drop Zones (Kategori) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {categories.map((cat) => (
          <div 
            key={cat} 
            onClick={() => handlePlace(cat)}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[120px] ${
              selectedItemId 
                ? 'border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                : 'border-slate-700 bg-slate-800/30'
            }`}
          >
            <h3 className="font-bold text-slate-300 mb-4">{cat}</h3>
            
            <div className="flex flex-col gap-2 w-full">
              {placedItems.filter(p => p.placedIn === cat).map((p) => (
                <motion.div 
                  key={p.item.id}
                  layoutId={`item-${p.item.id}`}
                  className={`text-xs p-2 rounded border w-full text-center relative group ${
                    p.isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {p.isCorrect ? <Check size={14}/> : <X size={14}/>} {p.item.label}
                  </span>
                  
                  {/* Tooltip Penjelasan */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-slate-200 p-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-slate-700">
                    {p.item.explanation}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleReset} className="mt-4 text-xs text-slate-500 hover:text-slate-300 mx-auto w-max transition-colors">
        Reset Simulasi
      </button>
    </div>
  );
}