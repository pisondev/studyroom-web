"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Lock, Unlock, AlignLeft, Play, RotateCcw, XSquare, ListTree, FastForward, Cpu, Eye, ArrowRight, EyeOff } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const VALID_A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

type PipelineData = { charIn: string, idxIn: number, mathA: number, mathB: number, idxOut: number, charOut: string };
type LogEntry = { id: number, p: string, c: string, math: string, pipelineData: PipelineData | null };

export default function AffineCanvas() {
  // --- STATE ---
  const [text, setText] = useState("Sirkuit Affine kini simetris sempurna. Ukuran seragam dan UI panel atas tertata sangat rapi!");
  const [isEditing, setIsEditing] = useState(false);
  const [aValue, setAValue] = useState(5); 
  const [bValue, setBValue] = useState(8); 
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // State Simulasi & Log
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [displayedChars, setDisplayedChars] = useState<{char: string, originalChar: string, isActive: boolean, isDone: boolean}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // State Pipeline, Replay & View Mode
  const [activePipelineData, setActivePipelineData] = useState<PipelineData | null>(null);
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false); 

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- MATEMATIKA AFFINE ---
  const modInverse = (a: number, m: number) => {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };

  const aOptions = VALID_A_VALUES.map(v => ({
    value: v.toString(),
    label: mode === 'encrypt' ? `× ${v}` : `× ${modInverse(v, 26)}`
  }));

  // --- LOGIKA AUTO-RESIZE & RESET ---
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  useEffect(() => {
    resetSimulation();
  }, [text, mode, aValue, bValue]);

  useEffect(() => {
    if (logEndRef.current && simStatus === 'running') {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, simStatus]);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedChars(text.split('').map(c => ({ char: c, originalChar: c, isActive: false, isDone: false })));
    setActivePipelineData(null);
    setActiveLogId(null);
    setSimStatus('idle');
    setLogs([]);
    setShowOriginalText(false); 
  };

  const cancelSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setActivePipelineData(null);
    setActiveLogId(null);
  };

  const processCharacter = (char: string, index: number) => {
    const upper = char.toUpperCase();
    const isLower = char !== upper;
    const idx = ALPHABET.indexOf(upper);
    
    if (idx === -1) return { resultChar: char, logData: null, pipelineData: null };

    let newIdx = 0, mathString = "", pipelineMathA = 0, pipelineMathB = 0;

    if (mode === "encrypt") {
      newIdx = (aValue * idx + bValue) % 26;
      mathString = `(${aValue} × ${idx} + ${bValue}) mod 26 = ${newIdx}`;
      pipelineMathA = aValue * idx;
      pipelineMathB = pipelineMathA + bValue;
    } else {
      const aInv = modInverse(aValue, 26);
      newIdx = (aInv * (idx - bValue)) % 26;
      if (newIdx < 0) newIdx += 26;
      mathString = `(${aInv} × (${idx} - ${bValue})) mod 26 = ${newIdx}`;
      pipelineMathA = idx - bValue;
      pipelineMathB = aInv * pipelineMathA;
    }

    const resultChar = isLower ? ALPHABET[newIdx].toLowerCase() : ALPHABET[newIdx];
    const pipelineData = { charIn: upper, idxIn: idx, mathA: pipelineMathA, mathB: pipelineMathB, idxOut: newIdx, charOut: resultChar.toUpperCase() };
    const logData: LogEntry = { id: index, p: upper, c: resultChar.toUpperCase(), math: mathString, pipelineData };

    return { resultChar, logData, pipelineData };
  };

  const skipSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalChars: typeof displayedChars = [];
    const newLogs: typeof logs = [];

    text.split('').forEach((char, i) => {
      const { resultChar, logData } = processCharacter(char, i);
      finalChars.push({ char: resultChar, originalChar: char, isActive: false, isDone: true });
      if (logData) newLogs.push(logData);
    });

    setDisplayedChars(finalChars);
    setLogs(newLogs);
    setActivePipelineData(null);
    setActiveLogId(null);
    setSimStatus('completed');
  };

  const handleProcess = () => {
    if (simStatus === 'running' || text.trim().length === 0) return;
    setSimStatus('running');
    setLogs([]);
    setActivePipelineData(null);
    setActiveLogId(null);
    setShowOriginalText(false);
    
    setDisplayedChars(text.split('').map(c => ({ char: c, originalChar: c, isActive: false, isDone: false })));
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayedChars(prev => {
        const newChars = prev.map(item => ({ ...item, isActive: false }));
        if (currentIndex > 0 && currentIndex - 1 < newChars.length) {
          newChars[currentIndex - 1].isDone = true;
        }

        if (currentIndex < text.length) {
          const char = text[currentIndex];
          const { resultChar, logData, pipelineData } = processCharacter(char, currentIndex);
          
          if (logData && pipelineData) {
            setLogs(currLogs => [...currLogs, logData]);
            setActivePipelineData(pipelineData);
          } else {
            setActivePipelineData(null);
          }
          
          newChars[currentIndex] = { char: resultChar, originalChar: char, isActive: true, isDone: false };
        }
        return newChars;
      });

      currentIndex++;

      if (currentIndex > text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActivePipelineData(null);
        setSimStatus('completed');
      }
    }, 150); 
  };

  // --- KOMPONEN NODE PIPELINE INTERAKTIF ---
  const NodeMultiplyA = ({ mathValue }: { mathValue: number }) => (
    <div className="flex flex-col items-center z-50 mt-4 xl:mt-0 relative group w-[120px]">
      <span className="text-[10px] text-slate-500 mb-1.5 font-mono uppercase font-bold tracking-widest whitespace-nowrap">
        {mode === 'encrypt' ? 'Multiply (A)' : 'Multiply (A⁻¹)'}
      </span>
      
      {simStatus === 'idle' ? (
        /* Perbaikan: CustomDropdown langsung menjadi kotak utamanya dengan tinggi h-[64px] pasti */
        <CustomDropdown
          options={aOptions}
          value={aValue.toString()}
          onChange={(val) => setAValue(Number(val))}
          disabled={false}
          className="w-full" 
          buttonClassName="w-full h-[64px] flex items-center justify-center bg-slate-900 border-2 border-slate-600 hover:border-amber-400 focus:border-amber-500 rounded-xl transition-all shadow-inner text-amber-400 font-black text-2xl outline-none focus:outline-none gap-2"
          iconSize={18}
        />
      ) : (
        <div className={`w-full h-[64px] flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${activePipelineData ? 'border-amber-500 bg-amber-900/30 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-slate-700 bg-slate-800'}`}>
          <span className={`text-2xl font-black ${activePipelineData ? 'text-amber-400' : 'text-slate-600'}`}>
            × {mode === 'encrypt' ? aValue : modInverse(aValue, 26)}
          </span>
        </div>
      )}
      
      <span className={`text-xs font-mono font-bold mt-1.5 h-4 ${activePipelineData ? 'text-white' : 'text-transparent'}`}>{activePipelineData ? mathValue : 0}</span>
    </div>
  );

  const NodeAddSubB = ({ mathValue }: { mathValue: number }) => (
    <div className="flex flex-col items-center z-30 mt-4 xl:mt-0 relative group w-[120px]">
      <span className="text-[10px] text-slate-500 mb-1.5 font-mono uppercase font-bold tracking-widest whitespace-nowrap">
        {mode === 'encrypt' ? 'Add (B)' : 'Subtract (B)'}
      </span>
      <div className={`w-full h-[64px] flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${activePipelineData ? 'border-rose-500 bg-rose-900/30 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : simStatus === 'idle' ? 'border-slate-600 bg-slate-900 hover:border-rose-400 focus-within:border-rose-500 shadow-inner' : 'border-slate-700 bg-slate-800'}`}>
          <span className={`text-2xl font-black mr-1 ${activePipelineData ? 'text-rose-400' : simStatus === 'idle' ? 'text-slate-400' : 'text-slate-600'}`}>
            {mode === 'encrypt' ? '+' : '-'}
          </span>
          {simStatus === 'idle' ? (
            // Perbaikan: Menghilangkan border putus-putus di bawah input B
            <input 
              type="number" min="0" max="25" value={bValue}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                setBValue(((val % 26) + 26) % 26);
              }}
              className={`w-12 bg-transparent font-black text-2xl text-emerald-400 outline-none text-center hide-arrows transition-colors`}
            />
          ) : (
            <span className={`text-2xl font-black ${activePipelineData ? 'text-white' : 'text-slate-600'}`}>{bValue}</span>
          )}
      </div>
      <span className={`text-xs font-mono font-bold mt-1.5 h-4 ${activePipelineData ? 'text-white' : 'text-transparent'}`}>{activePipelineData ? mathValue : 0}</span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-200">
      
      {/* 1. BAGIAN ATAS: PIPELINE SIRKUIT INTERAKTIF */}
      <div className="w-full shrink-0 flex flex-col bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-visible z-20">
        
        {/* Header: Toggle Mungil & Formula Responsif */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-800 bg-slate-900 rounded-t-3xl shrink-0 gap-4 z-40">
          
          {/* Perbaikan: Border dari switch encrypt/decrypt dibuat redup tanpa list putih mencolok */}
          <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700/50 w-48 relative shrink-0 shadow-inner">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-lg z-0 shadow-sm"
              animate={{ left: mode === 'encrypt' ? '6px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button onClick={() => setMode('encrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'encrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Lock size={14} /> Encrypt
            </button>
            <button onClick={() => setMode('decrypt')} disabled={simStatus === 'running'} className={`relative z-10 w-1/2 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${mode === 'decrypt' ? 'text-white' : 'text-slate-400 hover:text-slate-300'} disabled:opacity-50`}>
              <Unlock size={14} /> Decrypt
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest z-20 shrink-0">
            <Cpu size={14} className="text-indigo-400 hidden sm:block"/> 
            <span className="text-indigo-300 bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-500/30 whitespace-nowrap shadow-inner">
              {mode === 'encrypt' ? 'f(x) = (A·x + B) mod 26' : `f(x) = A⁻¹·(x - B) mod 26`}
            </span>
          </div>
        </div>

        {/* VISUALISASI PIPELINE SIRKUIT MATEMATIKA (Seragam, Lebar, Rapi) */}
        <div className="relative w-full bg-[#0b1120] p-6 pb-8 flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8 rounded-b-3xl min-h-[220px] z-10 overflow-visible">

          {/* Node 1: Input */}
          <div className="flex flex-col items-center z-10 w-[120px] mt-4 xl:mt-0">
            <span className="text-[10px] text-slate-500 mb-1.5 font-mono uppercase font-bold tracking-widest whitespace-nowrap">Input</span>
            <div className={`w-full h-[64px] flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${activePipelineData ? 'border-indigo-400 bg-indigo-900/40 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-slate-700 bg-slate-800'}`}>
              <span className={`text-2xl font-black ${activePipelineData ? 'text-white' : 'text-slate-600'}`}>{activePipelineData ? activePipelineData.charIn : '?'}</span>
            </div>
            <span className={`text-[10px] font-mono mt-1.5 h-4 ${activePipelineData ? 'text-indigo-300' : 'text-transparent'}`}>id: {activePipelineData ? activePipelineData.idxIn : 0}</span>
          </div>

          <ArrowRight size={24} className={`hidden xl:block transition-colors duration-200 ${activePipelineData ? 'text-indigo-500 drop-shadow-[0_0_8px_#6366f1]' : 'text-slate-800'}`} />

          {/* PENGKONDISIAN ALUR NODE BERDASARKAN MODE */}
          {mode === 'encrypt' ? (
            <>
              <NodeMultiplyA mathValue={activePipelineData?.mathA || 0} />
              <ArrowRight size={24} className={`hidden xl:block transition-colors duration-200 ${activePipelineData ? 'text-amber-500 drop-shadow-[0_0_8px_#f59e0b]' : 'text-slate-800'}`} />
              <NodeAddSubB mathValue={activePipelineData?.mathB || 0} />
            </>
          ) : (
            <>
              <NodeAddSubB mathValue={activePipelineData?.mathA || 0} />
              <ArrowRight size={24} className={`hidden xl:block transition-colors duration-200 ${activePipelineData ? 'text-rose-500 drop-shadow-[0_0_8px_#f43f5e]' : 'text-slate-800'}`} />
              <NodeMultiplyA mathValue={activePipelineData?.mathB || 0} />
            </>
          )}

          <ArrowRight size={24} className={`hidden xl:block transition-colors duration-200 ${activePipelineData ? (mode === 'encrypt' ? 'text-rose-500 drop-shadow-[0_0_8px_#f43f5e]' : 'text-amber-500 drop-shadow-[0_0_8px_#f59e0b]') : 'text-slate-800'}`} />

          {/* Node 4: Output */}
          <div className="flex flex-col items-center z-10 w-[120px] mt-4 xl:mt-0">
            <span className="text-[10px] text-slate-500 mb-1.5 font-mono uppercase font-bold tracking-widest whitespace-nowrap">Mod 26</span>
            <div className={`w-full h-[64px] flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${activePipelineData ? 'border-emerald-400 bg-emerald-900/40 shadow-[0_0_25px_rgba(52,211,153,0.6)]' : 'border-slate-700 bg-slate-800'}`}>
              <span className={`text-2xl font-black ${activePipelineData ? 'text-white' : 'text-slate-600'}`}>{activePipelineData ? activePipelineData.charOut : '?'}</span>
            </div>
            <span className={`text-[10px] font-mono mt-1.5 h-4 ${activePipelineData ? 'text-emerald-300' : 'text-transparent'}`}>id: {activePipelineData ? activePipelineData.idxOut : 0}</span>
          </div>

        </div>
      </div>

      {/* 2. BAGIAN BAWAH: SPLIT LAYOUT FIXED HEIGHT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[400px] min-h-[400px] max-h-[400px] z-10">
        
        {/* KIRI: AREA TEKS */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl opacity-50 pointer-events-none" />
          
          <div className="relative flex-1 flex flex-col z-10 h-full">
            {/* Perbaikan: Container untuk border bottom diberi margin bawah mb-2 agar tidak menyatu dengan teks bawahnya */}
            <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlignLeft size={18} className="text-emerald-400" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Dokumen Input</span>
                </div>
                
                <AnimatePresence>
                  {simStatus === 'completed' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
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
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-lg leading-relaxed font-medium whitespace-pre-wrap break-words flex flex-wrap gap-[1px]"
                  >
                    {displayedChars.map((item, idx) => (
                      <span key={idx} className="relative inline-flex flex-col items-center">
                        {/* Perbaikan: Ukuran font disamakan menjadi text-lg tapi dengan opacity yang lebih redup agar tidak tabrakan */}
                        <AnimatePresence>
                          {showOriginalText && (
                            <motion.span 
                              initial={{ opacity: 0, y: 5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: 5, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-lg text-slate-500/70 absolute -top-5 whitespace-nowrap"
                            >
                              {item.originalChar}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        
                        <span 
                          className={`transition-all duration-75 px-[1px] rounded-sm ${item.isActive ? 'text-slate-900 bg-emerald-400 scale-110 drop-shadow-[0_0_12px_#34d399] font-bold z-10 relative' : item.isDone ? 'text-emerald-300' : 'text-slate-200'} ${showOriginalText ? 'mt-4' : ''}`}
                        >
                          {item.char}
                        </span>
                      </span>
                    ))}
                    {displayedChars.length === 0 && <span className="text-slate-600 italic">Dokumen kosong...</span>}
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

        {/* KANAN: AREA LOG FIXED HEIGHT BORDER PUDAR */}
        {/* Perbaikan: Border dari container utamanya dihilangkan (bisa pakai border-transparent jika memang perlu kelas border) */}
        <div className="w-full lg:w-2/5 shrink-0 bg-slate-900/90 shadow-2xl flex flex-col rounded-3xl overflow-hidden h-full relative z-0 border border-transparent">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/80 shrink-0 bg-slate-800/20">
            <div className="flex items-center gap-2">
              <ListTree size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Pipeline Logs</span>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-500/20">
              Terekam: {logs.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#090c15] beautiful-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status: Idle</span>
                <span className="text-[11px] text-slate-500 px-4">Atur kunci A & B pada kotak sirkuit di atas, lalu jalankan mesin untuk melihat riwayat perhitungan di sini.</span>
              </div>
            )}
            
            {logs.map((log, i) => {
              const isSelected = activeLogId === log.id;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (simStatus === 'completed' || simStatus === 'idle') {
                      setActivePipelineData(log.pipelineData);
                      setActiveLogId(log.id);
                    }
                  }}
                  // Perbaikan: Menghilangkan border putih di tiap row log. Menggunakan warna dasar redup tanpa border yang mencolok
                  className={`px-3 py-2.5 rounded-lg text-sm font-mono flex items-center animate-in slide-in-from-right-2 fade-in duration-200 transition-all ${
                    (simStatus === 'completed' || simStatus === 'idle') ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  } ${
                    isSelected 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                  title={simStatus === 'completed' || simStatus === 'idle' ? "Tekan untuk melihat di Pipeline" : ""}
                >
                  <span className={`font-bold text-base w-5 text-center transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>{log.p}</span>
                  <span className="text-slate-600 mx-2 text-xs">→</span>
                  <span className="font-black text-emerald-400 text-lg w-5 text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{log.c}</span>
                  <span className={`text-[10px] ml-auto border-l pl-3 flex items-center tracking-tight transition-colors ${isSelected ? 'text-indigo-200 border-indigo-500/40 font-bold' : 'text-slate-400 border-slate-700/40'}`}>
                    {log.math}
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
        /* Memperbaiki container custom-dropdown agar flex memenuhi box pembungkusnya */
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