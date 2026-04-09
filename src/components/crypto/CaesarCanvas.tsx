"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward } from 'lucide-react';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const TAPE_ALPHABET = [...ALPHABET, ...ALPHABET, ...ALPHABET]; 

export default function CaesarCanvas() {
  // --- STATE ---
  const [text, setText] = useState("Kriptografi linear dengan pita sempurna. Ujian besok pasti A!");
  const [isEditing, setIsEditing] = useState(false);
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi & Log
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [displayedChars, setDisplayedChars] = useState<{char: string, isActive: boolean, isDone: boolean}[]>([]);
  const [logs, setLogs] = useState<{id: number, p: string, c: string, math: string}[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- DRAG LOGIC PITA BAWAH ---
  const CELL_WIDTH = 40; 
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startShift, setStartShift] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (simStatus !== 'idle') return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartShift(shift);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const steps = Math.round(deltaX / CELL_WIDTH);
    
    if (Math.abs(steps) >= 1) {
      setShift(() => {
        let newShift = mode === 'encrypt' ? startShift - steps : startShift + steps;
        return ((newShift % 26) + 26) % 26; 
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- LOGIKA AUTO-RESIZE & RESET ---
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text, mode, shift]);

  // Auto-scroll Logs
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedChars(text.split('').map(c => ({ char: c, isActive: false, isDone: false })));
    setSimStatus('idle');
    setLogs([]);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
  };

  // Skip Animasi (Langsung Selesai)
  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const finalChars = text.split('').map(char => {
      const upper = char.toUpperCase();
      const isLower = char !== upper;
      const idx = ALPHABET.indexOf(upper);

      let resultChar = char;
      if (idx !== -1) {
        let newIdx = mode === "encrypt" ? (idx + shift) % 26 : (idx - shift) % 26;
        if (newIdx < 0) newIdx += 26;
        resultChar = isLower ? ALPHABET[newIdx].toLowerCase() : ALPHABET[newIdx];
      }
      return { char: resultChar, isActive: false, isDone: true };
    });

    const newLogs: {id: number, p: string, c: string, math: string}[] = [];
    text.split('').forEach((char, currentIndex) => {
      const upper = char.toUpperCase();
      const idx = ALPHABET.indexOf(upper);
      if (idx !== -1) {
        let newIdx = mode === "encrypt" ? (idx + shift) % 26 : (idx - shift) % 26;
        if (newIdx < 0) newIdx += 26;
        newLogs.push({
          id: currentIndex, p: upper, c: ALPHABET[newIdx],
          math: `(${idx} ${mode === 'encrypt' ? '+' : '-'} ${shift}) mod 26 = ${newIdx}`
        });
      }
    });

    setDisplayedChars(finalChars);
    setLogs(newLogs);
    setSimStatus('completed');
  };

  // --- LOGIKA ANIMASI SATU-PER-SATU ---
  const handleProcess = () => {
    if (simStatus === 'running' || text.trim().length === 0) return;
    setSimStatus('running');
    setLogs([]);
    
    setDisplayedChars(text.split('').map(c => ({ char: c, isActive: false, isDone: false })));
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayedChars(prev => {
        const newChars = prev.map(item => ({ ...item, isActive: false }));
        
        if (currentIndex > 0 && currentIndex - 1 < newChars.length) {
          newChars[currentIndex - 1].isDone = true;
        }

        if (currentIndex < text.length) {
          const char = text[currentIndex];
          const upper = char.toUpperCase();
          const isLower = char !== upper;
          const idx = ALPHABET.indexOf(upper);
          
          let resultChar = char;
          if (idx !== -1) {
            let newIdx = mode === "encrypt" ? (idx + shift) % 26 : (idx - shift) % 26;
            if (newIdx < 0) newIdx += 26;
            resultChar = isLower ? ALPHABET[newIdx].toLowerCase() : ALPHABET[newIdx];
            
            setLogs(currLogs => [...currLogs, {
              id: currentIndex, p: upper, c: resultChar.toUpperCase(),
              math: `(${idx} ${mode === 'encrypt' ? '+' : '-'} ${shift}) mod 26 = ${newIdx}`
            }]);
          }
          
          newChars[currentIndex] = { char: resultChar, isActive: true, isDone: false };
        }

        return newChars;
      });

      currentIndex++;

      if (currentIndex > text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimStatus('completed');
      }
    }, 45); 
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); }
  }, []);

  // --- KALKULASI VISUAL PITA ---
  // Penambahan CELL_WIDTH/2 menjamin tengah huruf tepat di garis tengah layar
  const centerOffset = (26 * CELL_WIDTH) + (CELL_WIDTH / 2); 
  const topTapeOffset = -centerOffset;
  const tapeShift = mode === 'encrypt' ? shift : -shift;
  const bottomTapeOffset = -(centerOffset + (tapeShift * CELL_WIDTH));

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200">
      
      {/* 1. BAGIAN ATAS: PITA LINEAR (TAPE) */}
      <div className="w-full shrink-0 flex flex-col bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden select-none">
        
        {/* Header Pita */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-4 mb-2 md:mb-0">
            <div className="flex items-center bg-slate-800 p-1 rounded-full border border-slate-700 w-48 relative">
              <motion.div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full z-0"
                animate={{ left: mode === 'encrypt' ? '4px' : 'calc(50%)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button onClick={() => setMode('encrypt')} disabled={simStatus !== 'idle'} className={`relative z-10 w-1/2 py-1.5 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'encrypt' ? 'text-white' : 'text-slate-400'} disabled:opacity-50`}>
                <Lock size={12} /> Enkripsi
              </button>
              <button onClick={() => setMode('decrypt')} disabled={simStatus !== 'idle'} className={`relative z-10 w-1/2 py-1.5 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'decrypt' ? 'text-white' : 'text-slate-400'} disabled:opacity-50`}>
                <Unlock size={12} /> Dekripsi
              </button>
            </div>
            
            {/* Input Manual Shift */}
            <div className="flex items-center gap-2 text-sm bg-indigo-600/10 px-3 py-1 rounded-lg border border-indigo-500/30">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Shift (k) :</span>
              <input 
                type="number" min="0" max="25" value={shift}
                disabled={simStatus !== 'idle'}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  setShift(((val % 26) + 26) % 26);
                }}
                className="w-8 bg-transparent font-black text-xl text-indigo-400 outline-none text-center disabled:opacity-50 hide-arrows"
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden md:block">Tarik pita bawah ke kiri/kanan untuk menggeser kunci sandi</span>
        </div>

        {/* Visualisasi Pita Huruf */}
        <div className="relative w-full h-32 bg-[#0b1120] flex flex-col justify-center overflow-hidden mask-edges" style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
          
          {/* Highlight "Pill" Vertikal Cantik */}
          <div className="absolute left-1/2 top-2 bottom-2 w-[48px] -translate-x-1/2 bg-indigo-500/10 border border-indigo-400/50 rounded-xl z-0 pointer-events-none shadow-[inset_0_0_15px_rgba(99,102,241,0.2),_0_0_20px_rgba(99,102,241,0.4)]" />

          {/* Pita Atas (Plaintext - Diam) */}
          <div className="relative z-10 flex h-12 items-center justify-center border-b border-slate-800">
            <motion.div 
              className="absolute left-1/2 flex"
              animate={{ x: topTapeOffset }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {TAPE_ALPHABET.map((letter, i) => {
                // Indeks 26 adalah pusat (Huruf A dari set kedua)
                const isCenter = i === 26; 
                return (
                  <div key={`top-${i}`} className={`flex items-center justify-center transition-all duration-300 ${isCenter ? 'text-2xl font-black text-indigo-300 scale-110 drop-shadow-lg z-20' : 'text-lg font-bold text-slate-400'}`} style={{ width: CELL_WIDTH }}>
                    {letter}
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Pita Bawah (Ciphertext - Draggable) */}
          <div 
            className={`relative z-10 flex h-14 items-center justify-center transition-colors ${simStatus !== 'idle' ? 'opacity-50 pointer-events-none' : 'cursor-grab active:cursor-grabbing hover:bg-slate-800/40'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <motion.div 
              className="absolute left-1/2 flex"
              animate={{ x: bottomTapeOffset }}
              transition={{ type: isDragging ? false : "spring", stiffness: 300, damping: 30 }}
            >
              {TAPE_ALPHABET.map((letter, i) => {
                // Pusat pita bawah akan bergeser sesuai tapeShift
                const isCenter = i === 26 + tapeShift;
                return (
                  <div key={`bot-${i}`} className={`flex items-center justify-center transition-all duration-300 ${isCenter ? 'text-3xl font-black text-emerald-400 scale-125 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] z-20' : 'text-2xl font-black text-indigo-400 drop-shadow-md'}`} style={{ width: CELL_WIDTH }}>
                    {letter}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. BAGIAN BAWAH: SPLIT LAYOUT FIXED HEIGHT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[400px] min-h-[400px] max-h-[400px]">
        
        {/* KIRI: AREA TEKS */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
          
          <div className="relative flex-1 flex flex-col z-10 h-full">
            <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-slate-400">
                <AlignLeft size={18} className="text-emerald-400" />
                <span className="font-bold uppercase tracking-widest text-[11px]">Dokumen Input</span>
              </div>
              
              {simStatus === 'idle' && (
                isEditing ? (
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all">
                    <Check size={14} /> Selesai
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all">
                    <Edit3 size={14} /> Edit
                  </button>
                )
              )}
            </div>

            {/* Area Teks / Input Scrollable */}
            <div className="flex-1 overflow-y-auto beautiful-scrollbar pr-2 mb-4">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.textarea
                    key="editor"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full min-h-full bg-transparent text-slate-200 text-lg leading-relaxed outline-none resize-none font-medium placeholder-slate-600"
                  />
                ) : (
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-lg leading-relaxed font-medium whitespace-pre-wrap break-words"
                  >
                    {displayedChars.map((item, idx) => (
                      <span 
                        key={idx} 
                        className={`transition-all duration-75 px-[1px] rounded-sm ${item.isActive ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : item.isDone ? 'text-emerald-300' : 'text-slate-200'}`}
                      >
                        {item.char}
                      </span>
                    ))}
                    {displayedChars.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tombol Aksi */}
            {!isEditing && (
              <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
                {simStatus === 'idle' && (
                  <button onClick={handleProcess} disabled={text.trim().length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi Sandi <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
                  </button>
                )}
                
                {simStatus === 'running' && (
                  <div className="flex gap-2">
                    <button onClick={cancelSimulation} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95">
                      <XSquare size={16} /> Batal
                    </button>
                    <button onClick={skipSimulation} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95">
                      <FastForward size={16} /> Skip
                    </button>
                  </div>
                )}

                {simStatus === 'completed' && (
                  <button onClick={resetSimulation} className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
                    <RotateCcw size={16} /> Reset Ulang
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KANAN: AREA LOG FIXED HEIGHT TANPA BORDER PUTIH */}
        <div className="w-full lg:w-2/5 shrink-0 bg-slate-900/90 shadow-2xl flex flex-col rounded-3xl overflow-hidden h-full border-none">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0 bg-slate-800/30">
            <div className="flex items-center gap-2">
              <ListTree size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Logs</span>
            </div>
            <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 font-mono">Terekam: {logs.length}</span>
          </div>
          
          {/* Custom Scrollbar Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <span className="text-[11px] text-slate-500 italic px-4">Jalankan eksekusi untuk melihat kalkulasi modulo tiap huruf.</span>
              </div>
            )}
            
            {logs.map((log, i) => (
              <div key={i} className="bg-slate-800/40 px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200">
                <span className="font-bold text-slate-300 text-base w-5 text-center">{log.p}</span>
                <span className="text-slate-600 mx-2 text-xs">→</span>
                <span className="font-black text-emerald-400 text-lg w-5 text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{log.c}</span>
                <span className="text-[11px] text-slate-500 ml-auto border-l border-slate-700/50 pl-3 flex items-center tracking-tight">
                  {log.math}
                </span>
              </div>
            ))}
            <div ref={logEndRef} className="h-1" />
          </div>
        </div>

      </div>

      <style jsx global>{`
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        /* Styling Custom Scrollbar Estetik */
        .beautiful-scrollbar::-webkit-scrollbar, textarea::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-track, textarea::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb, textarea::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 8px;
          border: 2px solid rgba(15, 23, 42, 1); /* Memberi efek gap padding */
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover, textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        /* Menghilangkan panah spinner pada input number */
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}