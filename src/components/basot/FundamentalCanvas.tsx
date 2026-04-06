'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ArrowRight, Info } from 'lucide-react';

const steps = [
  {
    title: "Anatomi Automata",
    desc: "State (Lingkaran) mewakili status mesin saat ini. Start State (ditandai panah masuk) adalah titik mulai. Final State (lingkaran ganda) adalah titik akhir yang valid. Transisi (garis panah) adalah perpindahan antar state berdasarkan input karakter.",
  },
  {
    title: "Happy Path (Jalan Utama)",
    desc: "Kita akan mendesain mesin untuk aturan: 'Menerima string yang diawali karakter a'. Jika mesin di start state (q0) membaca karakter 'a', ia akan berpindah ke final state (q1).",
  },
  {
    title: "Aturan Emas & Dead State",
    desc: "Sifat 'Deterministik' mewajibkan SETIAP state memiliki tepat satu jalan keluar untuk setiap alfabet. Jika input awalnya 'b', string pasti salah. Oleh karena itu, kita membuat q2 (Dead State) sebagai jebakan permanen.",
  },
  {
    title: "Simulasi Interaktif",
    desc: "Desain mesin selesai! Cobalah ketik string seperti 'aba' (Diterima), 'b' (Ditolak), atau biarkan kosong untuk string Lambda/λ (Ditolak), lalu tekan Play.",
  }
];

export default function FundamentalCanvas() {
  const [tourStep, setTourStep] = useState(0);
  const [inputString, setInputString] = useState('');
  const [activeState, setActiveState] = useState('q0');
  const [status, setStatus] = useState<'idle' | 'running' | 'accepted' | 'rejected'>('idle');
  const [activeEdge, setActiveEdge] = useState<string | null>(null); // State garis aktif

  const transitions: Record<string, Record<string, string>> = {
    'q0': { 'a': 'q1', 'b': 'q2' },
    'q1': { 'a': 'q1', 'b': 'q1' },
    'q2': { 'a': 'q2', 'b': 'q2' },
  };

  const runSimulation = () => {
    let currState = 'q0';
    setActiveState(currState);
    setActiveEdge(null);
    setStatus('running');
    
    if (inputString.length === 0) { setStatus('rejected'); return; }

    let i = 0;
    const interval = setInterval(() => {
      const char = inputString[i];
      // Set garis yang menyala sebelum pindah node
      setActiveEdge(`${currState}-${char}`);
      
      currState = transitions[currState][char];
      setActiveState(currState);
      
      if (i === inputString.length - 1) {
        clearInterval(interval);
        setStatus(currState === 'q1' ? 'accepted' : 'rejected');
        setTimeout(() => setActiveEdge(null), 1000); // Matikan garis
      } else { 
        i++; 
      }
    }, 1000);
  };

  const reset = () => { 
    setActiveState('q0'); 
    setActiveEdge(null);
    setStatus('idle'); 
    setInputString(''); 
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6 z-20 shadow-md">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-indigo-400 mb-2 font-bold font-mono">
            <Info size={18} /> Tahap {tourStep + 1}: {steps[tourStep].title}
          </div>
          <p className="text-slate-300">{steps[tourStep].desc}</p>
        </div>
        
        {tourStep < 3 ? (
          <button onClick={() => setTourStep(p => p + 1)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 whitespace-nowrap">
            Lanjut <ArrowRight size={18} />
          </button>
        ) : (
          <div className="flex gap-2">
            <input type="text" value={inputString} onChange={(e) => setInputString(e.target.value.replace(/[^ab]/g, ''))} placeholder="Ketik a/b" disabled={status === 'running'} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none w-32" />
            {status === 'idle' ? <button onClick={runSimulation} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2"><Play size={18}/></button> : <button onClick={reset} className="px-4 py-2 bg-slate-700 text-white rounded-lg font-bold flex items-center gap-2"><RotateCcw size={18}/></button>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto relative flex items-center justify-center p-8 bg-slate-950">
        <div className="relative w-[800px] min-w-[800px] h-[400px]">
          
          {/* Layer 1: SVG Edges (Garis & Panah FIX) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
              <marker id="arrow-glow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" />
              </marker>
            </defs>
            
            {tourStep >= 1 && (
              <g>
                <path d="M 240 200 Q 370 140 480 140" fill="none" stroke={activeEdge === 'q0-a' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q0-a' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q0-a' ? 'arrow-glow' : 'arrowhead'})`} filter={activeEdge === 'q0-a' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
                <text x="350" y="130" fill={activeEdge === 'q0-a' ? '#818cf8' : '#cbd5e1'} fontSize="18" fontWeight={activeEdge === 'q0-a' ? 'bold' : 'normal'}>a</text>
              </g>
            )}
            
            {tourStep >= 2 && (
              <g>
                <path d="M 240 200 Q 370 260 480 260" fill="none" stroke={activeEdge === 'q0-b' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q0-b' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q0-b' ? 'arrow-glow' : 'arrowhead'})`} filter={activeEdge === 'q0-b' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
                <text x="350" y="280" fill={activeEdge === 'q0-b' ? '#818cf8' : '#cbd5e1'} fontSize="18" fontWeight={activeEdge === 'q0-b' ? 'bold' : 'normal'}>b</text>
                
                {/* Loop q1 (a atau b menyalakan garis ini) */}
                <path d="M 520 100 C 580 30 650 130 570 130" fill="none" stroke={activeEdge === 'q1-a' || activeEdge === 'q1-b' ? '#818cf8' : '#64748b'} strokeWidth={activeEdge === 'q1-a' || activeEdge === 'q1-b' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q1-a' || activeEdge === 'q1-b' ? 'arrow-glow' : 'arrowhead'})`} filter={activeEdge === 'q1-a' || activeEdge === 'q1-b' ? 'drop-shadow(0 0 8px #818cf8)' : ''} />
                <text x="610" y="80" fill={activeEdge === 'q1-a' || activeEdge === 'q1-b' ? '#818cf8' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q1-a' || activeEdge === 'q1-b' ? 'bold' : 'normal'}>a, b</text>
                
                {/* Loop q2 (a atau b menyalakan garis ini) */}
                <path d="M 520 300 C 580 370 650 270 570 270" fill="none" stroke={activeEdge === 'q2-a' || activeEdge === 'q2-b' ? '#fb7185' : '#64748b'} strokeWidth={activeEdge === 'q2-a' || activeEdge === 'q2-b' ? 4 : 3} markerEnd={`url(#${activeEdge === 'q2-a' || activeEdge === 'q2-b' ? 'arrow-glow' : 'arrowhead'})`} filter={activeEdge === 'q2-a' || activeEdge === 'q2-b' ? 'drop-shadow(0 0 8px #fb7185)' : ''} />
                <text x="610" y="340" fill={activeEdge === 'q2-a' || activeEdge === 'q2-b' ? '#fb7185' : '#cbd5e1'} fontSize="16" fontWeight={activeEdge === 'q2-a' || activeEdge === 'q2-b' ? 'bold' : 'normal'}>a, b</text>
              </g>
            )}
          </svg>

          {/* Layer 2: HTML Nodes (Lingkaran) */}
          <AnimatePresence>
            <motion.div key="node-q0" className="absolute left-[160px] top-[160px]">
              <div className="absolute -left-16 top-6 text-slate-400 font-mono">Start ➔</div>
              <motion.div animate={{ borderColor: activeState === 'q0' ? '#818cf8' : '#475569', boxShadow: activeState === 'q0' ? '0 0 20px rgba(99,102,241,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold text-white z-10 relative">q0</motion.div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {tourStep >= 1 && (
              <motion.div key="node-q1" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute left-[500px] top-[100px]">
                <motion.div animate={{ borderColor: activeState === 'q1' ? '#34d399' : '#475569', boxShadow: activeState === 'q1' ? '0 0 20px rgba(52,211,153,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-[6px] border-double rounded-full flex items-center justify-center text-xl font-bold text-emerald-400 z-10 relative">q1</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
            
          <AnimatePresence>
            {tourStep >= 2 && (
              <motion.div key="node-q2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute left-[500px] top-[220px]">
                <motion.div animate={{ borderColor: activeState === 'q2' ? '#fb7185' : '#475569', boxShadow: activeState === 'q2' ? '0 0 20px rgba(251,113,133,0.5)' : 'none' }} className="w-20 h-20 bg-slate-800 border-4 rounded-full flex items-center justify-center text-xl font-bold text-rose-400 z-10 relative">q2</motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        {status === 'accepted' && <div className="absolute bottom-6 bg-emerald-500 text-white font-bold px-8 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]">STRING DITERIMA ✅</div>}
        {status === 'rejected' && <div className="absolute bottom-6 bg-rose-500 text-white font-bold px-8 py-3 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.4)]">STRING DITOLAK ❌</div>}
      </div>
    </div>
  );
}