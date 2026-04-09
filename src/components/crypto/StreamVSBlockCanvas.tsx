"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Play, RotateCcw, XSquare, FastForward, Activity, LayoutGrid, Cpu, Package, ArrowRight, Zap } from 'lucide-react';

const BLOCK_SIZE = 3; // 1 Blok = 3 Karakter untuk visualisasi

// Helper
const toHex = (char: string) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
const randomHex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');

export default function StreamVsBlockCanvas() {
  // --- STATE ---
  const [text, setText] = useState("RAHASIANEGARA");
  const [isEditing, setIsEditing] = useState(false);
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [tick, setTick] = useState<number>(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format Text (Pad to make it divisible by BLOCK_SIZE)
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  const remainder = cleanText.length % BLOCK_SIZE;
  const paddedText = remainder === 0 ? cleanText : cleanText + 'X'.repeat(BLOCK_SIZE - remainder);
  const totalTicks = paddedText.length;

  // --- AUTO-RESIZE & RESET ---
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text]);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTick(0);
    setSimStatus('idle');
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setTick(0);
  };

  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTick(totalTicks);
    setSimStatus('completed');
  };

  const handleProcess = () => {
    if (simStatus === 'running' || paddedText.length === 0) return;
    setSimStatus('running');
    setTick(0);
    
    let currentTick = 0;
    
    intervalRef.current = setInterval(() => {
      currentTick++;
      setTick(currentTick);
      
      if (currentTick >= totalTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimStatus('completed');
      }
    }, 600); // 600ms per karakter
  };

  // Kalkulasi Status untuk Stream & Block
  const streamProcessed = paddedText.slice(0, tick).split('');
  const streamPending = paddedText.slice(tick).split('');
  
  const completedBlocksCount = Math.floor(tick / BLOCK_SIZE);
  const isBufferingBlock = tick % BLOCK_SIZE !== 0;
  const currentBlockBuffer = paddedText.slice(completedBlocksCount * BLOCK_SIZE, tick).split('');

  // Pecah teks utuh menjadi array blok-blok
  const blockChunks: string[][] = [];
  for (let i = 0; i < paddedText.length; i += BLOCK_SIZE) {
    blockChunks.push(paddedText.slice(i, i + BLOCK_SIZE).split(''));
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* HEADER & INPUT PANEL */}
      <div className="w-full shrink-0 flex flex-col md:flex-row items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl p-5 md:p-6 z-20 gap-6">
        
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <Cpu size={18} />
              <span className="font-bold uppercase tracking-widest text-[11px]">Input Dokumen Biner</span>
            </div>
            
            {simStatus === 'idle' && (
              isEditing ? (
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all">
                  <Check size={14} /> Selesai
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all">
                  <Edit3 size={14} /> Edit Data
                </button>
              )
            )}
          </div>

          <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 min-h-[60px] flex items-center shadow-inner">
            {isEditing ? (
              <textarea
                ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-transparent text-amber-400 text-xl font-black tracking-widest outline-none resize-none uppercase"
              />
            ) : (
              <span className="text-amber-400 text-xl font-black tracking-[0.3em] uppercase break-all">
                {paddedText}
              </span>
            )}
          </div>
          {remainder !== 0 && !isEditing && (
            <span className="text-[10px] text-slate-500 font-medium">*Sistem otomatis menambahkan padding 'X' agar bisa diproses Block Cipher (kelipatan {BLOCK_SIZE}).</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex flex-row md:flex-col gap-2 w-full md:w-auto">
          {simStatus === 'idle' && (
            <button onClick={handleProcess} disabled={paddedText.length === 0} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 group">
              <Play size={16} fill="currentColor" className="group-hover:translate-x-1" /> Eksekusi Mesin
            </button>
          )}
          
          {simStatus === 'running' && (
            <>
              <button onClick={cancelSimulation} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95">
                <XSquare size={16} /> Batal
              </button>
              <button onClick={skipSimulation} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95">
                <FastForward size={16} /> Skip
              </button>
            </>
          )}

          {simStatus === 'completed' && (
            <button onClick={resetSimulation} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
              <RotateCcw size={16} /> Reset Ulang
            </button>
          )}
        </div>

      </div>

      {/* 2. AREA KOMPARASI MESIN (STREAM VS BLOCK) */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6">
        
        {/* MESIN 1: STREAM CIPHER */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
             <div className="flex items-center gap-2 text-emerald-400">
               <Activity size={20} />
               <h3 className="font-black uppercase tracking-widest text-sm md:text-base">Stream Cipher</h3>
             </div>
             <span className="text-[10px] bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 font-mono font-bold">1 Byte / Tick</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-8 w-full min-w-max mx-auto px-4">
             
             {/* Animasi Input Stream */}
             <div className="flex items-center gap-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 w-full overflow-hidden">
               <div className="w-16 shrink-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2 border-r border-slate-700/50 mr-2">Input<br/>Queue</div>
               <div className="flex gap-1.5 overflow-hidden w-full">
                 {/* Tampilkan karakter yang sudah diproses agar hilang dari antrean */}
                 {streamPending.map((char, i) => (
                   <motion.div 
                     key={`sp-${tick}-${i}`}
                     initial={i === 0 && simStatus === 'running' ? { x: 20, opacity: 0 } : { x: 0, opacity: 1 }}
                     animate={{ x: 0, opacity: 1 }}
                     className={`w-8 h-10 md:w-10 md:h-12 flex flex-col items-center justify-center rounded-lg border font-black text-lg md:text-xl transition-all ${i === 0 && simStatus === 'running' ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-10' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                   >
                     {char}
                     <span className="text-[8px] text-slate-500 font-mono font-normal mt-0.5">{toHex(char)}</span>
                   </motion.div>
                 ))}
                 {streamPending.length === 0 && <span className="text-xs font-mono text-slate-600 italic py-2">Antrean kosong...</span>}
               </div>
             </div>

             <div className="flex flex-col items-center">
                <ArrowRight size={24} className="text-emerald-500 rotate-90 mb-2 opacity-50" />
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all duration-300 ${simStatus === 'running' ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)]' : 'bg-slate-900/50 border-slate-700'}`}>
                   <Zap size={18} className={simStatus === 'running' ? 'text-emerald-400 animate-pulse' : 'text-slate-600'} />
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Continuous XOR Engine</span>
                </div>
                <ArrowRight size={24} className="text-emerald-500 rotate-90 mt-2 opacity-50" />
             </div>

             {/* Animasi Output Stream */}
             <div className="flex items-center gap-2 bg-emerald-900/10 p-3 rounded-2xl border border-emerald-500/20 w-full overflow-hidden">
               <div className="w-16 shrink-0 text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest text-right pr-2 border-r border-emerald-700/50 mr-2">Stream<br/>Output</div>
               <div className="flex flex-wrap gap-1.5 w-full">
                 {streamProcessed.map((char, i) => (
                   <motion.div 
                     key={`so-${i}`}
                     initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                     className={`w-8 h-10 md:w-10 md:h-12 flex flex-col items-center justify-center rounded-lg border font-black text-lg md:text-xl transition-all bg-emerald-900/40 border-emerald-500/50 text-emerald-300`}
                   >
                     <span className="text-[10px] text-emerald-500/70 font-mono font-normal mb-0.5">{toHex(char)}</span>
                     {/* Simulasi huruf ciphertext acak menggunakan Hex */}
                     {simStatus === 'completed' || i < tick - 1 ? randomHex()[0] : '?'}
                   </motion.div>
                 ))}
                 {streamProcessed.length === 0 && <span className="text-xs font-mono text-slate-600 italic py-2">Menunggu data...</span>}
               </div>
             </div>

          </div>
          
          {/* Note Latency */}
          <div className="mt-6 text-center text-[10px] text-slate-500 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold">Latensi Rendah:</span> Teks langsung keluar seketika per 1 byte.
          </div>
        </div>

        {/* MESIN 2: BLOCK CIPHER */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
             <div className="flex items-center gap-2 text-amber-400">
               <Package size={20} />
               <h3 className="font-black uppercase tracking-widest text-sm md:text-base">Block Cipher</h3>
             </div>
             <span className="text-[10px] bg-amber-900/30 text-amber-300 px-2 py-1 rounded border border-amber-500/30 font-mono font-bold">{BLOCK_SIZE} Bytes / Block</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-6 w-full min-w-max mx-auto px-4">
             
             {/* Blok-Blok Input */}
             <div className="flex flex-wrap items-center justify-center gap-4 w-full">
               {blockChunks.map((chunk, bIdx) => {
                 const isCompleted = bIdx < completedBlocksCount;
                 const isBuffering = bIdx === completedBlocksCount && isBufferingBlock;
                 const isWaiting = bIdx > completedBlocksCount || (bIdx === completedBlocksCount && !isBufferingBlock && simStatus !== 'completed');
                 
                 return (
                   <div key={`block-${bIdx}`} className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all duration-300 ${isCompleted ? 'bg-amber-900/10 border-amber-500/30' : isBuffering ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' : 'bg-slate-800/30 border-slate-700/50'}`}>
                     
                     <span className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isCompleted ? 'text-amber-500' : isBuffering ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`}>
                       {isCompleted ? `Block ${bIdx+1} Done` : isBuffering ? `Buffering...` : `Block ${bIdx+1}`}
                     </span>
                     
                     <div className="flex gap-1.5">
                       {chunk.map((char, cIdx) => {
                         // Cek apakah karakter ini sudah masuk ke buffer
                         const globalIdx = (bIdx * BLOCK_SIZE) + cIdx;
                         const isCharBuffered = globalIdx < tick;

                         return (
                           <div key={`bc-${bIdx}-${cIdx}`} className={`w-8 h-10 flex items-center justify-center rounded border font-black text-lg transition-all duration-200 ${isCompleted ? 'bg-amber-900/40 border-amber-500/50 text-amber-300' : isCharBuffered ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800/50 border-slate-700/50 text-slate-600'}`}>
                             {isCharBuffered ? char : '-'}
                           </div>
                         )
                       })}
                     </div>
                     
                     {/* Visualisasi Proses Enkripsi Blok (Baru muncul saat blok penuh & dieksekusi) */}
                     {isCompleted && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col items-center mt-2 w-full">
                         <LayoutGrid size={16} className="text-amber-500 my-1 opacity-70" />
                         <div className="flex gap-1.5 w-full bg-slate-900/80 p-1.5 rounded-lg border border-slate-700/50 justify-center">
                            {chunk.map((_, i) => (
                              <span key={`bx-${i}`} className="text-[10px] font-mono font-bold text-amber-500/70">{randomHex()}</span>
                            ))}
                         </div>
                       </motion.div>
                     )}
                   </div>
                 )
               })}
             </div>

          </div>

          {/* Note Latency */}
          <div className="mt-6 text-center text-[10px] text-slate-500 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">Latensi Tinggi:</span> Menunggu blok penuh baru dieksekusi bersamaan.
          </div>
        </div>

      </div>

      <style jsx global>{`
        .beautiful-scrollbar::-webkit-scrollbar, textarea::-webkit-scrollbar {
          width: 8px; height: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-track, textarea::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4); border-radius: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb, textarea::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4); border-radius: 8px; border: 2px solid rgba(15, 23, 42, 1); 
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover, textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
}