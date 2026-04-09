import { motion, AnimatePresence } from 'framer-motion';
import { CornerRightDown } from 'lucide-react';

interface DESBitSplitterProps {
  inputBin: string;
  animStep: number;
  isValid: boolean;
  rowDec: number;
  colDec: number;
}

export default function DESBitSplitter({ inputBin, animStep, isValid, rowDec, colDec }: DESBitSplitterProps) {
  return (
    <div className="shrink-0 bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-6 shadow-2xl relative overflow-hidden flex-1 min-h-[300px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs tracking-widest">
          <CornerRightDown size={18} /> Pemecahan Bit
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 w-full relative">
        {isValid ? (
          <div className="flex flex-col items-center w-full relative">
            
            {/* Visual Box 6 Bit Asli (S-IN) - Diperbesar jadi w-10 h-10 / w-12 h-12 */}
            <div className="flex gap-2 md:gap-3 mb-6 w-full justify-center relative z-10">
              {inputBin.split('').map((bit, i) => {
                const isOuter = i === 0 || i === 5;
                return (
                  <div 
                    key={`in-${i}`} 
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-black text-xl md:text-2xl border-2 transition-all duration-500 ${
                      animStep >= 1 
                        ? isOuter ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {bit}
                  </div>
                )
              })}
            </div>

            {/* SVG GARIS PENGHUBUNG PRESISI */}
            <div className="relative w-full h-24 flex justify-center mb-4 z-0">
              <AnimatePresence>
                {animStep >= 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 w-full h-full">
                     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                       <path d="M 25 0 L 25 40 L 35 40 L 35 100" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse opacity-80" vectorEffect="non-scaling-stroke" />
                       <path d="M 75 0 L 75 20 L 45 20 L 45 100" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse opacity-80" vectorEffect="non-scaling-stroke" />
                       <path d="M 50 0 L 50 60 L 65 60 L 65 100" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse opacity-80" vectorEffect="non-scaling-stroke" />
                     </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hasil Pecahan (Baris & Kolom) */}
            <div className="flex gap-8 md:gap-12 w-full justify-center z-10 relative">
              
              {/* Blok Baris (Kiri) - Diperlebar dan kotak di-persegi-kan */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: animStep >= 2 ? 1 : 0.3, y: 0 }}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-[130px] md:w-[150px] ${animStep >= 2 ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800'}`}
              >
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Row (1 & 6)</span>
                <div className="flex gap-2 mb-3">
                  <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-indigo-900/50 border border-indigo-500 text-indigo-300 font-black text-xl">{inputBin[0]}</span>
                  <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-indigo-900/50 border border-indigo-500 text-indigo-300 font-black text-xl">{inputBin[5]}</span>
                </div>
                <div className="text-xs md:text-sm font-mono font-bold text-indigo-300 bg-indigo-950/50 px-4 py-1.5 rounded-lg border border-indigo-500/30 w-full text-center">
                  Dec = {rowDec}
                </div>
              </motion.div>

              {/* Blok Kolom (Kanan) - Diperlebar dan kotak di-persegi-kan */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: animStep >= 2 ? 1 : 0.3, y: 0 }}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-[180px] md:w-[220px] ${animStep >= 2 ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800'}`}
              >
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Col (2-5)</span>
                <div className="flex gap-1.5 md:gap-2 mb-3">
                  <span className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-lg bg-emerald-900/50 border border-emerald-500 text-emerald-300 font-black text-xl">{inputBin[1]}</span>
                  <span className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-lg bg-emerald-900/50 border border-emerald-500 text-emerald-300 font-black text-xl">{inputBin[2]}</span>
                  <span className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-lg bg-emerald-900/50 border border-emerald-500 text-emerald-300 font-black text-xl">{inputBin[3]}</span>
                  <span className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded-lg bg-emerald-900/50 border border-emerald-500 text-emerald-300 font-black text-xl">{inputBin[4]}</span>
                </div>
                <div className="text-xs md:text-sm font-mono font-bold text-emerald-300 bg-emerald-950/50 px-4 py-1.5 rounded-lg border border-emerald-500/30 w-full text-center">
                  Dec = {colDec}
                </div>
              </motion.div>

            </div>

          </div>
        ) : (
          <span className="text-slate-600 font-mono text-sm border border-slate-700 border-dashed p-4 rounded-xl">Menunggu input 6-bit valid...</span>
        )}
      </div>
    </div>
  );
}