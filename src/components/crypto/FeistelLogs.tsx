import { motion } from 'framer-motion';
import { ListTree, ArrowRight, MousePointerClick } from 'lucide-react';
import { SimStatus, FeistelLog } from './FeistelTypes';

interface FeistelLogsProps {
  logs: FeistelLog[];
  simStatus: SimStatus;
  currentRound: number;
  totalRounds: number;
  currentLHex: string;
  currentRHex: string;
  logEndRef: React.RefObject<HTMLDivElement | null>;
  jumpToLog: (roundNum: number) => void;
}

export default function FeistelLogs({ logs, simStatus, currentRound, totalRounds, currentLHex, currentRHex, logEndRef, jumpToLog }: FeistelLogsProps) {
  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden min-h-[400px]">
      <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <ListTree size={18} className="text-indigo-400" />
          <span className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">History Log</span>
        </div>
        <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg font-mono border border-indigo-500/30 shadow-inner hidden sm:block">
          Output: L{simStatus === 'completed' ? totalRounds : currentRound - 1} R{simStatus === 'completed' ? totalRounds : currentRound - 1}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#090c15] beautiful-scrollbar">
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-center flex-col gap-2">
            <span className="text-xs text-slate-500 italic px-6">Tekan "Next Step" atau "Autoplay" untuk memulai enkripsi.</span>
          </div>
        )}
        
        {logs.map((log) => {
          // Menandai log mana yang sedang diintip oleh user
          const isInspecting = currentRound === log.round && simStatus === 'idle';

          return (
            <motion.div 
              key={log.round} 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} 
              onClick={() => jumpToLog(log.round)}
              title="Klik untuk melihat sirkuit di putaran ini"
              // PERBAIKAN 1: Sudut lebih mengotak (rounded-lg) 
              className={`bg-slate-800/40 p-4 rounded-lg border flex flex-col gap-3 relative overflow-hidden group shrink-0 cursor-pointer hover:bg-slate-800/70 transition-all ${isInspecting ? 'border-indigo-500/50 bg-slate-800/60' : 'border-slate-700/50'}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${isInspecting ? 'bg-indigo-500' : 'bg-indigo-500/30 group-hover:bg-indigo-500'}`} />
              
              {/* Header Log */}
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2 pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">Round {log.round}</span>
                  <MousePointerClick size={12} className={`transition-opacity ${isInspecting ? 'opacity-100 text-indigo-400' : 'opacity-0 group-hover:opacity-100 text-slate-500'}`} />
                </div>
                <span className="text-[10px] bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700/80 text-amber-400 font-mono tracking-widest">
                  K: {log.K} | ƒ: {log.F}
                </span>
              </div>
              
              {/* PERBAIKAN 2: Layout 1 baris menyamping, di tengah, dan font lebih besar */}
              <div className="flex items-center justify-center gap-4 md:gap-6 font-mono text-xs md:text-sm py-1.5 pl-2">
                 <div className="flex items-center gap-1.5 md:gap-2">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">IN</span>
                   <span className="text-slate-300">L:<span className="text-indigo-300 font-black">{log.L_in}</span></span>
                   <span className="text-slate-300">R:<span className="text-emerald-300 font-black">{log.R_in}</span></span>
                 </div>
                 
                 <ArrowRight size={16} className="text-slate-500 shrink-0 mx-1" />

                 <div className="flex items-center gap-1.5 md:gap-2">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">OUT</span>
                   <span className="text-white">L:<span className="text-indigo-400 font-black">{log.L_out}</span></span>
                   <span className="text-white">R:<span className="text-emerald-400 font-black">{log.R_out}</span></span>
                 </div>
              </div>
            </motion.div>
          )
        })}

        {simStatus === 'completed' && logs.length > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-1 p-5 rounded-xl border border-emerald-500/50 bg-emerald-900/20 text-center flex flex-col gap-1.5 shadow-inner shrink-0">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Final Ciphertext (Hex)</span>
            <span className="text-3xl font-black text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              {logs[logs.length - 1].L_out}{logs[logs.length - 1].R_out}
            </span>
          </motion.div>
        )}

        <div ref={logEndRef} className="h-1" />
      </div>
    </div>
  );
}