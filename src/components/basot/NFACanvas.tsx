'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepForward, RotateCcw, Play, Info } from 'lucide-react';

export default function NFACanvas() {
  const [inputString, setInputString] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [activeStates, setActiveStates] = useState<string[]>(['q0']);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'accepted' | 'rejected'>('idle');
  const [activeEdges, setActiveEdges] = useState<string[]>([]);

  // Logika Transisi NFA (Bisa bercabang ke banyak state!)
  const nfaTransitions: Record<string, Record<string, string[]>> = {
    'q0': { '0': ['q0', 'q1'], '1': ['q0'] },
    'q1': { '0': [], '1': ['q2'] },
    'q2': { '0': [], '1': [] },
  };

  const startSimulation = () => {
    if (!inputString) return;
    setCurrentIndex(0); setActiveStates(['q0']); setActiveEdges([]); setStatus('running');
    setLogs([`Memulai pelacakan. State aktif: [q0]`]);
  };

  const stepForward = () => {
    if (status !== 'running') return;
    const char = inputString[currentIndex];
    
    let nextStates = new Set<string>();
    let triggeredEdges: string[] = [];

    activeStates.forEach(state => {
      const destinations = nfaTransitions[state]?.[char] || [];
      destinations.forEach(dest => {
        nextStates.add(dest);
        triggeredEdges.push(`${state}-${char}-${dest}`);
      });
    });

    const nextStatesArr = Array.from(nextStates);
    setActiveEdges(triggeredEdges);
    setActiveStates(nextStatesArr);

    if (nextStatesArr.length === 0) {
      setLogs(p => [...p, `Membaca '${char}': Semua cabang mati (Jalan Buntu).`]);
    } else {
      setLogs(p => [...p, `Membaca '${char}': State aktif membelah menjadi [${nextStatesArr.join(', ')}]`]);
    }

    if (currentIndex === inputString.length - 1) {
      // NFA Diterima jika MINIMAL ADA SATU cabang yang mendarat di Final State
      const isAccepted = nextStatesArr.includes('q2');
      setStatus(isAccepted ? 'accepted' : 'rejected');
      setLogs(p => [...p, isAccepted ? '✅ STRING DITERIMA (Salah satu memori mencapai q2)' : '❌ STRING DITOLAK (Tidak ada memori di q2)']);
      setTimeout(() => setActiveEdges([]), 1000);
    } else { setCurrentIndex(p => p + 1); }
  };

  const reset = () => { setInputString(''); setCurrentIndex(-1); setActiveStates(['q0']); setActiveEdges([]); setLogs([]); setStatus('idle'); };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4 text-slate-200 h-full">
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-x-auto">
        <div className="relative w-[700px] min-w-[700px] h-[300px]">
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker>
              <marker id="arrow-glow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#c084fc" /></marker>
            </defs>
            
            {/* q0 Loop (0,1) */}
            <path d="M 120 110 C 90 20 190 20 160 110" fill="none" stroke={activeEdges.includes('q0-0-q0') || activeEdges.includes('q0-1-q0') ? '#c084fc' : '#64748b'} strokeWidth={activeEdges.includes('q0-0-q0') || activeEdges.includes('q0-1-q0') ? 4 : 3} markerEnd={`url(#${activeEdges.includes('q0-0-q0') || activeEdges.includes('q0-1-q0') ? 'arrow-glow' : 'arrow'})`} filter={activeEdges.includes('q0-0-q0') || activeEdges.includes('q0-1-q0') ? 'drop-shadow(0 0 8px #c084fc)' : ''} />
            <text x="130" y="30" fill={activeEdges.includes('q0-0-q0') || activeEdges.includes('q0-1-q0') ? '#c084fc' : '#cbd5e1'} fontSize="16" fontWeight="bold">0, 1</text>
            
            {/* q0 to q1 (0) */}
            <path d="M 180 150 L 320 150" fill="none" stroke={activeEdges.includes('q0-0-q1') ? '#c084fc' : '#64748b'} strokeWidth={activeEdges.includes('q0-0-q1') ? 4 : 3} markerEnd={`url(#${activeEdges.includes('q0-0-q1') ? 'arrow-glow' : 'arrow'})`} filter={activeEdges.includes('q0-0-q1') ? 'drop-shadow(0 0 8px #c084fc)' : ''} />
            <text x="240" y="140" fill={activeEdges.includes('q0-0-q1') ? '#c084fc' : '#cbd5e1'} fontSize="16" fontWeight="bold">0</text>
            
            {/* q1 to q2 (1) */}
            <path d="M 380 150 L 520 150" fill="none" stroke={activeEdges.includes('q1-1-q2') ? '#c084fc' : '#64748b'} strokeWidth={activeEdges.includes('q1-1-q2') ? 4 : 3} markerEnd={`url(#${activeEdges.includes('q1-1-q2') ? 'arrow-glow' : 'arrow'})`} filter={activeEdges.includes('q1-1-q2') ? 'drop-shadow(0 0 8px #c084fc)' : ''} />
            <text x="440" y="140" fill={activeEdges.includes('q1-1-q2') ? '#c084fc' : '#cbd5e1'} fontSize="16" fontWeight="bold">1</text>
          </svg>

          {/* Layer Node */}
          <div className="absolute left-[100px] top-[110px]">
            <div className="absolute -left-14 top-6 text-slate-500 text-sm">Start➔</div>
            <motion.div animate={{ borderColor: activeStates.includes('q0') ? '#c084fc' : '#475569', boxShadow: activeStates.includes('q0') ? '0 0 20px rgba(192,132,252,0.6)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold z-10 relative">q0</motion.div>
          </div>
          <div className="absolute left-[300px] top-[110px]">
            <motion.div animate={{ borderColor: activeStates.includes('q1') ? '#c084fc' : '#475569', boxShadow: activeStates.includes('q1') ? '0 0 20px rgba(192,132,252,0.6)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold z-10 relative">q1</motion.div>
          </div>
          <div className="absolute left-[500px] top-[110px]">
            <motion.div animate={{ borderColor: activeStates.includes('q2') ? '#c084fc' : '#475569', boxShadow: activeStates.includes('q2') ? '0 0 20px rgba(192,132,252,0.6)' : 'none' }} className="w-20 h-20 bg-slate-800 border-[6px] border-double rounded-full flex items-center justify-center text-xl font-bold text-fuchsia-400 z-10 relative">q2</motion.div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
        <div className="mb-6 p-4 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-lg">
          <h3 className="text-fuchsia-400 font-bold flex items-center gap-2 mb-2"><Info size={18}/> Kemampuan Paralel NFA</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Perhatikan bahwa NFA ini <strong>melanggar DFA</strong>! Saat di q0 membaca '0', ia bercabang ke q0 dan q1 sekaligus. Ketik '101' dan amati mesin membelah dirinya!
          </p>
        </div>
        
        <div className="mb-6 flex gap-2">
          <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value.replace(/[^01]/g, ''))} disabled={status !== 'idle'} className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:border-fuchsia-500 outline-none" placeholder="Contoh: 101" />
          {status === 'idle' ? <button onClick={startSimulation} className="p-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md"><Play size={20} /></button> : <button onClick={reset} className="p-2 bg-slate-700 rounded-md"><RotateCcw size={20} /></button>}
        </div>

        <div className="flex-1 min-h-[150px] border border-slate-800 bg-slate-900 rounded-md p-4 mb-4 font-mono text-sm overflow-y-auto">
          <div className="mb-4 text-slate-400 font-bold tracking-widest text-lg text-center">
            {inputString.split('').map((char, idx) => (
              <span key={idx} className={idx === currentIndex ? 'text-fuchsia-400 underline underline-offset-4' : 'text-slate-600'}>{char}</span>
            ))}
          </div>
          <div className="space-y-1">{logs.map((log, idx) => <div key={idx} className="text-slate-400">{log}</div>)}</div>
        </div>

        <button onClick={stepForward} disabled={status !== 'running'} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-md font-bold flex justify-center items-center gap-2">
          <StepForward size={18} /> Langkah Selanjutnya
        </button>
      </div>
    </div>
  );
}