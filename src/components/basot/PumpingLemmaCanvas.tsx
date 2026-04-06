'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Play, Repeat, CheckCircle } from 'lucide-react';

export default function PumpingLemmaCanvas() {
  const [pumpValue, setPumpValue] = useState<number>(2);
  const p = 3; // Konstanta pumping (batas memori hipotetis)
  
  // Karena p=3, string awal (i=1) adalah w = a^3 b^3 -> aaabbb
  // Kita partisi sesuai syarat: |xy| <= p dan |y| > 0.
  // Paling logis: x = "aa", y = "a", z = "bbb".
  const x = ['a', 'a'];
  const y = ['a']; // Bagian yang dipompa (LOOP)
  const z = ['b', 'b', 'b'];

  const yPumped = Array(pumpValue).fill(y).flat();
  const currentString = [...x, ...yPumped, ...z];
  
  const countA = currentString.filter(c => c === 'a').length;
  const countB = currentString.filter(c => c === 'b').length;
  const isValid = countA === countB;

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Pumping Lemma Simulator</h2>
        <p className="text-slate-400">Target Pembuktian: Bahasa L = {"{aⁿbⁿ | n ≥ 0}"} BUKAN Bahasa Reguler.</p>
      </div>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-amber-400 font-mono mb-1">String Ujian (w = a³b³)</h3>
            <p className="text-sm text-slate-400">Bagian <strong className="text-rose-400">y</strong> (Loop) terkurung di kumpulan huruf 'a'.</p>
          </div>
          
          <div className="flex flex-col items-end">
            <label className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Pompa Bagian (y) : i = {pumpValue}</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(val => (
                <button 
                  key={val} onClick={() => setPumpValue(val)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${pumpValue === val ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Tape (String Visualization) */}
        <div className="relative min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-wrap gap-2 items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            {/* Bagian X */}
            {x.map((char, idx) => (
              <motion.div key={`x-${idx}`} layout className="w-12 h-14 bg-slate-800 border-2 border-slate-600 rounded flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-slate-300">{char}</span>
                <span className="text-[10px] text-slate-500 absolute bottom-1">x</span>
              </motion.div>
            ))}

            {/* Bagian Y (Bisa digandakan/hilang) */}
            {yPumped.map((char, idx) => (
              <motion.div 
                key={`y-${idx}`} layout
                initial={{ scale: 0, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0, y: 20, opacity: 0 }}
                className="w-12 h-16 bg-rose-900/40 border-2 border-rose-500 rounded flex flex-col items-center justify-center relative shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10"
              >
                <span className="text-2xl font-bold font-mono text-rose-300">{char}</span>
                <span className="text-[10px] text-rose-400 absolute bottom-1 font-bold">y</span>
              </motion.div>
            ))}
            
            {/* Indikator y kosong (jika i=0) */}
            {pumpValue === 0 && (
              <motion.div layout initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} className="text-sm font-mono text-rose-500 italic px-2">
                (y dihapus)
              </motion.div>
            )}

            {/* Bagian Z */}
            {z.map((char, idx) => (
              <motion.div key={`z-${idx}`} layout className="w-12 h-14 bg-slate-800 border-2 border-slate-600 rounded flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-slate-300">{char}</span>
                <span className="text-[10px] text-slate-500 absolute bottom-1">z</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Counter & Result */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center">
            <div className="text-sm text-slate-400 font-mono mb-1">Jumlah 'a'</div>
            <div className={`text-4xl font-bold ${countA === countB ? 'text-slate-200' : 'text-rose-400'}`}>{countA}</div>
          </div>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center">
            <div className="text-sm text-slate-400 font-mono mb-1">Jumlah 'b'</div>
            <div className="text-4xl font-bold text-slate-200">{countB}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isValid ? (
            <motion.div key="valid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-xl flex items-center justify-center gap-3 text-emerald-400 font-bold">
              <CheckCircle size={24} /> String Tetap Valid (a = b)
            </motion.div>
          ) : (
            <motion.div key="invalid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 p-4 bg-rose-900/20 border border-rose-500/50 rounded-xl flex items-center justify-center gap-3 text-rose-400 font-bold">
              <AlertTriangle size={24} /> KONTRADIKSI! Keseimbangan hancur (a ≠ b)
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}