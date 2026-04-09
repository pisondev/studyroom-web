"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Key, Eye, EyeOff, Grid3x3 } from 'lucide-react';

type Point = { r: number; c: number };
type LogEntry = { 
  id: number, p1: string, p2: string, c1: string, c2: string, 
  rule: 'Baris (Kanan)' | 'Baris (Kiri)' | 'Kolom (Bawah)' | 'Kolom (Atas)' | 'Persegi',
  posP1: Point, posP2: Point, posC1: Point, posC2: Point
};

export default function PlayfairCanvas() {
  // --- STATE ---
  const [text, setText] = useState("Ujian KKI besok pasti lancar dan dapat nilai A");
  const [keyword, setKeyword] = useState("STUDYROOM");
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [processedPairs, setProcessedPairs] = useState<{p1: string, p2: string, c1: string, c2: string, isActive: boolean, isDone: boolean}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // State Interaktif UI
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [activeMatrixPoints, setActiveMatrixPoints] = useState<{p1?: Point, p2?: Point, c1?: Point, c2?: Point} | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA PLAYFAIR (MATRIKS) ---
  const generateMatrix = (key: string) => {
    const cleanKey = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // Tanpa J
    const combinedString = cleanKey + alphabet;
    
    const uniqueChars: string[] = [];
    for (let char of combinedString) {
      if (!uniqueChars.includes(char)) uniqueChars.push(char);
    }

    const matrix: string[][] = [];
    for (let i = 0; i < 25; i += 5) {
      matrix.push(uniqueChars.slice(i, i + 5));
    }
    return matrix;
  };

  const currentMatrix = generateMatrix(keyword);

  const findPos = (matrix: string[][], char: string): Point => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (matrix[r][c] === char) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  };

  // --- PREPARASI TEKS KE DALAM BIGRAM ---
  const formatTextToPairs = (inputText: string) => {
    let cleanText = inputText.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
    let pairs: {p1: string, p2: string}[] = [];
    
    for (let i = 0; i < cleanText.length; i++) {
      let char1 = cleanText[i];
      let char2 = cleanText[i+1];
      
      if (!char2) {
        pairs.push({ p1: char1, p2: 'X' });
      } else if (char1 === char2) {
        pairs.push({ p1: char1, p2: 'X' });
      } else {
        pairs.push({ p1: char1, p2: char2 });
        i++; 
      }
    }
    return pairs;
  };

  // --- AUTO-RESIZE ---
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text, mode, keyword]);

  useEffect(() => {
    if (logEndRef.current && simStatus === 'running') {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, simStatus]);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const initialPairs = formatTextToPairs(text).map(pair => ({ ...pair, c1: pair.p1, c2: pair.p2, isActive: false, isDone: false }));
    setProcessedPairs(initialPairs);
    setSimStatus('idle');
    setLogs([]);
    setActiveLogId(null);
    setActiveMatrixPoints(null);
    setShowOriginalText(false);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setActiveLogId(null);
    setActiveMatrixPoints(null);
  };

  const processPair = (p1: string, p2: string, id: number): LogEntry => {
    const pos1 = findPos(currentMatrix, p1);
    const pos2 = findPos(currentMatrix, p2);
    let c1 = '', c2 = '', posC1: Point, posC2: Point;
    let rule: LogEntry['rule'] = 'Persegi';

    if (pos1.r === pos2.r) { 
      rule = mode === 'encrypt' ? 'Baris (Kanan)' : 'Baris (Kiri)';
      const shift = mode === 'encrypt' ? 1 : 4; 
      posC1 = { r: pos1.r, c: (pos1.c + shift) % 5 };
      posC2 = { r: pos2.r, c: (pos2.c + shift) % 5 };
    } else if (pos1.c === pos2.c) { 
      rule = mode === 'encrypt' ? 'Kolom (Bawah)' : 'Kolom (Atas)';
      const shift = mode === 'encrypt' ? 1 : 4;
      posC1 = { r: (pos1.r + shift) % 5, c: pos1.c };
      posC2 = { r: (pos2.r + shift) % 5, c: pos2.c };
    } else { 
      rule = 'Persegi';
      posC1 = { r: pos1.r, c: pos2.c };
      posC2 = { r: pos2.r, c: pos1.c };
    }

    c1 = currentMatrix[posC1.r][posC1.c];
    c2 = currentMatrix[posC2.r][posC2.c];

    return { id, p1, p2, c1, c2, rule, posP1: pos1, posP2: pos2, posC1, posC2 };
  };

  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const pairs = formatTextToPairs(text);
    const newLogs: LogEntry[] = [];
    const finalPairs = pairs.map((pair, idx) => {
      const log = processPair(pair.p1, pair.p2, idx);
      newLogs.push(log);
      return { p1: pair.p1, p2: pair.p2, c1: log.c1, c2: log.c2, isActive: false, isDone: true };
    });

    setProcessedPairs(finalPairs);
    setLogs(newLogs);
    setSimStatus('completed');
    setActiveLogId(null);
    setActiveMatrixPoints(null);
  };

  const handleProcess = () => {
    if (simStatus === 'running' || text.trim().length === 0) return;
    setSimStatus('running');
    setLogs([]);
    setActiveLogId(null);
    setActiveMatrixPoints(null);
    setShowOriginalText(false);
    
    const initialPairs = formatTextToPairs(text);
    setProcessedPairs(initialPairs.map(p => ({ ...p, c1: p.p1, c2: p.p2, isActive: false, isDone: false })));
    
    let currentIndex = 0;
    intervalRef.current = setInterval(() => {
      setProcessedPairs(prev => {
        const newPairs = prev.map(item => ({ ...item, isActive: false }));
        if (currentIndex > 0 && currentIndex - 1 < newPairs.length) {
          newPairs[currentIndex - 1].isDone = true;
        }

        if (currentIndex < initialPairs.length) {
          const currentPair = initialPairs[currentIndex];
          const logData = processPair(currentPair.p1, currentPair.p2, currentIndex);
          
          setLogs(currLogs => [...currLogs, logData]);
          setActiveMatrixPoints({ p1: logData.posP1, p2: logData.posP2, c1: logData.posC1, c2: logData.posC2 });
          
          newPairs[currentIndex] = { p1: currentPair.p1, p2: currentPair.p2, c1: logData.c1, c2: logData.c2, isActive: true, isDone: false };
        }
        return newPairs;
      });

      currentIndex++;
      if (currentIndex > initialPairs.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveMatrixPoints(null);
        setSimStatus('completed');
      }
    }, 600); 
  };

  const flatMatrix = currentMatrix.flat();

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200">
      
      {/* 1. BAGIAN ATAS: PANEL MATRIKS KUNCI */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-20 min-h-[240px]">
        
        {/* Kiri: Pengaturan Kunci & Mode */}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700/50 p-6 flex flex-col justify-start gap-6 bg-slate-800/20">
          <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700/50 relative shadow-inner w-full">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-lg z-0 shadow-sm"
              animate={{ left: mode === 'encrypt' ? '6px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button onClick={() => setMode('encrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'encrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Lock size={14} /> Encrypt
            </button>
            <button onClick={() => setMode('decrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'decrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Unlock size={14} /> Decrypt
            </button>
          </div>

          <div className="flex flex-col gap-2 relative group mt-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-widest flex items-center gap-1.5">
               <Key size={12} /> Keyword Generator
            </span>
            <div className={`w-full flex items-center rounded-xl border-2 transition-all duration-200 ${simStatus === 'idle' ? 'border-slate-600 bg-slate-900 hover:border-amber-400 focus-within:border-amber-500 shadow-inner' : 'border-slate-700 bg-slate-800 opacity-70'}`}>
                <input 
                  type="text" value={keyword} disabled={simStatus !== 'idle'}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Masukkan Kunci..."
                  className="w-full bg-transparent px-4 py-3 font-bold text-lg text-amber-400 outline-none uppercase placeholder-slate-600"
                />
            </div>
            <p className="text-[10px] text-slate-500">Huruf J digabung dengan I. Duplikat dibuang.</p>
          </div>
        </div>

        {/* Kanan: Visualisasi Matriks 5x5 */}
        {/* PERBAIKAN: Layout diatur vertikal secara terpusat, teks tidak absolute */}
        <div className="flex-1 bg-[#0b1120] p-6 flex flex-col items-center justify-center relative min-h-[250px]">
          
          <div className="w-full max-w-[280px] flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Grid3x3 size={14} className="text-emerald-400"/> Playfair Matrix 5x5
          </div>
          
          <div className="mx-auto pb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: 'fit-content' }}>
            {flatMatrix.map((char, index) => {
              const rIdx = Math.floor(index / 5);
              const cIdx = index % 5;
              
              const isP1 = activeMatrixPoints?.p1?.r === rIdx && activeMatrixPoints?.p1?.c === cIdx;
              const isP2 = activeMatrixPoints?.p2?.r === rIdx && activeMatrixPoints?.p2?.c === cIdx;
              const isC1 = activeMatrixPoints?.c1?.r === rIdx && activeMatrixPoints?.c1?.c === cIdx;
              const isC2 = activeMatrixPoints?.c2?.r === rIdx && activeMatrixPoints?.c2?.c === cIdx;
              
              let boxClass = "bg-slate-800 border-slate-700 text-slate-500";
              if (isC1 || isC2) boxClass = "bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] text-emerald-400 font-black scale-110 z-10";
              else if (isP1 || isP2) boxClass = "bg-indigo-900/40 border-indigo-500 text-indigo-300 font-bold opacity-70";
              
              return (
                <div key={index} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${boxClass}`}>
                  {char}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. BAGIAN BAWAH: SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[400px] min-h-[400px] max-h-[400px] z-10">
        
        {/* KIRI: AREA TEKS */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
          
          <div className="relative flex-1 flex flex-col z-10 h-full">
            <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlignLeft size={18} className="text-emerald-400" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Bigram Teks</span>
                </div>
                
                <AnimatePresence>
                  {simStatus === 'completed' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setShowOriginalText(!showOriginalText)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${showOriginalText ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'}`}
                    >
                      {showOriginalText ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showOriginalText ? "Sembunyikan Asli" : "Tampilkan Asli"}
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
                    <Edit3 size={14} /> Edit
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
                    className="w-full min-h-full bg-transparent text-slate-200 text-lg leading-relaxed outline-none resize-none font-medium placeholder-slate-600"
                  />
                ) : (
                  <motion.div key="viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg leading-relaxed font-medium whitespace-pre-wrap break-words flex flex-wrap gap-2 pt-4">
                    {processedPairs.map((pair, idx) => (
                      <span key={idx} className="relative inline-flex flex-col items-center mt-2">
                        <AnimatePresence>
                          {showOriginalText && (
                            <motion.span 
                              initial={{ opacity: 0, y: 5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 5, height: 0 }} transition={{ duration: 0.2 }}
                              className="text-base tracking-widest text-slate-500/70 absolute -top-6 whitespace-nowrap"
                            >
                              {pair.p1}{pair.p2}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        
                        <span className={`transition-all duration-75 px-1 py-0.5 rounded-md tracking-widest ${pair.isActive ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : pair.isDone ? 'text-emerald-300 bg-emerald-900/20 border border-emerald-500/20' : 'text-slate-200 bg-slate-800/50'}`}>
                          {pair.c1}{pair.c2}
                        </span>
                      </span>
                    ))}
                    {processedPairs.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
                {simStatus === 'idle' && (
                  <button onClick={handleProcess} disabled={text.trim().length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi Mesin <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
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
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Matriks Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Bigram: {logs.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Teks akan dipecah menjadi bigram. Aturan matriks akan ditampilkan di sini setelah mesin dieksekusi.</span>
              </div>
            )}
            
            {logs.map((log, i) => {
              const isSelected = activeLogId === log.id;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (simStatus === 'completed' || simStatus === 'idle') {
                      setActiveLogId(log.id);
                      setActiveMatrixPoints({ p1: log.posP1, p2: log.posP2, c1: log.posC1, c2: log.posC2 });
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200 transition-all ${
                    (simStatus === 'completed' || simStatus === 'idle') ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  } ${
                    isSelected 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Lihat posisi di Matriks" : ""}
                >
                  <span className={`font-bold text-base tracking-widest text-center transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>{log.p1}{log.p2}</span>
                  <span className="text-slate-600 mx-2 text-xs">→</span>
                  <span className="font-black text-emerald-400 text-lg tracking-widest text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{log.c1}{log.c2}</span>
                  <span className={`text-[10px] ml-auto border-l pl-3 flex items-center tracking-tight transition-colors ${isSelected ? 'text-indigo-200 border-indigo-500/40 font-bold' : 'text-slate-400 border-slate-700/40'}`}>
                    {log.rule}
                  </span>
                  
                  {(simStatus === 'completed' || simStatus === 'idle') && (
                    <Eye size={14} className={`ml-3 transition-opacity ${isSelected ? 'opacity-100 text-indigo-400' : 'opacity-0 text-slate-500'}`} />
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
      `}</style>
    </div>
  );
}