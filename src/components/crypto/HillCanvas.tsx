"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Eye, EyeOff, LayoutGrid, Calculator, AlertTriangle } from 'lucide-react';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

// Helper Matematika Modular
const mod26 = (n: number) => ((n % 26) + 26) % 26;
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const modInverse = (a: number, m: number) => {
  a = mod26(a);
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return -1; 
};

type LogEntry = { 
  id: number, p1: string, p2: string, c1: string, c2: string, 
  mathStr: string, mathDetail: string,
  vecIn: [number, number], vecOut: [number, number], matrixUsed: [number, number, number, number]
};

export default function HillCanvas() {
  // --- STATE ---
  const [text, setText] = useState("ALJABAR LINEAR SANGAT INDAH");
  const [matrixKey, setMatrixKey] = useState<[number, number, number, number]>([3, 3, 2, 5]); 
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [processedPairs, setProcessedPairs] = useState<{p1: string, p2: string, c1: string, c2: string, isActive: boolean, isDone: boolean}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // State Interaktif UI
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [activeStepData, setActiveStepData] = useState<LogEntry | null>(null);
  const [matrixPulse, setMatrixPulse] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA MATRIKS HILL ---
  const det = mod26(matrixKey[0] * matrixKey[3] - matrixKey[1] * matrixKey[2]);
  const isCoprime = gcd(det, 26) === 1;
  const invDet = modInverse(det, 26);
  const isValidKey = det !== 0 && isCoprime;

  const invMatrix: [number, number, number, number] = isValidKey ? [
    mod26(invDet * matrixKey[3]), mod26(invDet * -matrixKey[1]),
    mod26(invDet * -matrixKey[2]), mod26(invDet * matrixKey[0])
  ] : [0, 0, 0, 0];

  const activeMatrix = mode === 'encrypt' ? matrixKey : invMatrix;

  // --- PREPARASI TEKS ---
  const formatTextToPairs = (inputText: string) => {
    let cleanText = inputText.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanText.length % 2 !== 0) cleanText += 'X'; 
    
    let pairs: {p1: string, p2: string}[] = [];
    for (let i = 0; i < cleanText.length; i += 2) {
      pairs.push({ p1: cleanText[i], p2: cleanText[i+1] });
    }
    return pairs;
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text, mode, matrixKey]);

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
    setActiveStepData(null);
    setShowOriginalText(false);
    setMatrixPulse(false);
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setActiveLogId(null);
    setActiveStepData(null);
    setMatrixPulse(false);
  };

  const processPair = (p1: string, p2: string, id: number): LogEntry => {
    const v1 = ALPHABET.indexOf(p1);
    const v2 = ALPHABET.indexOf(p2);
    
    const out1 = mod26(v1 * activeMatrix[0] + v2 * activeMatrix[2]);
    const out2 = mod26(v1 * activeMatrix[1] + v2 * activeMatrix[3]);
    
    const c1 = ALPHABET[out1];
    const c2 = ALPHABET[out2];

    const mathStr = `[${v1}, ${v2}] × K${mode==='decrypt'?'⁻¹':''} = [${out1}, ${out2}]`;
    const mathDetail = `c₁=(${v1}×${activeMatrix[0]} + ${v2}×${activeMatrix[2]}) mod 26 = ${out1}\nc₂=(${v1}×${activeMatrix[1]} + ${v2}×${activeMatrix[3]}) mod 26 = ${out2}`;

    return { id, p1, p2, c1, c2, mathStr, mathDetail, vecIn: [v1, v2], vecOut: [out1, out2], matrixUsed: activeMatrix };
  };

  const skipSimulation = () => {
    if (!isValidKey) return;
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
    setActiveStepData(null);
    setMatrixPulse(false);
  };

  const handleProcess = () => {
    if (!isValidKey || simStatus === 'running' || text.trim().length === 0) return;
    setSimStatus('running');
    setLogs([]);
    setActiveLogId(null);
    setActiveStepData(null);
    setShowOriginalText(false);
    
    const initialPairs = formatTextToPairs(text);
    setProcessedPairs(initialPairs.map(p => ({ ...p, c1: p.p1, c2: p.p2, isActive: false, isDone: false })));
    
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      setMatrixPulse(true);
      setTimeout(() => setMatrixPulse(false), 200);

      setProcessedPairs(prev => {
        const newPairs = prev.map(item => ({ ...item, isActive: false }));
        if (currentIndex > 0 && currentIndex - 1 < newPairs.length) {
          newPairs[currentIndex - 1].isDone = true;
        }

        if (currentIndex < initialPairs.length) {
          const currentPair = initialPairs[currentIndex];
          const logData = processPair(currentPair.p1, currentPair.p2, currentIndex);
          
          setLogs(currLogs => [...currLogs, logData]);
          setActiveStepData(logData); 
          newPairs[currentIndex] = { p1: currentPair.p1, p2: currentPair.p2, c1: logData.c1, c2: logData.c2, isActive: true, isDone: false };
        }
        return newPairs;
      });

      currentIndex++;
      if (currentIndex > initialPairs.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimStatus('completed');
        setMatrixPulse(false);
      }
    }, 800); 
  };

  const handleMatrixInput = (index: number, valStr: string) => {
    if (simStatus !== 'idle') return;
    let val = parseInt(valStr);
    if (isNaN(val)) val = 0;
    val = mod26(val);
    const newMatrix = [...matrixKey] as [number, number, number, number];
    newMatrix[index] = val;
    setMatrixKey(newMatrix);
  };

  const MatrixBracket = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative flex items-center justify-center py-4 px-3 md:px-5 ${className}`}>
      <div className="absolute left-0 top-0 bottom-0 w-3 border-t-4 border-b-4 border-l-4 border-slate-500 rounded-l-md opacity-50" />
      {children}
      <div className="absolute right-0 top-0 bottom-0 w-3 border-t-4 border-b-4 border-r-4 border-slate-500 rounded-r-md opacity-50" />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200 overflow-y-auto beautiful-scrollbar pr-2 pb-10">
      
      {/* 1. BAGIAN ATAS: PANEL MATRIKS KUNCI & VISUALISASI */}
      {/* PERBAIKAN: Menggunakan Inline Style untuk Layout Utama agar kebal dari Tailwind Bug */}
      <div className="w-full shrink-0 flex flex-col lg:flex-row bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden z-20 min-h-[280px]">
        
        {/* KIRI: Input Kunci (K) & Diagnostik */}
        <div 
          className="border-b lg:border-b-0 lg:border-r border-slate-700/50 p-6 flex flex-col justify-start gap-6 bg-slate-800/20 shrink-0" 
          style={{ width: '100%', maxWidth: '340px' }} // DIPAKSA LEBAR MAX 340px (Anti-Melar)
        >
          {/* Switch Encrypt/Decrypt (Netral, tanpa border putih) */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl relative shadow-inner w-full shrink-0 border border-transparent">
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

          {/* Kotak Input Matriks & Diagnostik (Disusun Vertikal agar rapi di ruang sempit) */}
          <div className="flex flex-col items-center gap-5 w-full">
            
            <div className="flex flex-col items-center w-full">
              <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Matriks K</span>
              <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 w-full shadow-inner border border-transparent">
                <div className="grid grid-cols-2 gap-2 z-10">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={`k-in-${idx}`} type="number" value={matrixKey[idx]} disabled={simStatus !== 'idle'}
                      onChange={(e) => handleMatrixInput(idx, e.target.value)}
                      className={`w-12 h-12 bg-slate-800 text-center font-black text-xl outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all hide-arrows border border-transparent ${!isValidKey ? 'text-rose-400 bg-rose-900/20' : 'text-indigo-300 hover:bg-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostik Netral Tanpa Border Aneh */}
            <div className="w-full flex flex-col gap-2.5 bg-slate-800/40 p-4 rounded-2xl border border-transparent shadow-sm">
               <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-widest flex items-center gap-1.5 mb-1">
                 <Calculator size={12} /> Diagnostik
               </span>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Determinan (det):</span>
                  <span className="font-mono font-bold text-indigo-400">{det}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">gcd(det, 26):</span>
                  <span className={`font-mono font-bold ${isCoprime ? 'text-emerald-400' : 'text-rose-400'}`}>{gcd(det, 26)}</span>
               </div>
               
               {/* Status Badge Netral */}
               <div className="mt-1">
                 {isValidKey ? (
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-500/10 justify-center">
                     <Check size={12} /> Kunci Valid
                   </div>
                 ) : (
                   <div className="flex items-start gap-2 text-[10px] font-bold text-rose-400 bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-500/10 justify-center">
                     <AlertTriangle size={12} className="shrink-0 mt-0.5" /> Invalid (Harus Prima)
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>

        {/* KANAN: Visualisasi Aljabar Live */}
        {/* PERBAIKAN: Flex-1 dengan overflow horizontal yang dipaksa nowrap */}
        <div className="flex-1 bg-[#0b1120] p-6 flex flex-col relative justify-center overflow-x-auto beautiful-scrollbar">
          
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky-left">
            <LayoutGrid size={14} className={mode === 'encrypt' ? 'text-indigo-400' : 'text-amber-400'}/> 
            Visualisasi Perkalian Matriks
          </div>

          {/* Kontainer Baris Panjang (Anti-Bungkus/Anti-Wrap) */}
          <div className="flex flex-row items-center justify-between w-full min-w-max gap-8 mt-6 px-2">
            
            {/* Area Kiri: Rumus Matriks Utama (Raksasa dan Lega) */}
            <div className={`flex flex-row items-center justify-center gap-4 md:gap-8 transition-all duration-300 ${activeStepData ? 'scale-100' : 'opacity-60 scale-95'}`}>
              
              {/* 1. Vektor Input */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Vektor</span>
                <MatrixBracket className={activeStepData ? 'bg-indigo-900/20' : ''}>
                  <div className="flex gap-6 px-2">
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-4xl ${activeStepData ? 'text-white' : 'text-slate-600'}`}>{activeStepData ? activeStepData.vecIn[0] : 'v₁'}</span>
                      <span className={`text-xs font-bold mt-1.5 ${activeStepData ? 'text-indigo-300' : 'text-transparent'}`}>{activeStepData?.p1}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-4xl ${activeStepData ? 'text-white' : 'text-slate-600'}`}>{activeStepData ? activeStepData.vecIn[1] : 'v₂'}</span>
                      <span className={`text-xs font-bold mt-1.5 ${activeStepData ? 'text-indigo-300' : 'text-transparent'}`}>{activeStepData?.p2}</span>
                    </div>
                  </div>
                </MatrixBracket>
              </div>

              <span className={`font-black text-3xl shrink-0 ${activeStepData ? 'text-indigo-400' : 'text-slate-700'}`}>×</span>

              {/* 2. Matriks Aktif K */}
              <div className="flex flex-col items-center shrink-0">
                <span className={`text-[10px] font-bold mb-2 uppercase tracking-widest ${mode === 'encrypt' ? 'text-indigo-400' : 'text-amber-400'}`}>Matriks K{mode === 'decrypt' && '⁻¹'}</span>
                <MatrixBracket className={activeStepData ? (mode === 'encrypt' ? 'bg-indigo-900/20' : 'bg-amber-900/20') : ''}>
                  {/* Grid ini dipaksa ada jarak (gap-x-10) supaya angka K tidak menyatu */}
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 px-3">
                    {[0, 1, 2, 3].map(idx => (
                      <span key={idx} className={`font-black text-4xl text-center min-w-[32px] ${isValidKey ? (mode === 'encrypt' ? 'text-indigo-300' : 'text-amber-300') : 'text-slate-600'}`}>
                        {isValidKey ? activeMatrix[idx] : '-'}
                      </span>
                    ))}
                  </div>
                </MatrixBracket>
              </div>

              <span className={`font-black text-3xl shrink-0 ${activeStepData ? 'text-emerald-400' : 'text-slate-700'}`}>=</span>

              {/* 3. Vektor Output */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Output</span>
                <MatrixBracket className={activeStepData ? 'bg-emerald-900/20 shadow-[0_0_20px_rgba(52,211,153,0.15)]' : ''}>
                  <div className="flex gap-6 px-2">
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-4xl ${activeStepData ? 'text-emerald-400' : 'text-slate-600'}`}>{activeStepData ? activeStepData.vecOut[0] : 'c₁'}</span>
                      <span className={`text-xs font-bold mt-1.5 ${activeStepData ? 'text-emerald-300' : 'text-transparent'}`}>{activeStepData?.c1}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-4xl ${activeStepData ? 'text-emerald-400' : 'text-slate-600'}`}>{activeStepData ? activeStepData.vecOut[1] : 'c₂'}</span>
                      <span className={`text-xs font-bold mt-1.5 ${activeStepData ? 'text-emerald-300' : 'text-transparent'}`}>{activeStepData?.c2}</span>
                    </div>
                  </div>
                </MatrixBracket>
              </div>

            </div>
            
            {/* Area Kanan: Detail Kalkulasi (Dibuat lebar tetap dan merapat ke kanan) */}
            <div className="shrink-0 flex items-center justify-end" style={{ width: '220px' }}>
              <AnimatePresence mode="wait">
                {activeStepData ? (
                  <motion.div 
                    key={activeStepData.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="w-full flex flex-col text-[11px] font-mono text-slate-300 bg-slate-800/40 rounded-xl p-4 border border-transparent shadow-sm"
                  >
                     <span className="text-[9px] text-slate-500 mb-2 font-bold uppercase tracking-widest border-b border-slate-700/40 pb-1.5">Kalkulasi Rinci</span>
                     <span className="whitespace-pre-wrap leading-relaxed text-indigo-200">{activeStepData.mathDetail}</span>
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
                  <span className="font-bold uppercase tracking-widest text-[11px]">Vektor Teks (Bigram)</span>
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
                        
                        <span className={`transition-all duration-75 px-1 py-0.5 rounded-md tracking-widest ${pair.isActive ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : pair.isDone ? 'text-emerald-300 bg-emerald-900/20 border border-emerald-500/20' : 'text-slate-200 bg-slate-800/50'} ${showOriginalText ? 'mt-2' : ''}`}>
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
                  <button onClick={handleProcess} disabled={text.trim().length === 0 || !isValidKey} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group">
                    Eksekusi Matriks <Play size={16} fill="currentColor" className="group-hover:translate-x-1" />
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
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Aljabar Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Vektor: {logs.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Teks akan dipecah menjadi vektor baris berukuran 1x2, lalu dikalikan dengan Matriks.</span>
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
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Tampilkan rumus visual di atas" : ""}
                >
                  <span className={`font-bold text-base tracking-widest text-center transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>{log.p1}{log.p2}</span>
                  <span className="text-slate-600 mx-2 text-xs">→</span>
                  <span className="font-black text-emerald-400 text-lg tracking-widest text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{log.c1}{log.c2}</span>
                  <span className={`text-[10px] ml-auto border-l pl-3 flex items-center tracking-tight transition-colors ${isSelected ? 'text-indigo-200 border-indigo-500/40 font-bold' : 'text-slate-400 border-slate-700/40'}`}>
                    {log.mathStr}
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