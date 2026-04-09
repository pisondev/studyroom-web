import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

interface FeistelCircuitProps {
  currentRound: number;
  totalRounds: number;
  animStep: number;
  currentLHex: string;
  currentRHex: string;
  roundKeyHex: string;
  fOutputHex: string;
  nextRHex: string;
}

export default function FeistelCircuit(props: FeistelCircuitProps) {
  const { currentRound, totalRounds, animStep, currentLHex, currentRHex, roundKeyHex, fOutputHex, nextRHex } = props;

  return (
    <div className="shrink-0 bg-[#090c15] border border-slate-700/50 rounded-3xl p-5 flex flex-col relative shadow-2xl">
      <div className="flex justify-between items-center z-10 border-b border-slate-800 pb-4 mb-4">
         <div className="flex items-center gap-2 text-indigo-400">
           <Cpu size={16} />
           <span className="font-bold uppercase tracking-widest text-[11px]">Sirkuit Feistel</span>
         </div>
         <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-md font-mono font-bold border border-slate-700">
           Round {currentRound > totalRounds ? totalRounds : currentRound}/{totalRounds}
         </span>
      </div>

      <div className="w-full flex justify-center overflow-x-auto py-4 beautiful-scrollbar">
        <div style={{ position: 'relative', width: '360px', height: '480px', flexShrink: 0 }}>
          
          <svg width="360" height="480" viewBox="0 0 360 480" fill="none" strokeWidth="3" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
            {/* Jalur Dasar (Abu-abu) */}
            <path d="M 80 60 L 80 280" stroke="rgba(100, 116, 139, 0.4)" strokeLinecap="round" />
            <path d="M 280 60 L 280 340 L 80 370 L 80 400" stroke="rgba(100, 116, 139, 0.4)" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 280 190 L 220 190" stroke="rgba(100, 116, 139, 0.4)" strokeLinecap="round" />
            <path d="M 290 190 L 220 190" stroke="rgba(100, 116, 139, 0.4)" strokeLinecap="round" />
            <path d="M 140 190 L 80 190 L 80 280" stroke="rgba(100, 116, 139, 0.4)" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 80 300 L 80 340 L 280 370 L 280 400" stroke="rgba(100, 116, 139, 0.4)" strokeLinejoin="round" strokeLinecap="round" />

            {/* Jalur Aktif/Animasi */}
            <motion.path d="M 80 60 L 80 280" stroke="#6366f1" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" animate={{ strokeDashoffset: animStep >= 3 ? 0 : 1000 }} transition={{ duration: 0.5 }} />
            <motion.path d="M 280 60 L 280 340 L 80 370 L 80 400" stroke="#64748b" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" animate={{ strokeDashoffset: animStep >= 5 ? 0 : 1000 }} transition={{ duration: 0.5 }} />
            <motion.path d="M 280 190 L 220 190" stroke="#10b981" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="100" animate={{ strokeDashoffset: animStep >= 1 ? 0 : 100 }} transition={{ duration: 0.3 }} />
            <motion.path d="M 290 190 L 220 190" stroke="#f59e0b" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="100" animate={{ strokeDashoffset: animStep >= 1 ? 0 : 100 }} transition={{ duration: 0.3 }} />
            <motion.path d="M 140 190 L 80 190 L 80 280" stroke="#f43f5e" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="500" strokeDashoffset="500" animate={{ strokeDashoffset: animStep >= 3 ? 0 : 500 }} transition={{ duration: 0.5 }} />
            <motion.path d="M 80 300 L 80 340 L 280 370 L 280 400" stroke="#10b981" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" animate={{ strokeDashoffset: animStep >= 5 ? 0 : 1000 }} transition={{ duration: 0.5 }} />
          </svg>

          {/* NODE 1: L_in */}
          <div style={{ position: 'absolute', top: '0px', left: '40px', width: '80px', height: '60px' }} className="flex flex-col items-center justify-end gap-1.5 z-10">
            <span className="text-[10px] font-bold text-indigo-400 leading-none">L{currentRound-1}</span>
            <div className="w-full h-[40px] shrink-0 bg-slate-800 border-2 border-indigo-500/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="font-mono font-bold text-white tracking-widest">{currentLHex}</span>
            </div>
          </div>

          {/* NODE 2: R_in */}
          <div style={{ position: 'absolute', top: '0px', left: '240px', width: '80px', height: '60px' }} className="flex flex-col items-center justify-end gap-1.5 z-10">
            <span className="text-[10px] font-bold text-emerald-400 leading-none">R{currentRound-1}</span>
            <div className="w-full h-[40px] shrink-0 bg-slate-800 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <span className="font-mono font-bold text-white tracking-widest">{currentRHex}</span>
            </div>
          </div>

          {/* NODE 3: Subkey (K_i) */}
          <div style={{ position: 'absolute', top: '150px', left: '290px', width: '60px', height: '60px' }} className="flex flex-col items-center justify-end gap-1.5 z-10">
            <span className="text-[10px] font-bold text-amber-500 leading-none">K{currentRound <= totalRounds ? currentRound : totalRounds}</span>
            <div className={`w-full h-[40px] shrink-0 bg-slate-900 border-2 rounded-xl flex items-center justify-center transition-all duration-300 ${animStep >= 1 ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-slate-700'}`}>
              <span className={`font-mono font-bold text-sm tracking-widest ${animStep >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                {roundKeyHex}
              </span>
            </div>
          </div>

          {/* NODE 4: Fungsi F */}
          <div style={{ position: 'absolute', top: '160px', left: '140px', width: '80px', height: '60px' }} className="z-20">
            <div className={`w-full h-full bg-slate-900 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${animStep >= 2 ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-110' : 'border-slate-700'}`}>
              <span className="text-2xl font-black text-rose-500 leading-none">ƒ</span>
              <span className={`text-[10px] font-mono mt-1 leading-none ${animStep >= 2 ? 'text-white' : 'text-transparent'}`}>{fOutputHex}</span>
            </div>
          </div>

          {/* NODE 5: XOR Operator */}
          <div style={{ position: 'absolute', top: '260px', left: '60px', width: '40px', height: '40px' }} className="z-20">
            <div className={`w-full h-full rounded-full border-2 bg-slate-900 flex items-center justify-center transition-all duration-300 ${animStep >= 4 ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-125' : 'border-slate-600'}`}>
              <span className={`text-xl font-bold ${animStep >= 4 ? 'text-cyan-400' : 'text-slate-500'}`}>⊕</span>
            </div>
          </div>

          {/* NODE 6: L_out */}
          <div style={{ position: 'absolute', top: '380px', left: '20px', width: '120px', height: '60px' }} className="flex flex-col items-center justify-start gap-1.5 z-10">
            <div className={`w-[80px] h-[40px] shrink-0 bg-slate-800 border-2 rounded-xl flex items-center justify-center transition-all duration-300 ${animStep >= 5 ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-slate-700'}`}>
              <span className={`font-mono font-bold tracking-widest ${animStep >= 5 ? 'text-white' : 'text-slate-600'}`}>{animStep >= 5 ? currentRHex : '----'}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 leading-none">L{currentRound}=R{currentRound-1}</span>
          </div>

          {/* NODE 7: R_out */}
          <div style={{ position: 'absolute', top: '380px', left: '220px', width: '120px', height: '60px' }} className="flex flex-col items-center justify-start gap-1.5 z-10">
            <div className={`w-[80px] h-[40px] shrink-0 bg-slate-800 border-2 rounded-xl flex items-center justify-center transition-all duration-300 ${animStep >= 5 ? 'border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'border-slate-700'}`}>
              <span className={`font-mono font-bold tracking-widest ${animStep >= 5 ? 'text-white' : 'text-slate-600'}`}>
                {animStep >= 5 ? nextRHex : '----'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 leading-none">R{currentRound}=L{currentRound-1}⊕ƒ</span>
          </div>

        </div>
      </div>
    </div>
  );
}