import { motion } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, Play, RotateCcw, FastForward, Layers, KeyRound, XSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { SimStatus, CryptoMode } from './FeistelTypes';

interface FeistelControlsProps {
  inputText: string; setInputText: (v: string) => void;
  masterKey: string; setMasterKey: (v: string) => void;
  mode: CryptoMode; setMode: (v: CryptoMode) => void;
  isEditing: boolean; setIsEditing: (v: boolean) => void;
  simStatus: SimStatus; setSimStatus: (v: SimStatus) => void;
  animStep: number; currentRound: number;
  L0Hex: string; R0Hex: string;
  handleProcess: () => void; skipSimulation: () => void;
  resetSimulation: () => void; advanceStep: () => void; reverseStep: () => void;
}

export default function FeistelControls(props: FeistelControlsProps) {
  const { inputText, setInputText, masterKey, setMasterKey, mode, setMode, isEditing, setIsEditing, simStatus, setSimStatus, animStep, currentRound, L0Hex, R0Hex, handleProcess, skipSimulation, resetSimulation, advanceStep, reverseStep } = props;

  return (
    <div className="shrink-0 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-xl p-5 flex flex-col gap-4">
      
      {/* Header Parameter */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <Layers size={16} />
          <span className="font-bold uppercase tracking-widest text-[11px]">Parameter Input</span>
        </div>
        {simStatus === 'idle' && (
          isEditing ? (
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-bold shadow-md transition-all">
              <Check size={12} /> Selesai
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-bold border border-slate-700 shadow-sm transition-all">
              <Edit3 size={12} /> Edit
            </button>
          )
        )}
      </div>

      {/* Baris Plaintext & L/R */}
      <div className="flex gap-3 w-full">
        <input 
          type="text" maxLength={4} value={inputText} disabled={simStatus !== 'idle'}
          onChange={(e) => setInputText(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          className="w-20 shrink-0 bg-[#090c15] border border-slate-700/50 rounded-xl px-2 py-2.5 text-white font-black tracking-widest outline-none focus:border-indigo-500 uppercase disabled:opacity-50 text-center"
          placeholder="TEXT"
        />
        <div className="flex-1 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-800/50 px-2 rounded-xl border border-slate-700/50 shadow-inner">
           <span>L₀=<strong className="text-indigo-300 text-[13px]">{L0Hex}</strong></span>
           <span className="text-slate-600">|</span>
           <span>R₀=<strong className="text-emerald-300 text-[13px]">{R0Hex}</strong></span>
        </div>
      </div>

      {/* Baris Mode & Key */}
      <div className="flex gap-3 w-full">
        <div className="flex-1 flex items-center bg-[#090c15] p-1 rounded-xl border border-slate-700/50 relative">
          <motion.div 
            className="absolute top-1 bottom-1 bg-indigo-600 rounded-[8px] z-0"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ left: mode === 'encrypt' ? '4px' : 'calc(50%)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button onClick={() => setMode('encrypt')} disabled={simStatus !== 'idle'} className={`relative z-10 w-1/2 py-2 font-bold text-[10px] uppercase transition-colors flex items-center justify-center gap-1.5 ${mode === 'encrypt' ? 'text-white' : 'text-slate-500'}`}>
            <Lock size={12} /> Encrypt
          </button>
          <button onClick={() => setMode('decrypt')} disabled={simStatus !== 'idle'} className={`relative z-10 w-1/2 py-2 font-bold text-[10px] uppercase transition-colors flex items-center justify-center gap-1.5 ${mode === 'decrypt' ? 'text-white' : 'text-slate-500'}`}>
            <Unlock size={12} /> Decrypt
          </button>
        </div>

        <div className="w-28 shrink-0 bg-[#090c15] border border-slate-700/50 rounded-xl px-3 flex justify-between items-center focus-within:border-amber-500/50 shadow-inner">
          <KeyRound size={12} className="text-slate-500" />
          <input 
            type="text" maxLength={4} value={masterKey} disabled={simStatus !== 'idle'}
            onChange={(e) => setMasterKey(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            className="w-12 bg-transparent text-amber-400 font-black text-right outline-none uppercase text-sm"
          />
        </div>
      </div>

      {/* Baris Aksi Navigasi (Prev/Next & Autoplay) */}
      <div className="w-full flex flex-col gap-2 mt-1">
        {/* Tombol Navigasi Manual */}
        <div className="flex gap-2">
          <button onClick={reverseStep} disabled={animStep === 0 && currentRound === 1} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1">
             <ChevronLeft size={14}/> Prev
          </button>
          <button onClick={() => { if(simStatus === 'running') setSimStatus('idle'); advanceStep(); }} disabled={simStatus === 'completed'} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1">
             Next <ChevronRight size={14}/>
          </button>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="flex gap-2">
          {simStatus === 'idle' ? (
            <button onClick={handleProcess} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <Play size={16} fill="currentColor"/> Autoplay
            </button>
          ) : simStatus === 'running' ? (
            <button onClick={() => setSimStatus('idle')} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <XSquare size={16}/> Pause
            </button>
          ) : (
            <button onClick={resetSimulation} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw size={16}/> Reset
            </button>
          )}
          
          {simStatus !== 'completed' && (
            <button onClick={skipSimulation} className="w-[120px] py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0">
              <FastForward size={14}/> Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}