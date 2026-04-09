"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Network, ArrowRight, MousePointerClick, Zap, Binary, ShieldAlert } from 'lucide-react';

export default function AvalancheCanvas() {
  // --- STATE ---
  const [inputText, setInputText] = useState("RAHASIA");
  
  // State Input Biner
  const [binA, setBinA] = useState("");
  const [binB, setBinB] = useState("");
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  
  // State Output (Simulasi 128-bit Block)
  const [outA, setOutA] = useState("");
  const [outB, setOutB] = useState("");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'input_ready' | 'running' | 'completed'>('idle');
  const [diffCount, setDiffCount] = useState(0);

  // --- HELPER: Konversi Teks ke Biner ---
  const textToBinary = (text: string) => {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  };

  // --- HELPER: Simulasi Engine Cipher 128-bit (Deterministic PRNG) ---
  // Menghasilkan 128-bit acak berdasarkan input string biner
  const generateCipherBlock = (binaryStr: string) => {
    let hash = 0;
    for (let i = 0; i < binaryStr.length; i++) {
      hash = ((hash << 5) - hash) + binaryStr.charCodeAt(i);
      hash |= 0; 
    }
    
    let output = "";
    let current = hash;
    for(let i = 0; i < 128; i++) {
      current = (current * 1664525 + 1013904223) | 0; // LCG PRNG
      output += (current >>> 31) & 1 ? "1" : "0";
    }
    return output;
  };

  // --- INISIALISASI ---
  useEffect(() => {
    resetSimulation();
  }, [inputText]);

  const resetSimulation = () => {
    const initialBin = textToBinary(inputText);
    setBinA(initialBin);
    setBinB(initialBin);
    setFlippedIndex(null);
    setOutA("");
    setOutB("");
    setSimStatus('idle');
    setDiffCount(0);
  };

  // Membalik 1 bit secara acak
  const handleFlipBit = () => {
    if (binA.length === 0) return;
    const targetIdx = Math.floor(Math.random() * binA.length);
    const chars = binA.split('');
    chars[targetIdx] = chars[targetIdx] === '1' ? '0' : '1';
    
    setBinB(chars.join(''));
    setFlippedIndex(targetIdx);
    setSimStatus('input_ready');
  };

  // Eksekusi Simulasi
  const handleProcess = () => {
    setSimStatus('running');
    
    // Memberikan jeda visual untuk efek "memproses"
    setTimeout(() => {
      const cipherA = generateCipherBlock(binA);
      const cipherB = generateCipherBlock(binB);
      
      let diffs = 0;
      for(let i=0; i<128; i++) {
        if(cipherA[i] !== cipherB[i]) diffs++;
      }
      
      setOutA(cipherA);
      setOutB(cipherB);
      setDiffCount(diffs);
      setSimStatus('completed');
    }, 1000);
  };

  // Memecah string panjang menjadi baris-baris berukuran 32 bit untuk UI
  const formatBinary = (binStr: string) => {
    const chunks = [];
    for (let i = 0; i < binStr.length; i += 32) {
      chunks.push(binStr.substring(i, i + 32));
    }
    return chunks;
  };

  const percentage = Math.round((diffCount / 128) * 100);

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* 1. HEADER & INPUT PANEL */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl p-5 z-20 gap-6">
        
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Binary size={18} />
            <span className="font-bold uppercase tracking-widest text-[11px]">Teks Asli (Plaintext)</span>
          </div>
          <input 
            type="text" value={inputText}
            disabled={simStatus !== 'idle'}
            onChange={(e) => setInputText(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-black tracking-widest outline-none focus:border-indigo-500 uppercase disabled:opacity-50"
            placeholder="KETIK KATA..."
          />
        </div>

        <div className="shrink-0 flex gap-3 w-full lg:w-auto">
          {simStatus === 'idle' && (
            <button onClick={handleFlipBit} disabled={inputText.length === 0} className="flex-1 lg:w-48 flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95 group">
              <MousePointerClick size={16} className="group-hover:-rotate-12 transition-transform" /> Flip 1 Bit Acak
            </button>
          )}
          
          {simStatus === 'input_ready' && (
             <button onClick={handleProcess} className="flex-1 lg:w-48 flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 group">
               <Zap size={16} className="group-hover:scale-110 transition-transform" /> Proses Engine
             </button>
          )}

          {(simStatus === 'running' || simStatus === 'completed') && (
            <button onClick={resetSimulation} disabled={simStatus === 'running'} className="flex-1 lg:w-48 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">
              <RotateCcw size={16} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 2. AREA KOMPARASI AVALANCHE */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6">
        
        {/* KOLOM A: PLAINTEXT ASLI */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Input A */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-lg flex flex-col relative overflow-hidden group">
             <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4">
               <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Data A (Asli)</span>
             </div>
             <div className="bg-[#0b1120] p-4 rounded-xl font-mono text-sm tracking-widest text-slate-300 break-words border border-slate-800 shadow-inner">
               {binA.split('').map((bit, i) => (
                 <span key={i} className="px-[1px]">{bit}</span>
               ))}
               {binA.length === 0 && <span className="text-slate-600 italic">Menunggu input...</span>}
             </div>
          </div>

          {/* Animasi Panah ke Engine */}
          <div className="flex justify-center -my-2 opacity-50">
            <ArrowRight size={24} className="text-slate-500 rotate-90" />
          </div>

          {/* Output A */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden">
             <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
             <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4 z-10">
               <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Output A (Cipher 128-bit)</span>
             </div>
             
             <div className="flex-1 bg-[#0b1120] p-4 rounded-xl border border-slate-800 shadow-inner relative z-10 flex flex-col justify-center">
               <AnimatePresence>
                 {simStatus === 'running' && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-[#0b1120]/80 backdrop-blur-sm z-20">
                     <span className="text-indigo-400 font-bold animate-pulse text-sm uppercase tracking-widest">Enkripsi Berjalan...</span>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <div className="flex flex-col gap-2 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-indigo-300 w-full overflow-hidden">
                 {outA ? formatBinary(outA).map((chunk, i) => (
                   <motion.div key={`oa-${i}`} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                     {chunk.split('').map((bit, j) => <span key={`oab-${j}`}>{bit}</span>)}
                   </motion.div>
                 )) : (
                   <span className="text-slate-600 text-center py-10">Belum diproses</span>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* KOLOM B: PLAINTEXT DENGAN 1 BIT BERBEDA */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Input B */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-lg flex flex-col relative overflow-hidden">
             <div className="absolute -inset-1 bg-gradient-to-b from-amber-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
             <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4 z-10">
               <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px]">Data B (1 Bit Flipped)</span>
             </div>
             <div className="bg-[#0b1120] p-4 rounded-xl font-mono text-sm tracking-widest text-slate-300 break-words border border-slate-800 shadow-inner z-10">
               {binB.split('').map((bit, i) => (
                 <span key={i} className={`px-[1px] transition-colors duration-300 ${i === flippedIndex ? 'bg-amber-500 text-slate-900 font-black rounded-sm scale-125 inline-block drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : ''}`}>
                   {bit}
                 </span>
               ))}
               {binB.length === 0 && <span className="text-slate-600 italic">Tekan Flip Bit...</span>}
             </div>
          </div>

          {/* Animasi Panah ke Engine */}
          <div className="flex justify-center -my-2 opacity-50">
            <ArrowRight size={24} className="text-slate-500 rotate-90" />
          </div>

          {/* Output B */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden">
             <div className="absolute -inset-1 bg-gradient-to-b from-rose-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
             <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4 z-10">
               <span className="font-bold text-rose-400 uppercase tracking-widest text-[10px]">Output B (Cipher 128-bit)</span>
             </div>
             
             <div className="flex-1 bg-[#0b1120] p-4 rounded-xl border border-slate-800 shadow-inner relative z-10 flex flex-col justify-center">
               <AnimatePresence>
                 {simStatus === 'running' && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-[#0b1120]/80 backdrop-blur-sm z-20">
                     <span className="text-rose-400 font-bold animate-pulse text-sm uppercase tracking-widest">Enkripsi Berjalan...</span>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <div className="flex flex-col gap-2 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-slate-400 w-full overflow-hidden">
                 {outB ? formatBinary(outB).map((chunk, i) => (
                   <motion.div key={`ob-${i}`} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                     {chunk.split('').map((bit, j) => {
                       const globalIdx = (i * 32) + j;
                       const isDiff = outA[globalIdx] !== bit;
                       return (
                         <span key={`obb-${j}`} className={`px-[1px] transition-colors duration-500 ${isDiff ? 'text-rose-400 font-black drop-shadow-[0_0_3px_#f43f5e]' : 'opacity-30'}`}>
                           {bit}
                         </span>
                       )
                     })}
                   </motion.div>
                 )) : (
                   <span className="text-slate-600 text-center py-10">Belum diproses</span>
                 )}
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* 3. HASIL AVALANCHE METRIC */}
      <AnimatePresence>
        {simStatus === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full shrink-0 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-600/50 shadow-2xl p-5 md:p-6 z-20"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                   <ShieldAlert size={24} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avalanche Metric Score</span>
                   <span className="text-xl font-black text-white">Perubahan <span className="text-rose-400">{diffCount}</span> dari 128 Bit</span>
                 </div>
               </div>

               <div className="flex flex-col items-center md:items-end w-full md:w-1/3 gap-2">
                 <div className="flex justify-between w-full text-xs font-bold font-mono">
                   <span className="text-slate-400">Similarity</span>
                   <span className={percentage >= 40 && percentage <= 60 ? 'text-emerald-400' : 'text-rose-400'}>{percentage}% Berbeda</span>
                 </div>
                 {/* Progress Bar Score */}
                 <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                   <motion.div 
                     initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, type: 'spring' }}
                     className={`h-full ${percentage >= 40 && percentage <= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                   />
                 </div>
                 {percentage >= 40 && percentage <= 60 ? (
                   <span className="text-[10px] text-emerald-400 font-bold mt-1">Ideal (Mendekati 50%) - Algoritma Kuat!</span>
                 ) : (
                   <span className="text-[10px] text-amber-400 font-bold mt-1">Kurang Acak. Coba kata lain.</span>
                 )}
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .beautiful-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .beautiful-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 8px; }
        .beautiful-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 8px; }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.8); }
      `}</style>
    </div>
  );
}