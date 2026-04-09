"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Eye, EyeOff, ScanLine, Layers, AlertTriangle } from 'lucide-react';

type GridCell = { char: string; visible: boolean; active: boolean; isPath: boolean; };

type SimEvent = {
  id: number;
  gridState: GridCell[][];
  action: string;
  detail: string;
  hlClass: string;
  outputStr: string;
};

export default function RailFenceCanvas() {
  // --- STATE ---
  const [text, setText] = useState("KRYPTOGRAFISANGATSERU");
  const [rails, setRails] = useState<number>(3); 
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  
  // State UI
  const [showOriginalText, setShowOriginalText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  const isValidRails = rails >= 2 && rails <= 20;

  // --- ENGINE GENERATOR ANIMASI ZIG-ZAG ---
  const generateEvents = (): SimEvent[] => {
    if (cleanText.length === 0 || !isValidRails) return [];
    
    const len = cleanText.length;
    const rCount = rails;
    const generatedEvents: SimEvent[] = [];
    let logId = 0;

    const path: {r: number, c: number}[] = [];
    let currR = 0, dir = 1;
    for(let c = 0; c < len; c++) {
        path.push({r: currR, c});
        currR += dir;
        if (currR === 0 || currR === rCount - 1) dir *= -1;
    }

    const createEmptyGrid = (): GridCell[][] => Array(rCount).fill(null).map(() => Array(len).fill({char: '', visible: false, active: false, isPath: false}));
    const baseGrid = createEmptyGrid();
    path.forEach(p => baseGrid[p.r][p.c] = {...baseGrid[p.r][p.c], isPath: true});

    let currentGrid = JSON.parse(JSON.stringify(baseGrid)) as GridCell[][];
    let outputStr = "";

    if (mode === 'encrypt') {
        for(let i = 0; i < len; i++) {
            const p = path[i];
            const char = cleanText[i];
            currentGrid = currentGrid.map(row => row.map(cell => ({...cell, active: false})));
            currentGrid[p.r][p.c] = { char, visible: true, active: true, isPath: true };

            generatedEvents.push({
               id: logId++, gridState: JSON.parse(JSON.stringify(currentGrid)), outputStr,
               action: `Menempatkan '${char}'`, detail: `Tulis Zig-zag (B:${p.r+1})`, hlClass: 'text-indigo-400'
            });
        }
        for(let r = 0; r < rCount; r++) {
            let rowStr = "";
            currentGrid = currentGrid.map(row => row.map(cell => ({...cell, active: false})));
            const colsInRow = path.filter(p => p.r === r).map(p => p.c);
            
            colsInRow.forEach(c => {
                currentGrid[r][c].active = true;
                rowStr += currentGrid[r][c].char;
            });

            if (rowStr) {
                outputStr += rowStr;
                generatedEvents.push({
                   id: logId++, gridState: JSON.parse(JSON.stringify(currentGrid)), outputStr,
                   action: `Membaca baris ke-${r+1}`, detail: `Ekstrak '${rowStr}'`, hlClass: 'text-emerald-400'
                });
            }
        }
    } else {
        const skel = Array(rCount).fill(null).map(() => Array(len).fill(''));
        path.forEach(p => skel[p.r][p.c] = '?');
        let idx = 0;
        for(let r = 0; r < rCount; r++) {
           for(let c = 0; c < len; c++) {
              if (skel[r][c] === '?') skel[r][c] = cleanText[idx++];
           }
        }

        let charIdx = 0;
        for(let r = 0; r < rCount; r++) {
           for(let c = 0; c < len; c++) {
              if (skel[r][c] !== '') {
                 currentGrid = currentGrid.map(row => row.map(cell => ({...cell, active: false})));
                 const char = skel[r][c];
                 currentGrid[r][c] = { char, visible: true, active: true, isPath: true };
                 
                 generatedEvents.push({
                    id: logId++, gridState: JSON.parse(JSON.stringify(currentGrid)), outputStr,
                    action: `Mengisi '${char}'`, detail: `Tulis Baris ${r+1}`, hlClass: 'text-amber-400'
                 });
                 charIdx++;
              }
           }
        }
        for(let i = 0; i < len; i++) {
            const p = path[i];
            currentGrid = currentGrid.map(row => row.map(cell => ({...cell, active: false})));
            currentGrid[p.r][p.c].active = true;
            const char = currentGrid[p.r][p.c].char;
            outputStr += char;

            generatedEvents.push({
               id: logId++, gridState: JSON.parse(JSON.stringify(currentGrid)), outputStr,
               action: `Membaca '${char}'`, detail: 'Ekstrak Zig-zag', hlClass: 'text-emerald-400'
            });
        }
    }
    return generatedEvents;
  };

  // --- LIFECYCLE & KONTROL ---
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text, mode, rails]);

  useEffect(() => {
    if (logEndRef.current && simStatus === 'running') {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeStepId, simStatus]);

  // Membersihkan memori interval jika user pindah halaman secara tiba-tiba
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); }
  }, []);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setEvents([]);
    setActiveStepId(null);
    setShowOriginalText(false);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
  };

  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const fullEvents = generateEvents();
    setEvents(fullEvents);
    setSimStatus('completed');
    setActiveStepId(null); // Mematikan highlight terakhir secara visual
  };

  const handleProcess = () => {
    if (!isValidRails || simStatus === 'running' || cleanText.length === 0) return;
    
    const fullEvents = generateEvents();
    if (fullEvents.length === 0) return;

    setSimStatus('running');
    setEvents([]);
    setActiveStepId(null);
    setShowOriginalText(false);
    
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < fullEvents.length) {
        setEvents(prev => [...prev, fullEvents[currentIndex]]);
        setActiveStepId(fullEvents[currentIndex].id);
        currentIndex++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimStatus('completed');
        setActiveStepId(null); // Matikan highlight secara visual tanpa merusak array
      }
    }, mode === 'encrypt' ? 400 : 300); 
  };

  // Penentuan State UI
  const activeEvent = events.find(e => e.id === activeStepId) || events[events.length - 1];
  const currentGridState = activeEvent?.gridState || [];
  const currentOutput = activeEvent?.outputStr || "";

  const initialGrid = () => {
    const path: {r: number, c: number}[] = [];
    let currR = 0, dir = 1;
    for(let c = 0; c < cleanText.length; c++) {
        path.push({r: currR, c});
        currR += dir;
        if (currR === 0 || currR === rails - 1) dir *= -1;
    }
    let grid: GridCell[][] = Array(rails).fill(null).map(() => Array(cleanText.length).fill({char: '', visible: false, active: false, isPath: false}));
    path.forEach(p => grid[p.r][p.c] = {...grid[p.r][p.c], isPath: true});
    return grid;
  };
  
  const displayGrid = simStatus === 'idle' && isValidRails && cleanText.length > 0 ? initialGrid() : currentGridState;

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* 1. BAGIAN ATAS: PANEL PENGATURAN & VISUALISASI GRID */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-20 min-h-[300px]">
        
        {/* KIRI: Input Kunci & Diagnostik */}
        <div 
          className="border-b lg:border-b-0 lg:border-r border-slate-700/50 p-6 flex flex-col justify-start gap-6 bg-slate-800/20 shrink-0" 
          style={{ width: '100%', maxWidth: '320px' }} 
        >
          <div className="flex items-center bg-slate-800 p-1.5 rounded-xl relative shadow-inner w-full shrink-0 border border-transparent">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-lg z-0 shadow-sm"
              animate={{ left: mode === 'encrypt' ? '6px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button onClick={() => setMode('encrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${mode === 'encrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Lock size={14} /> Encrypt
            </button>
            <button onClick={() => setMode('decrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${mode === 'decrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Unlock size={14} /> Decrypt
            </button>
          </div>

          <div className="flex flex-col items-center gap-5 w-full">
            
            <div className="flex flex-col w-full">
              <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={12} /> Jumlah Baris (Rails)
              </span>
              <div className={`w-full flex items-center justify-center p-2 rounded-2xl transition-colors shadow-inner border border-transparent ${!isValidRails ? 'bg-rose-900/10' : 'bg-slate-900/40'}`}>
                 <input 
                    type="number" min="2" max="20" value={rails} disabled={simStatus !== 'idle'}
                    onChange={(e) => setRails(parseInt(e.target.value) || 2)}
                    className={`w-full bg-transparent px-4 py-2 font-black text-3xl text-center outline-none transition-colors hide-arrows ${!isValidRails ? 'text-rose-400' : 'text-indigo-300'}`}
                  />
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5 bg-slate-800/40 p-4 rounded-2xl border border-transparent shadow-sm">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Panjang Teks:</span>
                  <span className="font-mono font-bold text-indigo-400">{cleanText.length}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Kedalaman Gelombang:</span>
                  <span className={`font-mono font-bold ${isValidRails ? 'text-emerald-400' : 'text-rose-400'}`}>{rails}</span>
               </div>
               
               <div className="mt-1">
                 {isValidRails ? (
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-500/10 justify-center">
                     <Check size={12} /> Format Valid
                   </div>
                 ) : (
                   <div className="flex items-start gap-2 text-[10px] font-bold text-rose-400 bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-500/10 justify-center">
                     <AlertTriangle size={12} className="shrink-0 mt-0.5" /> Minimal 2 Baris
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>

        {/* KANAN: Visualisasi Grid Zig-Zag */}
        <div className="flex-1 bg-[#0b1120] p-6 flex flex-col relative justify-center overflow-x-auto beautiful-scrollbar">
          
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky-left">
            <ScanLine size={14} className={mode === 'encrypt' ? 'text-indigo-400' : 'text-amber-400'}/> 
            Visualisasi Jalur {mode === 'encrypt' ? 'Penulisan' : 'Pembacaan'}
          </div>

          <div className="w-full min-w-max flex flex-col items-center justify-center mt-6">
            
            {displayGrid.length > 0 ? (
              <div className="flex flex-col gap-1.5 md:gap-2">
                {displayGrid.map((row, rIdx) => (
                  <div key={`row-${rIdx}`} className="flex flex-row gap-1.5 md:gap-2">
                    {row.map((cell, cIdx) => {
                      // Kondisi untuk menyalakan/mematikan highlight cell dengan aman
                      const isCellActive = cell.active && (simStatus === 'running' || activeStepId !== null);
                      
                      return (
                        <div 
                          key={`cell-${rIdx}-${cIdx}`} 
                          className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-md font-bold text-lg md:text-xl transition-all duration-300 border ${
                            isCellActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-110 z-10' : 
                            cell.visible ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' : 
                            cell.isPath ? 'bg-slate-800/30 border-slate-700/30 text-transparent' : 
                            'bg-transparent border-transparent'
                          }`}
                        >
                          {cell.visible ? cell.char : ''}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-slate-600 font-bold text-sm tracking-widest uppercase border border-slate-700 border-dashed rounded-2xl px-8 py-6 bg-slate-900/30">
                 Ketik teks untuk melihat lintasan
               </div>
            )}

          </div>
        </div>

      </div>

      {/* 2. BAGIAN BAWAH: SPLIT LAYOUT */}
      <div className="flex-none flex flex-col lg:flex-row gap-6 h-[400px] z-10">
        
        {/* KIRI: AREA TEKS */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
          
          <div className="relative flex-1 flex flex-col z-10 h-full">
            <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlignLeft size={18} className="text-emerald-400" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">{mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}</span>
                </div>
                
                <AnimatePresence>
                  {simStatus === 'completed' && mode === 'encrypt' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setShowOriginalText(!showOriginalText)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${showOriginalText ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'}`}
                    >
                      {showOriginalText ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showOriginalText ? "Hilangkan Spasi Output" : "Pisahkan per Kolom"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              {simStatus === 'idle' && (
                isEditing ? (
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all">
                    <Check size={14} /> Selesai
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all">
                    <Edit3 size={14} /> Edit Teks
                  </button>
                )
              )}
            </div>

            <div className="flex-1 overflow-y-auto beautiful-scrollbar pr-2 mb-4">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.textarea
                    key="editor"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full min-h-full bg-transparent text-slate-200 text-lg leading-relaxed outline-none resize-none font-medium placeholder-slate-600 uppercase tracking-widest"
                  />
                ) : (
                  <motion.div key="viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 pt-2">
                    
                    {/* Teks Output (Animasi Stream) */}
                    <div className="flex flex-wrap gap-1">
                      {simStatus === 'idle' ? (
                        <span className="text-slate-300 tracking-[0.2em] text-lg font-medium">{cleanText}</span>
                      ) : (
                         currentOutput.split('').map((char, idx) => (
                           <span key={`out-${idx}`} className={`transition-all duration-300 px-1 py-0.5 rounded font-mono text-xl ${idx === currentOutput.length - 1 && simStatus === 'running' ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : 'text-emerald-300 bg-emerald-900/20 border border-emerald-500/20'}`}>
                             {char}
                           </span>
                         ))
                      )}
                    </div>
                    
                    {/* Teks Asli Pembanding */}
                    <AnimatePresence>
                       {showOriginalText && simStatus === 'completed' && (
                         <motion.div 
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="text-slate-500 text-lg font-mono tracking-[0.2em] border-t border-slate-700/50 pt-3 mt-2"
                         >
                            {cleanText}
                         </motion.div>
                       )}
                    </AnimatePresence>

                    {cleanText.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
                {simStatus === 'idle' && (
                  <button onClick={handleProcess} disabled={cleanText.length === 0 || !isValidRails} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi Zig-zag <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
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

        {/* KANAN: AREA LOG */}
        <div className="w-full lg:w-2/5 shrink-0 bg-slate-900/90 shadow-2xl flex flex-col rounded-3xl overflow-hidden h-full relative z-0 border border-transparent">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/80 shrink-0 bg-slate-800/20">
            <div className="flex items-center gap-2">
              <ListTree size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Time-Travel Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Langkah: {events.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {events.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Teks akan disusun ke dalam jalur, lalu dibaca ulang sesuai arah.</span>
              </div>
            )}
            
            {events.map((log, i) => {
              if (!log) return null; // Pengaman ekstra
              const isSelected = activeStepId === log.id;
              return (
                <div 
                  key={log.id} 
                  onClick={() => {
                    if (simStatus === 'completed' || simStatus === 'idle') {
                      setActiveStepId(log.id);
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200 transition-all ${
                    (simStatus === 'completed' || simStatus === 'idle') ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  } ${
                    isSelected 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Lihat bentuk Grid pada langkah ini" : ""}
                >
                  <div className="flex flex-col border-r border-slate-700/50 pr-3 mr-3 shrink-0 w-24">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.detail}</span>
                  </div>
                  
                  <span className={`font-bold text-sm tracking-wider transition-colors ${isSelected ? log.hlClass : 'text-slate-300'}`}>{log.action}</span>
                  
                  {(simStatus === 'completed' || simStatus === 'idle') && (
                    <Eye size={14} className={`ml-auto transition-opacity ${isSelected ? 'opacity-100 text-indigo-400' : 'opacity-0 text-slate-500 group-hover:opacity-100'}`} />
                  )}
                </div>
              );
            })}
            <div ref={logEndRef} className="h-1" />
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
        .sticky-left {
          position: sticky;
          left: 1.5rem;
        }
        .hide-arrows::-webkit-outer-spin-button, .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}