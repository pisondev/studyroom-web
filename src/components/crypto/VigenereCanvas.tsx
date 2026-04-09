"use client";
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, TerminalSquare, RotateCcw, Lock, Unlock, Play, KeyRound } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

type LogEntry = { type: 'init' | 'step' | 'result'; title: string; desc: string };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function VigenereCanvas() {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // States
  const [text, setText] = useState("KEAMANAN");
  const [keyword, setKeyword] = useState("UGM");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [stepIndex, setStepIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, "") || "A";

  const modeOptions = [
    { value: "encrypt", label: "🔒 Enkripsi (Plain -> Cipher)" },
    { value: "decrypt", label: "🔓 Dekripsi (Cipher -> Plain)" }
  ];

  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  const resetState = () => {
    setStepIndex(-1);
    setLogs([]);
  };

  const handleNextStep = () => {
    if (cleanText.length === 0) return;

    if (stepIndex === -1) {
      setLogs([{ 
        type: 'init', 
        title: `Persiapan ${mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}`, 
        desc: `Teks Asli: ${cleanText}\nKata Kunci: ${cleanKey}\nRumus: C_i = (p_i ${mode === 'encrypt' ? '+' : '-'} k_i) mod 26` 
      }]);
      setStepIndex(0);
    } else if (stepIndex < cleanText.length) {
      const pChar = cleanText[stepIndex];
      const kChar = cleanKey[stepIndex % cleanKey.length];
      
      const p = ALPHABET.indexOf(pChar);
      const k = ALPHABET.indexOf(kChar);
      
      let c;
      if (mode === "encrypt") {
        c = (p + k) % 26;
      } else {
        c = (p - k + 26) % 26;
      }
      const resultChar = ALPHABET[c];

      setLogs(prev => [...prev, { 
        type: 'step', 
        title: `Indeks ke-${stepIndex}: '${pChar}' & Kunci '${kChar}'`, 
        desc: `p = ${p} ('${pChar}')\nk = ${k} ('${kChar}')\nKalkulasi: (${p} ${mode === 'encrypt' ? '+' : '-'} ${k}) mod 26 = ${c}\nHasil substitusi: '${resultChar}'` 
      }]);
      setStepIndex(prev => prev + 1);
    } else if (stepIndex === cleanText.length) {
      const finalResult = cleanText.split("").map((char, i) => {
        const kChar = cleanKey[i % cleanKey.length];
        const p = ALPHABET.indexOf(char);
        const k = ALPHABET.indexOf(kChar);
        let c = mode === "encrypt" ? (p + k) % 26 : (p - k + 26) % 26;
        return ALPHABET[c];
      }).join("");

      setLogs(prev => [...prev, { type: 'result', title: "Selesai", desc: `Hasil Akhir: ${finalResult}` }]);
      setStepIndex(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      {/* KIRI: Visualisasi Pita (Tape) Horizontal */}
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
            <KeyRound size={18} className="text-amber-400"/> Distribusi Kunci (Key Stream)
          </h3>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-x-auto border border-slate-700 shadow-inner p-6 flex items-center justify-start custom-scrollbar">
          <div className="flex gap-4 items-center min-w-max mx-auto px-4 pb-4">
            {/* Label Baris */}
            <div className="flex flex-col gap-6 mr-2 font-bold text-xs text-slate-500 uppercase tracking-widest text-right">
              <div className="h-14 flex items-center justify-end">Teks</div>
              <div className="h-14 flex items-center justify-end">Kunci</div>
              <div className="h-14 flex items-center justify-end">Hasil</div>
            </div>

            {cleanText.split("").map((char, idx) => {
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              const kChar = cleanKey[idx % cleanKey.length];
              
              const p = ALPHABET.indexOf(char);
              const k = ALPHABET.indexOf(kChar);
              let c = mode === "encrypt" ? (p + k) % 26 : (p - k + 26) % 26;
              const resultChar = ALPHABET[c];

              return (
                <div key={idx} className={`flex flex-col gap-6 items-center p-3 rounded-xl border transition-all duration-300 ${isActive ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-105' : isDone ? 'bg-slate-800/50 border-emerald-500/30' : 'bg-transparent border-transparent opacity-50'}`}>
                  
                  {/* Kotak Teks Asli */}
                  <div className="w-14 h-14 flex flex-col items-center justify-center bg-slate-800 border border-slate-600 rounded-lg shadow-lg relative">
                    <span className="text-xl font-bold text-white">{char}</span>
                    <span className="text-[9px] text-slate-400 font-mono absolute bottom-1">{p}</span>
                  </div>

                  {/* Kotak Kunci */}
                  <div className="w-14 h-14 flex flex-col items-center justify-center bg-amber-900/20 border border-amber-600/50 rounded-lg relative">
                    <span className="absolute -top-3 text-[10px] font-bold text-amber-400 bg-[#0f172a] px-1.5 rounded-full border border-amber-500/30">
                       {mode === 'encrypt' ? '+' : '-'}
                    </span>
                    <span className="text-xl font-bold text-amber-400">{kChar}</span>
                    <span className="text-[9px] text-amber-500/70 font-mono absolute bottom-1">{k}</span>
                  </div>

                  {/* Kotak Hasil */}
                  <div className={`w-14 h-14 flex flex-col items-center justify-center border rounded-lg shadow-lg relative transition-all ${isDone ? 'bg-emerald-900/50 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>
                    <span className={`text-xl font-bold ${isDone ? 'text-emerald-400' : 'text-transparent'}`}>{isDone ? resultChar : '?'}</span>
                    {isDone && <span className="text-[9px] text-emerald-500/70 font-mono absolute bottom-1">={c}</span>}
                  </div>
                </div>
              );
            })}
            {cleanText.length === 0 && <div className="text-slate-500 italic">Data teks kosong.</div>}
          </div>
        </div>
      </div>

      {/* KANAN: Terminal / Panel Data */}
      <div className="lg:w-2/5 h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden relative">
        <div className="bg-slate-800/80 p-2 flex items-center border-b border-slate-700 shrink-0">
          <div className="flex gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400 text-xs ml-3 flex items-center gap-2"><TerminalSquare size={14}/> kalkulasi_vigenere.sh</span>
          </div>
        </div>

        <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4 z-10">
          <div className="flex flex-col gap-3">
             <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Teks Input</label>
                  <input type="text" value={text} onChange={(e) => {setText(e.target.value); resetState();}} disabled={stepIndex !== -1} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 uppercase disabled:opacity-50 font-sans font-bold" placeholder="Teks..."/>
                </div>
                <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Kata Kunci</label>
                  <input type="text" value={keyword} onChange={(e) => {setKeyword(e.target.value); resetState();}} disabled={stepIndex !== -1} className="w-full bg-slate-800 border border-amber-600/30 rounded-lg px-3 py-2 text-amber-400 outline-none focus:border-amber-500 uppercase disabled:opacity-50 font-sans font-bold" placeholder="Kunci..."/>
                </div>
             </div>
             <div>
               <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Mode Operasi</label>
               <CustomDropdown options={modeOptions} value={mode} onChange={(val) => {setMode(val as "encrypt" | "decrypt"); resetState();}} disabled={stepIndex !== -1}/>
             </div>
          </div>

          <div className="flex gap-2 shrink-0 mt-2">
            <button onClick={() => {setText(""); setKeyword(""); resetState();}} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-colors" title="Reset"><RotateCcw size={18} /></button>
            <button onClick={handleNextStep} disabled={stepIndex > cleanText.length || cleanText.length === 0 || cleanKey.length === 0} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-400/50">
              {stepIndex === -1 ? 'MULAI SIMULASI' : stepIndex > cleanText.length ? 'SELESAI' : 'KARAKTER BERIKUTNYA'} <Play size={16} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col gap-3 pb-4">
            {logs.length === 0 && <span className="text-slate-600 text-xs text-center py-4 border border-dashed border-slate-700 rounded-lg">Menunggu eksekusi data...</span>}
            {logs.map((log, index) => (
              <div key={index} className="flex flex-col gap-1 text-xs animate-in fade-in duration-300">
                <div className="w-full bg-slate-800/80 rounded-lg border border-slate-700/50 px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {log.type === 'init' ? <Lock size={14} className="text-amber-400"/> : log.type === 'result' ? <Lock size={14} className="text-emerald-400"/> : <ArrowRight size={14} className="text-indigo-400"/>}
                    <span className="font-bold text-[11px] md:text-xs uppercase tracking-widest text-white">{log.title}</span>
                  </div>
                  <div className="text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800/80 whitespace-pre-wrap">{log.desc}</div>
                </div>
              </div>
            ))}
            <div ref={logContainerRef} />
          </div>
        </div>
      </div>
    </div>
  );
}