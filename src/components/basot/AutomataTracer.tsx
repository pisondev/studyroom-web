'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StepForward, RotateCcw, Play, Info } from 'lucide-react';
import { DFADefinition } from '@/types/automata';

const dfaEndsIn01: DFADefinition = {
  states: ['q0', 'q1', 'q2'], alphabet: ['0', '1'], startState: 'q0', finalStates: ['q2'],
  transitions: { 'q0': { '0': 'q1', '1': 'q0' }, 'q1': { '0': 'q1', '1': 'q2' }, 'q2': { '0': 'q1', '1': 'q0' } },
};

export default function AutomataTracer() {
  const [inputString, setInputString] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [activeState, setActiveState] = useState<string>('q0');
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'accepted' | 'rejected'>('idle');
  const [activeEdge, setActiveEdge] = useState<string | null>(null); // State garis aktif

  const startSimulation = () => {
    if (!inputString) return;
    setCurrentIndex(0); 
    setActiveState('q0'); 
    setActiveEdge(null); // Reset garis
    setStatus('running');
    setLogs([`Memulai pelacakan dari Start State: q0`]);
  };

  const stepForward = () => {
    if (status !== 'running') return;
    const char = inputString[currentIndex];
    const nextState = dfaEndsIn01.transitions[activeState][char];
    
    setLogs(p => [...p, `Membaca '${char}': Pindah dari ${activeState} ➔ ${nextState}`]);
    
    // FIX: Syntax penulisan variabel string template yang benar
    setActiveEdge(`${activeState}-${char}`);
    setActiveState(nextState);

    if (currentIndex === inputString.length - 1) {
      const isAccepted = dfaEndsIn01.finalStates.includes(nextState);
      setStatus(isAccepted ? 'accepted' : 'rejected');
      setLogs(p => [...p, isAccepted ? '✅ STRING DITERIMA (Berada di Final State)' : '❌ STRING DITOLAK (Berhenti di tengah jalan)']);
      // Matikan garis menyala setelah selesai
      setTimeout(() => setActiveEdge(null), 1000); 
    } else { 
      setCurrentIndex(p => p + 1); 
    }
  };

  const reset = () => { 
    setInputString(''); 
    setCurrentIndex(-1); 
    setActiveState('q0'); 
    setActiveEdge(null); // Reset garis
    setLogs([]); 
    setStatus('idle'); 
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4 text-slate-200 h-full">
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-x-auto">
        <div className="relative w-[700px] min-w-[700px] h-[300px]">
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker>
              <marker id="arrow-glow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" /></marker>
            </defs>
            
            <path d="M 140 150 L 320 150" fill="none" stroke={activeEdge === 'q0-0' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q0-0' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q0-0' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q0-0' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="220" y="140" fill={activeEdge === 'q0-0' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q0-0' ? 'bold' : 'normal'}>0</text>
            
            <path d="M 380 150 L 560 150" fill="none" stroke={activeEdge === 'q1-1' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q1-1' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q1-1' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q1-1' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="460" y="140" fill={activeEdge === 'q1-1' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q1-1' ? 'bold' : 'normal'}>1</text>
            
            <path d="M 580 120 Q 470 20 360 120" fill="none" stroke={activeEdge === 'q2-0' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q2-0' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q2-0' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q2-0' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="460" y="60" fill={activeEdge === 'q2-0' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q2-0' ? 'bold' : 'normal'}>0</text>
            
            <path d="M 580 180 Q 340 300 120 180" fill="none" stroke={activeEdge === 'q2-1' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q2-1' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q2-1' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q2-1' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="340" y="260" fill={activeEdge === 'q2-1' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q2-1' ? 'bold' : 'normal'}>1</text>
            
            <path d="M 80 120 C 50 30 150 30 120 120" fill="none" stroke={activeEdge === 'q0-1' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q0-1' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q0-1' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q0-1' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="90" y="40" fill={activeEdge === 'q0-1' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q0-1' ? 'bold' : 'normal'}>1</text>
            
            <path d="M 320 180 C 290 270 390 270 360 180" fill="none" stroke={activeEdge === 'q1-0' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q1-0' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q1-0' ? 'arrow-glow' : 'arrow'})`} filter={activeEdge === 'q1-0' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
            <text x="330" y="280" fill={activeEdge === 'q1-0' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q1-0' ? 'bold' : 'normal'}>0</text>
          </svg>

          <div className="absolute left-[60px] top-[110px]">
            <div className="absolute -left-14 top-6 text-slate-500 text-sm">Start➔</div>
            <motion.div animate={{ borderColor: activeState === 'q0' ? '#818cf8' : '#475569', boxShadow: activeState === 'q0' ? '0 0 20px rgba(99,102,241,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold">q0</motion.div>
          </div>
          <div className="absolute left-[300px] top-[110px]">
            <motion.div animate={{ borderColor: activeState === 'q1' ? '#818cf8' : '#475569', boxShadow: activeState === 'q1' ? '0 0 20px rgba(99,102,241,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold">q1</motion.div>
          </div>
          <div className="absolute left-[540px] top-[110px]">
            <motion.div animate={{ borderColor: activeState === 'q2' ? '#34d399' : '#475569', boxShadow: activeState === 'q2' ? '0 0 20px rgba(52,211,153,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-[6px] border-double rounded-full flex items-center justify-center text-xl font-bold text-emerald-400">q2</motion.div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
        <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
          <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-2"><Info size={18}/> Objektif Simulasi</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Mesin DFA di kiri dirancang khusus untuk memvalidasi string biner yang <strong>selalu diakhiri dengan pola '01'</strong>. 
            Silakan masukkan string kombinasi angka 0 dan 1, lalu klik <strong>Langkah Selanjutnya</strong> untuk mengamati rute transisinya.
          </p>
        </div>
        
        <div className="mb-6 flex gap-2">
          <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value.replace(/[^01]/g, ''))} disabled={status !== 'idle'} className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200" placeholder="Contoh: 1101" />
          {status === 'idle' ? <button onClick={startSimulation} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"><Play size={20} /></button> : <button onClick={reset} className="p-2 bg-slate-700 rounded-md"><RotateCcw size={20} /></button>}
        </div>

        <div className="flex-1 min-h-[150px] border border-slate-800 bg-slate-900 rounded-md p-4 mb-4 font-mono text-sm overflow-y-auto">
          <div className="mb-4 text-slate-400 font-bold tracking-widest text-lg text-center">
            {inputString.split('').map((char, idx) => (
              <span key={idx} className={idx === currentIndex ? 'text-indigo-400 underline underline-offset-4' : 'text-slate-600'}>{char}</span>
            ))}
          </div>
          <div className="space-y-1">{logs.map((log, idx) => <div key={idx} className="text-slate-400">{log}</div>)}</div>
        </div>

        <button onClick={stepForward} disabled={status !== 'running'} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-md font-bold flex justify-center items-center gap-2">
          <StepForward size={18} /> Langkah Selanjutnya
        </button>
      </div>
    </div>
  );
}