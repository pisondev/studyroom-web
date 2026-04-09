import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { SBOX_1_DATA, SimStatus, SBoxCoord } from './DESTypes';

interface DESSBoxTableProps {
  animStep: number;
  simStatus: SimStatus;
  coord: SBoxCoord;
}

export default function DESSBoxTable({ animStep, simStatus, coord }: DESSBoxTableProps) {
  const { rDec, cDec, outDec, outBin } = coord;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden min-h-[400px]">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 shrink-0 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-amber-500" />
          <span className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Matriks S-Box 1 DES</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg font-mono border border-slate-700 hidden sm:block">
          Tabel HTML Standar
        </span>
      </div>
      
      {/* Area Konten dengan Scroll Bawaan */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#090c15] beautiful-scrollbar flex flex-col items-center">
         
         {/* PEMBUNGKUS TABEL MURNI */}
         <div className="w-full max-w-max overflow-x-auto pb-4">
            <table className="border-collapse border-spacing-0 select-none mx-auto">
              <thead>
                <tr>
                  {/* Pojok Kiri Atas Kosong */}
                  <th className="p-1 md:p-2 border border-transparent"></th> 
                  
                  {/* Header Kolom (c0 - c15) */}
                  {Array.from({length: 16}).map((_, c) => {
                     const isColActive = animStep >= 3 && c === cDec;
                     return (
                       <th 
                         key={`th-c-${c}`} 
                         className={`p-1.5 md:p-2 text-[10px] md:text-xs font-bold border transition-colors ${
                           isColActive ? 'bg-emerald-600 border-emerald-400 text-white shadow-md' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                         }`}
                       >
                         c{c}
                       </th>
                     )
                  })}
                </tr>
              </thead>
              <tbody>
                {SBOX_1_DATA.map((rowArr, r) => {
                   const isRowActive = animStep >= 3 && r === rDec;
                   return (
                     <tr key={`tr-${r}`}>
                       
                       {/* Header Baris (r0 - r3) */}
                       <th 
                         className={`p-1.5 md:p-2 text-[10px] md:text-xs font-bold border transition-colors ${
                           isRowActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                         }`}
                       >
                         r{r}
                       </th>

                       {/* Sel-Sel Data (0 - 15) */}
                       {rowArr.map((val, c) => {
                         const isColActive = animStep >= 3 && c === cDec;
                         const isIntersection = isRowActive && isColActive;
                         const isHighlightLine = isRowActive || isColActive;

                         return (
                           <td 
                             key={`td-${r}-${c}`} 
                             className={`p-1.5 md:p-2.5 text-center font-mono text-sm md:text-base font-bold transition-all duration-300 border ${
                               isIntersection ? 'bg-rose-600 border-rose-400 text-white z-20' : 
                               isHighlightLine ? 'bg-slate-700 border-slate-500 text-white z-10' : 
                               animStep >= 3 ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40' : 
                               'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                             }`}
                           >
                             <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 mx-auto ${isIntersection ? 'scale-125 ring-2 ring-rose-400 rounded-md' : ''}`}>
                               {val}
                             </div>
                           </td>
                         )
                       })}
                     </tr>
                   )
                })}
              </tbody>
            </table>
         </div>

         {/* KOTAK OUTPUT (S-OUT) */}
         <div className="w-full flex justify-center mt-4">
           <AnimatePresence>
             {animStep >= 4 && (
               <motion.div 
                 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-gradient-to-br from-rose-900/30 to-slate-900 border border-rose-500/40 px-6 py-4 md:px-8 md:py-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 md:gap-10 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
               >
                 <div className="flex flex-col items-center sm:border-r border-rose-500/30 sm:pr-8 pb-3 sm:pb-0 border-b sm:border-b-0 w-full sm:w-auto">
                   <span className="text-[10px] md:text-xs font-bold text-rose-400/80 uppercase tracking-widest mb-1.5">Decimal Out</span>
                   <span className="text-4xl md:text-5xl font-black text-white drop-shadow-md">{outDec}</span>
                 </div>
                 
                 <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                   <span className="text-[10px] md:text-xs font-bold text-rose-400/80 uppercase tracking-widest mb-2">4-Bit Binary Out</span>
                   <div className="flex gap-2">
                     {outBin.split('').map((b, i) => (
                       <span key={`out-b-${i}`} className="w-10 h-12 md:w-12 md:h-14 flex items-center justify-center rounded-xl bg-rose-600/20 border border-rose-500/60 text-rose-300 font-black text-2xl md:text-3xl shadow-inner">
                         {b}
                       </span>
                     ))}
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>

      </div>
    </div>
  );
}