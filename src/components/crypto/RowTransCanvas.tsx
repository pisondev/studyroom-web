"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Eye, EyeOff, AlignJustify, Key, AlertTriangle } from 'lucide-react';

type LogEntry = { 
  id: number;
  step: number;
  colIndex: number;
  keyNumber: number;
  extractedText: string;
};

export default function RowTransCanvas() {
  // --- STATE ---
  const [text, setText] = useState("WEAREDISCOVEREDFLEEATONCE");
  const [keyword, setKeyword] = useState("43125"); 
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0); 
  const [outputChunks, setOutputChunks] = useState<{chunk: string, isActive: boolean}[]>([]);
  
  // State Interaktif UI
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA KEY PARSER & VALIDASI ---
  let parsedKey: number[] = [];
  if (keyword.includes(',') || keyword.includes(' ')) {
    parsedKey = keyword.split(/[,\s]+/).filter(Boolean).map(Number);
  } else {
    parsedKey = keyword.split('').map(Number);
  }

  const uniqueKey = Array.from(new Set(parsedKey));
  const maxVal = Math.max(...(uniqueKey.length > 0 ? uniqueKey : [0]));
  const isValidKey = uniqueKey.length > 0 && uniqueKey.length === parsedKey.length && maxVal === parsedKey.length && Math.min(...parsedKey) === 1;

  // --- LOGIKA GRID ---
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  const numCols = isValidKey ? parsedKey.length : 1;
  const numRows = Math.max(1, Math.ceil(cleanText.length / numCols));
  const paddedText = cleanText.padEnd(numRows * numCols, 'X');

  // Helper untuk membangun Grid (2D Array)
  const buildGrid = () => {
    let grid: string[][] = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
    
    if (mode === 'encrypt') {
      // Encrypt: Tulis Mendatar (Horizontal)
      let idx = 0;
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          grid[r][c] = paddedText[idx++] || 'X';
        }
      }
    } else {
      // Decrypt: Tulis Menurun (Vertikal) berdasarkan urutan Key
      let idx = 0;
      for (let step = 1; step <= numCols; step++) {
        const c = parsedKey.indexOf(step);
        if (c !== -1) {
          for (let r = 0; r < numRows; r++) {
            grid[r][c] = paddedText[idx++] || 'X';
          }
        }
      }
    }
    return grid;
  };

  const gridData = isValidKey ? buildGrid() : [];

  // --- AUTO-RESIZE & RESET ---
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
    setSimStatus('idle');
    setLogs([]);
    setOutputChunks([]);
    setActiveStep(0);
    setActiveLogId(null);
    setShowOriginalText(false);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setActiveLogId(null);
  };

  const processStep = (step: number): LogEntry => {
    const keyNumber = step;
    const colIndex = parsedKey.indexOf(keyNumber);
    
    let extracted = "";
    if (mode === 'encrypt') {
      for (let r = 0; r < numRows; r++) extracted += gridData[r][colIndex];
    } else {
      for (let r = 0; r < numRows; r++) extracted += gridData[r][colIndex];
    }

    return { id: step, step, colIndex, keyNumber, extractedText: extracted };
  };

  const skipSimulation = () => {
    if (!isValidKey || cleanText.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const newLogs: LogEntry[] = [];
    const newChunks: {chunk: string, isActive: boolean}[] = [];
    
    for (let step = 1; step <= numCols; step++) {
      const log = processStep(step);
      newLogs.push(log);
      newChunks.push({ chunk: log.extractedText, isActive: false });
    }

    // Jika Decrypt, output final adalah baca baris per baris
    if (mode === 'decrypt') {
      let finalPlaintext = "";
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          finalPlaintext += gridData[r][c];
        }
      }
      setOutputChunks([{ chunk: finalPlaintext, isActive: false }]);
    } else {
      setOutputChunks(newChunks);
    }

    setLogs(newLogs);
    setActiveStep(numCols + 1);
    setSimStatus('completed');
    setActiveLogId(null);
  };

  const handleProcess = () => {
    if (!isValidKey || simStatus === 'running' || cleanText.length === 0) return;
    setSimStatus('running');
    setLogs([]);
    setOutputChunks([]);
    setActiveLogId(null);
    setShowOriginalText(false);
    
    let currentStep = 1;
    setActiveStep(currentStep);

    intervalRef.current = setInterval(() => {
      if (currentStep <= numCols) {
        const logData = processStep(currentStep);
        setLogs(curr => [...curr, logData]);
        
        if (mode === 'encrypt') {
          setOutputChunks(curr => [
            ...curr.map(c => ({...c, isActive: false})),
            { chunk: logData.extractedText, isActive: true }
          ]);
        }
        
        currentStep++;
        setActiveStep(currentStep);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        if (mode === 'decrypt') {
          let finalPlaintext = "";
          for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
              finalPlaintext += gridData[r][c];
            }
          }
          setOutputChunks([{ chunk: finalPlaintext, isActive: false }]);
        } else {
          setOutputChunks(curr => curr.map(c => ({...c, isActive: false})));
        }
        
        setSimStatus('completed');
      }
    }, 1000); 
  };

  // Logika Visual Grid
  const getCellStatus = (r: number, c: number) => {
    if (simStatus === 'idle') return { visible: true, active: false };
    
    const keyAtCol = parsedKey[c];
    const isColActive = keyAtCol === activeStep || (simStatus === 'completed' && activeLogId === keyAtCol);
    
    if (mode === 'encrypt') {
      return { visible: true, active: isColActive };
    } else {
      // Decrypt: Kolom hanya terlihat jika sudah diproses
      const visible = keyAtCol < activeStep || simStatus === 'completed';
      return { visible, active: isColActive };
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* 1. BAGIAN ATAS: PANEL PENGATURAN & GRID TRANSPOSISI */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-20 min-h-[280px]">
        
        {/* KIRI: Input Kunci & Diagnostik */}
        <div 
          className="border-b lg:border-b-0 lg:border-r border-slate-700/50 p-6 flex flex-col justify-start gap-6 bg-slate-800/20 shrink-0" 
          style={{ width: '100%', maxWidth: '340px' }} 
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
            
            <div className="flex flex-col items-center w-full">
              <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                <Key size={12} /> Kunci Transposisi (Angka)
              </span>
              <div className={`w-full flex items-center justify-center p-2 rounded-2xl transition-colors shadow-inner border border-transparent ${!isValidKey ? 'bg-rose-900/10' : 'bg-slate-900/40'}`}>
                 <input 
                    type="text" value={keyword} disabled={simStatus !== 'idle'}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Contoh: 43125"
                    className={`w-full bg-transparent px-4 py-2 font-black text-xl text-center outline-none uppercase placeholder-slate-600 transition-colors ${!isValidKey ? 'text-rose-400' : 'text-indigo-300'}`}
                  />
              </div>
              <span className="text-[9px] text-slate-500 mt-2 text-center">Gunakan angka urut 1 sampai N.<br/>Bisa pakai spasi (Contoh: 4 1 3 2)</span>
            </div>

            <div className="w-full flex flex-col gap-2.5 bg-slate-800/40 p-4 rounded-2xl border border-transparent shadow-sm">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Panjang Teks:</span>
                  <span className="font-mono font-bold text-indigo-400">{paddedText.length} <span className="text-[9px] text-slate-600">({cleanText.length})</span></span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Ukuran Grid:</span>
                  <span className={`font-mono font-bold text-emerald-400`}>{isValidKey ? `${numCols} Kolom × ${numRows} Baris` : '-'}</span>
               </div>
               
               <div className="mt-1">
                 {isValidKey ? (
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-500/10 justify-center">
                     <Check size={12} /> Kunci Permutasi Valid
                   </div>
                 ) : (
                   <div className="flex items-start gap-2 text-[10px] font-bold text-rose-400 bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-500/10 justify-center">
                     <AlertTriangle size={12} className="shrink-0 mt-0.5" /> Invalid (Urutan tidak lengkap)
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>

        {/* KANAN: Visualisasi Grid Transposisi */}
        <div className="flex-1 bg-[#0b1120] p-6 flex flex-col relative justify-center overflow-x-auto beautiful-scrollbar">
          
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky-left">
            <AlignJustify size={14} className={mode === 'encrypt' ? 'text-indigo-400' : 'text-amber-400'}/> 
            Visualisasi Grid ({mode === 'encrypt' ? 'Baca Vertikal' : 'Baca Horizontal'})
          </div>

          <div className="flex flex-col items-center justify-center w-full min-w-max mt-8 px-4">
            
            {isValidKey ? (
              <div className="flex flex-col gap-2">
                {/* Header Kunci */}
                <div className="flex gap-2 mb-2">
                  {parsedKey.map((k, i) => {
                    const isColActive = k === activeStep || (simStatus === 'completed' && activeLogId === k);
                    return (
                      <div key={`header-${i}`} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-black text-xl md:text-2xl transition-all duration-300 border-2 ${isColActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-10' : 'bg-slate-800 border-slate-700 text-indigo-400'}`}>
                        {k}
                      </div>
                    );
                  })}
                </div>
                
                {/* Baris Tabel */}
                {gridData.map((row, rIdx) => (
                  <div key={`row-${rIdx}`} className="flex gap-2">
                    {row.map((char, cIdx) => {
                      const status = getCellStatus(rIdx, cIdx);
                      return (
                        <div key={`cell-${rIdx}-${cIdx}`} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md font-bold text-xl md:text-2xl transition-all duration-500 border ${status.active ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-105 z-10' : status.visible ? 'bg-slate-900 border-slate-700/50 text-slate-300' : 'bg-slate-900/20 border-slate-800/30 text-transparent'}`}>
                          {status.visible ? char : ''}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 font-bold text-sm tracking-widest uppercase border border-slate-700 border-dashed rounded-2xl px-8 py-6 bg-slate-900/30">
                Menunggu Kunci Valid
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
                  <span className="font-bold uppercase tracking-widest text-[11px]">{mode === 'encrypt' ? 'Input Plaintext' : 'Input Ciphertext'}</span>
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
                  <motion.div key="viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg leading-relaxed font-medium whitespace-pre-wrap break-words flex flex-wrap gap-x-2 gap-y-3 pt-2">
                    
                    {simStatus === 'idle' && <span className="text-slate-300 tracking-widest">{cleanText}</span>}

                    {simStatus !== 'idle' && outputChunks.map((chunkObj, idx) => (
                      <span key={idx} className={`transition-all duration-300 px-1 py-0.5 rounded font-mono tracking-[0.2em] text-lg ${chunkObj.isActive ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : 'text-emerald-300 bg-emerald-900/20 border border-emerald-500/20'} ${showOriginalText ? 'mx-1' : 'mx-0'}`}>
                        {chunkObj.chunk}
                      </span>
                    ))}
                    {cleanText.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
                {simStatus === 'idle' && (
                  <button onClick={handleProcess} disabled={cleanText.trim().length === 0 || !isValidKey} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi Transposisi <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
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
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Kolom Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Langkah: {logs.length} / {numCols}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Eksekusi untuk melihat proses {mode === 'encrypt' ? 'pembacaan vertikal' : 'pengisian vertikal'} kolom demi kolom.</span>
              </div>
            )}
            
            {logs.map((log, i) => {
              const isSelected = activeLogId === log.keyNumber;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (simStatus === 'completed' || simStatus === 'idle') {
                      setActiveLogId(log.keyNumber);
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200 transition-all ${
                    (simStatus === 'completed' || simStatus === 'idle') ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  } ${
                    isSelected 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Lihat di Grid" : ""}
                >
                  <div className="flex flex-col items-center border-r border-slate-700/50 pr-3 mr-3">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Kunci</span>
                    <span className={`font-black text-lg transition-colors ${isSelected ? 'text-indigo-400' : 'text-indigo-300'}`}>{log.keyNumber}</span>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{mode === 'encrypt' ? 'Ekstrak Teks' : 'Tulis Teks'}</span>
                    <span className={`font-bold text-sm tracking-[0.2em] transition-colors ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>{log.extractedText}</span>
                  </div>
                  
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
        .sticky-left {
          position: sticky;
          left: 1.5rem;
        }
      `}</style>
    </div>
  );
}