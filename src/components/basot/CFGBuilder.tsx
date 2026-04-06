'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepForward, RotateCcw, CheckCircle, GitCommit } from 'lucide-react';

const derivationSteps = [
  { step: 0, rule: "Start", str: ["S"], activeIdx: 0, desc: "Mulai dari Start Variable (S)." },
  { step: 1, rule: "S → SS", str: ["S", "S"], activeIdx: 0, desc: "Pecah S menjadi SS untuk membuat dua blok terpisah." },
  { step: 2, rule: "S → {S}", str: ["{", "S", "}", "S"], activeIdx: 1, desc: "Fokus ke S paling kiri (Leftmost). Ubah menjadi {S}." },
  { step: 3, rule: "S → λ", str: ["{", "}", "S"], activeIdx: 2, desc: "Hilangkan S di dalam kurung dengan λ. Blok kiri selesai: {}." },
  { step: 4, rule: "S → {S}", str: ["{", "}", "{", "S", "}"], activeIdx: 3, desc: "Pindah ke S berikutnya. Ubah menjadi {S}." },
  { step: 5, rule: "S → {S}", str: ["{", "}", "{", "{", "S", "}", "}"], activeIdx: 4, desc: "Karena kurung bersarang (nested), ubah S di dalam menjadi {S} lagi." },
  { step: 6, rule: "S → λ", str: ["{", "}", "{", "{", "}", "}"], activeIdx: -1, desc: "Hilangkan S terakhir dengan λ. Selesai! String valid." }
];

export default function CFGBuilder() {
  const [step, setStep] = useState(0);
  const current = derivationSteps[step];

  // Menghasilkan string untuk histori (contoh: S => SS => {S}S)
  const history = derivationSteps.slice(0, step + 1).map(s => s.str.join(''));

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 text-slate-200 h-full">
      
      {/* KIRI: Aturan & Histori */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-4 text-emerald-400 border-b border-slate-700 pb-2">Aturan Produksi CFG</h3>
          <p className="text-sm text-slate-400 mb-4">Target: <code className="text-white bg-slate-800 px-2 py-1 rounded">{"{}{{}}"}</code></p>
          <div className="space-y-2 font-mono text-base">
            <div className={`p-2 rounded border transition-colors ${current.rule === "S → {S}" ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>1. S → {"{S}"}</div>
            <div className={`p-2 rounded border transition-colors ${current.rule === "S → SS" ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>2. S → SS</div>
            <div className={`p-2 rounded border transition-colors ${current.rule === "S → λ" ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>3. S → λ <span className="text-sm font-normal text-slate-500">(Kosong)</span></div>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-4"><GitCommit size={18}/> Histori Derivasi</h3>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
            {history.map((h, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 items-center text-slate-300">
                {idx > 0 && <span className="text-slate-600">⇒</span>}
                <span className={idx === step ? 'text-indigo-300 font-bold bg-indigo-900/30 px-2 py-1 rounded' : ''}>{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* KANAN: Visualizer Sentential Form */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-indigo-400 font-mono">Leftmost Derivation Tracer</h3>
          <div className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            Langkah: {step} / {derivationSteps.length - 1}
          </div>
        </div>

        <motion.div key={step} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 bg-indigo-900/20 border border-indigo-500/30 rounded-xl min-h-[100px]">
          <p className="text-slate-300 text-base leading-relaxed">{current.desc}</p>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] border border-dashed border-slate-700 rounded-2xl bg-slate-900/50 p-8 overflow-hidden">
          <div className="text-sm text-slate-500 font-mono mb-8 uppercase tracking-widest">Sentential Form Saat Ini</div>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-4xl sm:text-6xl font-bold font-mono">
            <AnimatePresence mode="popLayout">
              {current.str.map((char, idx) => {
                const isActive = idx === current.activeIdx;
                const isVariable = char === 'S';
                
                return (
                  <motion.div
                    key={`${char}-${idx}-${step}`}
                    initial={{ scale: 0.5, opacity: 0, y: -20 }}
                    animate={{ scale: isActive ? 1.1 : 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, position: 'absolute' }}
                    className={`flex items-center justify-center transition-all ${isActive ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] border-b-4 border-emerald-500 pb-1' : isVariable ? 'text-indigo-400' : 'text-slate-300'}`}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button onClick={() => setStep(0)} disabled={step === 0} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl transition-colors flex items-center gap-2 font-medium">
            <RotateCcw size={18} /> Reset
          </button>
          {step < derivationSteps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-bold flex items-center gap-2">
              Langkah Penurunan <StepForward size={18} />
            </button>
          ) : (
            <button disabled className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle size={18} /> String Valid!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}