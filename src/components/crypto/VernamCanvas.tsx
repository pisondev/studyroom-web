"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Eye, EyeOff, Binary, Zap, Key, ShieldCheck, AlertTriangle } from 'lucide-react';

// Helper Konversi
const charToBin = (char: string) => char.charCodeAt(0).toString(2).padStart(8, '0');
const binToHex = (bin: string) => parseInt(bin, 2).toString(16).padStart(2, '0').toUpperCase();
const safeChar = (code: number) => (code >= 32 && code <= 126) ? String.fromCharCode(code) : '·';

type LogEntry = { 
  id: number, p: string, k: string, c: string, 
  binP: string, binK: string, binC: string, hexC: string,
  mathDetail: string
};

export default function VernamCanvas() {
  // --- STATE ---
  const [text, setText] = useState("RAHASIA");
  const [keyword, setKeyword] = useState("BINTANG"); 
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [processedChars, setProcessedChars] = useState<{p: string, k: string, binC: string, hexC: string, charC: string, isActive: boolean, isDone: boolean}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // State Interaktif UI
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [activeStepData, setActiveStepData] = useState<LogEntry | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const cleanText = text.toUpperCase();
  const cleanKey = keyword.toUpperCase() || 'A';
  const isOTP = cleanKey.length >= cleanText.length;

  const generateOTP = () => {
    if (simStatus !== 'idle') return;
    let res = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i = 0; i < cleanText.length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setKeyword(res);
  };

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
    const initialData = cleanText.split('').map((char, i) => {
      const kChar = cleanKey[i % cleanKey.length];
      return { p: char, k: kChar, binC: '', hexC: '', charC: '', isActive: false, isDone: false };
    });
    setProcessedChars(initialData);
    setSimStatus('idle');
    setLogs([]);
    setActiveLogId(null);
    setActiveStepData(null);
    setShowOriginalText(false);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setActiveLogId(null);
    setActiveStepData(null);
  };

  const processCharacter = (p: string, k: string, id: number): LogEntry => {
    const codeP = p.charCodeAt(0);
    const codeK = k.charCodeAt(0);
    const codeC = codeP ^ codeK; // Operasi Logika XOR Biner
    
    const binP = charToBin(p);
    const binK = charToBin(k);
    const binC = codeC.toString(2).padStart(8, '0');
    const hexC = binToHex(binC);
    const charC = safeChar(codeC);

    const mathDetail = `  ${binP} (${p})\n⊕ ${binK} (${k})\n  --------\n  ${binC} (Hex: ${hexC})`;

    return { id, p, k, c: charC, binP, binK, binC, hexC, mathDetail };
  };

  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newLogs: LogEntry[] = [];
    const finalChars = cleanText.split('').map((char, idx) => {
      const kChar = cleanKey[idx % cleanKey.length];
      const log = processCharacter(char, kChar, idx);
      newLogs.push(log);
      return { p: log.p, k: log.k, binC: log.binC, hexC: log.hexC, charC: log.c, isActive: false, isDone: true };
    });

    setProcessedChars(finalChars);
    setLogs(newLogs);
    setSimStatus('completed');
    setActiveLogId(null);
    setActiveStepData(null);
  };

  const handleProcess = () => {
    if (simStatus === 'running' || cleanText.trim().length === 0) return;
    setSimStatus('running');
    setLogs([]);
    setActiveLogId(null);
    setActiveStepData(null);
    setShowOriginalText(false);
    
    const initialData = cleanText.split('').map((char, i) => ({ 
      p: char, k: cleanKey[i % cleanKey.length], binC: '', hexC: '', charC: '', isActive: false, isDone: false 
    }));
    setProcessedChars(initialData);
    
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      setProcessedChars(prev => {
        const newChars = prev.map(item => ({ ...item, isActive: false }));
        if (currentIndex > 0 && currentIndex - 1 < newChars.length) {
          newChars[currentIndex - 1].isDone = true;
        }

        if (currentIndex < cleanText.length) {
          const char = cleanText[currentIndex];
          const kChar = cleanKey[currentIndex % cleanKey.length];
          const logData = processCharacter(char, kChar, currentIndex);
          
          setLogs(currLogs => [...currLogs, logData]);
          setActiveStepData(logData); 
          newChars[currentIndex] = { p: char, k: kChar, binC: logData.binC, hexC: logData.hexC, charC: logData.c, isActive: true, isDone: false };
        }
        return newChars;
      });

      currentIndex++;
      if (currentIndex > cleanText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimStatus('completed');
      }
    }, 700); 
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* 1. BAGIAN ATAS: PANEL KUNCI & VISUALISASI BINER */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-20 min-h-[280px]">
        
        {/* KIRI: Input Kunci & Diagnostik OTP */}
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
            {/* Keyword Input & OTP Generator */}
            <div className="flex flex-col w-full gap-2 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Key size={12} /> Key / Pad
                </span>
                {simStatus === 'idle' && (
                  <button onClick={generateOTP} className="text-[9px] flex items-center gap-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-2 py-1 rounded border border-amber-500/30 transition-colors font-bold uppercase">
                    <Zap size={10} /> Auto OTP
                  </button>
                )}
              </div>
              <div className={`w-full flex items-center rounded-xl border-2 transition-all duration-200 ${simStatus === 'idle' ? 'border-slate-600 bg-slate-900 hover:border-amber-400 focus-within:border-amber-500 shadow-inner' : 'border-transparent bg-slate-800/50 opacity-70'}`}>
                  <input 
                    type="text" value={keyword} disabled={simStatus !== 'idle'}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="KUNCI..."
                    className="w-full bg-transparent px-4 py-3 font-black text-xl text-amber-400 outline-none uppercase placeholder-slate-600"
                  />
              </div>
            </div>

            {/* Diagnostik OTP */}
            <div className="w-full flex flex-col gap-2.5 bg-slate-800/40 p-4 rounded-2xl border border-transparent shadow-sm">
               <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-widest flex items-center gap-1.5 mb-1">
                 <ShieldCheck size={12} /> Status Keamanan
               </span>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Panjang Teks:</span>
                  <span className="font-mono font-bold text-indigo-400">{cleanText.length}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Panjang Kunci:</span>
                  <span className="font-mono font-bold text-amber-400">{cleanKey.length}</span>
               </div>
               
               <div className="mt-1">
                 {isOTP ? (
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-500/10 justify-center">
                     <Check size={12} /> OTP Sempurna
                   </div>
                 ) : (
                   <div className="flex items-start gap-2 text-[10px] font-bold text-rose-400 bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-500/10 justify-center text-center leading-tight">
                     <AlertTriangle size={12} className="shrink-0 mt-0.5" /> 
                     <span>Vernam Biasa<br/><span className="text-[8px] font-normal opacity-80">(Kunci berulang / rentan dibobol)</span></span>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* KANAN: Visualisasi Logika Biner XOR Live */}
        <div className="flex-1 bg-[#0b1120] p-6 flex flex-col relative justify-center overflow-x-auto beautiful-scrollbar">
          
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky-left">
            <Binary size={14} className={mode === 'encrypt' ? 'text-indigo-400' : 'text-amber-400'}/> 
            Visualisasi Biner (XOR)
          </div>

          <div className="flex flex-row items-center justify-between w-full min-w-max gap-8 mt-6 px-2">
            
            {/* Area Kiri: Tumpukan Biner XOR (Center Stage) */}
            <div className={`flex flex-col justify-center gap-3 transition-all duration-300 ${activeStepData ? 'scale-100' : 'opacity-60 scale-95'}`}>
              
              {/* Baris Plaintext */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input</span>
                  <span className={`font-black text-2xl ${activeStepData ? 'text-indigo-300' : 'text-slate-600'}`}>{activeStepData ? activeStepData.p : '-'}</span>
                </div>
                <div className="flex gap-1.5">
                  {(activeStepData ? activeStepData.binP.split('') : '00000000'.split('')).map((bit, i) => (
                    <span key={`p-${i}`} className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded border font-mono font-black text-xl transition-colors ${activeStepData ? (bit === '1' ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700/50 text-slate-500') : 'bg-slate-800/50 border-transparent text-slate-700'}`}>
                      {bit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Baris Key */}
              <div className="flex items-center gap-4 relative">
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key</span>
                  <span className={`font-black text-2xl ${activeStepData ? 'text-amber-300' : 'text-slate-600'}`}>{activeStepData ? activeStepData.k : '-'}</span>
                </div>
                {/* Tanda XOR di sebelah kiri array biner */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Zap size={16} className={activeStepData ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : ''} />
                </div>
                <div className="flex gap-1.5">
                  {(activeStepData ? activeStepData.binK.split('') : '00000000'.split('')).map((bit, i) => (
                    <span key={`k-${i}`} className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded border font-mono font-black text-xl transition-colors ${activeStepData ? (bit === '1' ? 'bg-amber-900/40 border-amber-500/50 text-amber-300' : 'bg-slate-800 border-slate-700/50 text-slate-500') : 'bg-slate-800/50 border-transparent text-slate-700'}`}>
                      {bit}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-slate-700/50 my-1 relative">
                 <div className="absolute right-0 -top-2 bg-[#0b1120] pl-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">XOR (⊕)</div>
              </div>

              {/* Baris Output */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hex</span>
                  <span className={`font-black text-xl ${activeStepData ? 'text-emerald-400' : 'text-slate-600'}`}>{activeStepData ? activeStepData.hexC : '-'}</span>
                </div>
                <div className="flex gap-1.5">
                  {(activeStepData ? activeStepData.binC.split('') : '00000000'.split('')).map((bit, i) => {
                     // Efek highlight khusus untuk bit yang bernilai 1 sebagai hasil XOR
                     const isHigh = bit === '1';
                     return (
                      <span key={`c-${i}`} className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center rounded border font-mono font-black text-xl transition-all duration-300 ${activeStepData ? (isHigh ? 'bg-emerald-900/50 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-105 z-10' : 'bg-slate-900 border-slate-700 text-slate-600') : 'bg-slate-800/50 border-transparent text-slate-700'}`}>
                        {bit}
                      </span>
                    )
                  })}
                </div>
              </div>

            </div>
            
            {/* Area Kanan: Detail ASCII -> HEX (Merapat Kanan) */}
            <div className="shrink-0 flex items-center justify-end" style={{ width: '180px' }}>
              <AnimatePresence mode="wait">
                {activeStepData ? (
                  <motion.div 
                    key={activeStepData.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="w-full flex flex-col text-[11px] font-mono text-slate-300 bg-slate-800/40 rounded-xl p-4 border border-transparent shadow-sm"
                  >
                     <span className="text-[9px] text-slate-500 mb-2 font-bold uppercase tracking-widest border-b border-slate-700/40 pb-1.5">ASCII Kalkulasi</span>
                     <div className="flex justify-between items-center text-indigo-300 mb-1"><span>{activeStepData.p}</span><span>{activeStepData.p.charCodeAt(0)}</span></div>
                     <div className="flex justify-between items-center text-amber-300 mb-1 border-b border-slate-700/50 pb-1 relative">
                       <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">⊕</span>
                       <span>{activeStepData.k}</span><span>{activeStepData.k.charCodeAt(0)}</span>
                     </div>
                     <div className="flex justify-between items-center text-emerald-400 font-bold mt-1">
                    <span>Hex: {activeStepData.hexC}</span><span>{activeStepData.c.charCodeAt(0)}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-[80px] flex items-center justify-center text-[10px] text-slate-600 uppercase font-bold tracking-widest bg-slate-800/20 rounded-xl border border-slate-700/30 border-dashed text-center">
                    Menunggu Eksekusi
                  </div>
                )}
              </AnimatePresence>
            </div>

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
                  <span className="font-bold uppercase tracking-widest text-[11px]">Stream Teks vs Kunci</span>
                </div>
                
                <AnimatePresence>
                  {simStatus === 'completed' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setShowOriginalText(!showOriginalText)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${showOriginalText ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'}`}
                    >
                      {showOriginalText ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showOriginalText ? "Sembunyikan Pasangan Kunci" : "Tampilkan Kunci"}
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
                    className="w-full min-h-full bg-transparent text-slate-200 text-lg leading-relaxed outline-none resize-none font-medium placeholder-slate-600 uppercase"
                  />
                ) : (
                  <motion.div key="viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg leading-relaxed font-medium whitespace-pre-wrap break-words flex flex-wrap gap-1.5 pt-4">
                    {processedChars.map((item, idx) => (
                      <span key={idx} className="relative inline-flex flex-col items-center mt-3">
                        <AnimatePresence>
                          {showOriginalText && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 5, height: 0 }} transition={{ duration: 0.2 }}
                              className="absolute -top-7 flex flex-col items-center"
                            >
                              <span className="text-[10px] font-bold text-indigo-300/70 leading-none">{item.p}</span>
                              <span className="text-[10px] font-bold text-amber-400/70 leading-none mt-0.5">{item.k}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <span className={`transition-all duration-75 px-1.5 py-1 rounded border font-mono tracking-widest text-sm ${item.isActive ? 'text-emerald-400 bg-emerald-900/40 border-emerald-500/50 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : item.isDone ? 'text-emerald-300 bg-slate-800/40 border-slate-700/50' : 'text-slate-500 bg-slate-800/20 border-transparent'} ${showOriginalText ? 'mt-3' : ''}`}>
                          {item.isDone || item.isActive ? item.hexC : item.p}
                        </span>
                      </span>
                    ))}
                    {processedChars.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="shrink-0 pt-3 border-t border-slate-700/50 flex justify-end">
                {simStatus === 'idle' && (
                  <button onClick={handleProcess} disabled={cleanText.trim().length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi XOR <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
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
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Logika Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Byte: {logs.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Setiap huruf akan diubah ke Binary 8-bit lalu di-XOR dengan Kunci.</span>
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
                      setActiveStepData(log); 
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200 transition-all ${
                    (simStatus === 'completed' || simStatus === 'idle') ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  } ${
                    isSelected 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Tampilkan tumpukan biner di atas" : ""}
                >
                  <div className="flex flex-col items-center">
                    <span className={`font-bold text-sm tracking-widest transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>{log.p}</span>
                    <span className={`text-[9px] font-bold ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>{log.k}</span>
                  </div>
                  
                  <span className="text-slate-600 mx-3 text-xs">→</span>
                  
                  <span className="font-black text-emerald-400 text-lg tracking-widest text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{log.hexC}</span>
                  
                  <span className={`text-[10px] ml-auto border-l pl-3 py-1 flex items-center tracking-widest transition-colors ${isSelected ? 'text-emerald-200 border-emerald-500/40 font-bold' : 'text-slate-500 border-slate-700/40'}`}>
                    {log.binC}
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
        .sticky-left {
          position: sticky;
          left: 1.5rem; /* Menyesuaikan padding container */
        }
      `}</style>
    </div>
  );
}