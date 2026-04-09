import { motion } from 'framer-motion';
import { Edit3, Check, Play, RotateCcw, XSquare, FastForward, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import { SimStatus } from './DESTypes';

interface DESControlsProps {
  inputBin: string; setInputBin: (v: string) => void;
  isEditing: boolean; setIsEditing: (v: boolean) => void;
  simStatus: SimStatus; setSimStatus: (v: SimStatus) => void;
  animStep: number; isValid: boolean;
  handleProcess: () => void; skipSimulation: () => void;
  resetSimulation: () => void; advanceStep: () => void; reverseStep: () => void;
}

export default function DESControls(props: DESControlsProps) {
  const { inputBin, setInputBin, isEditing, setIsEditing, simStatus, setSimStatus, animStep, isValid, handleProcess, skipSimulation, resetSimulation, advanceStep, reverseStep } = props;

  return (
    <div className="shrink-0 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-xl p-5 flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <Cpu size={16} />
          <span className="font-bold uppercase tracking-widest text-[11px]">Input 6-Bit Biner</span>
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

      {/* Input Box */}
      <div className="w-full bg-slate-950/50 rounded-lg border border-slate-800 p-3 flex flex-col justify-center shadow-inner relative min-h-[60px]">
        {isEditing ? (
          <input
            type="text" maxLength={6} value={inputBin} onChange={(e) => setInputBin(e.target.value)}
            className={`w-full bg-transparent text-center text-3xl font-black tracking-[0.3em] outline-none uppercase ${isValid ? 'text-amber-400' : 'text-rose-500'}`}
            placeholder="101100"
          />
        ) : (
          <span className={`text-center text-3xl font-black tracking-[0.3em] ${isValid ? 'text-amber-400' : 'text-rose-500'}`}>
            {inputBin || "------"}
          </span>
        )}
        {!isValid && <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold text-rose-500">Wajib 6 digit biner (0/1)</span>}
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2 mt-1">
        <div className="flex gap-2">
          <button onClick={reverseStep} disabled={animStep === 0} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1">
             <ChevronLeft size={14}/> Prev
          </button>
          <button onClick={() => { if(simStatus === 'running') setSimStatus('idle'); advanceStep(); }} disabled={simStatus === 'completed' || !isValid} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1">
             Next <ChevronRight size={14}/>
          </button>
        </div>
        <div className="flex gap-2">
          {simStatus === 'idle' ? (
            <button onClick={handleProcess} disabled={!isValid} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
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
            <button onClick={skipSimulation} disabled={!isValid} className="w-[100px] py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0">
              <FastForward size={14}/> Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}