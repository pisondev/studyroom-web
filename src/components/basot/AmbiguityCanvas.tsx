'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, GitMerge, CheckCircle } from 'lucide-react';

export default function AmbiguityCanvas() {
  const [treeType, setTreeType] = useState<'left' | 'right'>('left');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Bencana Ambiguitas</h2>
        <p className="text-slate-400">Aturan Kalkulator: <code className="text-indigo-300 bg-slate-800 px-2 py-1 rounded font-mono">E → E + E | E * E | id</code></p>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setTreeType('left')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${treeType === 'left' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <GitMerge size={18} /> Pohon 1: Prioritas (+)
        </button>
        <button 
          onClick={() => setTreeType('right')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${treeType === 'right' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <GitMerge size={18} /> Pohon 2: Prioritas (*)
        </button>
      </div>

      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
        <h3 className="text-xl font-bold font-mono text-slate-300 mb-8">
          Input String: <span className="text-white">2 + 3 * 4</span>
        </h3>

        <div className="relative w-[600px] h-[300px]">
          <AnimatePresence mode="wait">
            {treeType === 'left' ? (
              <motion.div key="tree-left" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {/* Garis Tree 1 (Root: *) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Root ke Level 1 */}
                  <line x1="300" y1="40" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  <line x1="300" y1="40" x2="300" y2="100" stroke="#475569" strokeWidth="3" />
                  <line x1="300" y1="40" x2="450" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Level 1 (Kiri) ke Level 2 */}
                  <line x1="150" y1="120" x2="50" y2="180" stroke="#475569" strokeWidth="3" />
                  <line x1="150" y1="120" x2="150" y2="180" stroke="#475569" strokeWidth="3" />
                  <line x1="150" y1="120" x2="250" y2="180" stroke="#475569" strokeWidth="3" />
                  {/* Daun (Angka) */}
                  <line x1="50" y1="200" x2="50" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                  <line x1="250" y1="200" x2="250" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                  <line x1="450" y1="120" x2="450" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                </svg>
                {/* Node Tree 1 */}
                <div className="absolute left-[280px] top-[20px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10 border-2 border-indigo-300">E</div>
                
                <div className="absolute left-[130px] top-[100px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>
                <div className="absolute left-[280px] top-[100px] w-10 h-10 bg-rose-900 border border-rose-500 rounded-full flex justify-center items-center font-bold text-rose-300 z-10 text-xl">*</div>
                <div className="absolute left-[430px] top-[100px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>

                <div className="absolute left-[30px] top-[180px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>
                <div className="absolute left-[130px] top-[180px] w-10 h-10 bg-rose-900 border border-rose-500 rounded-full flex justify-center items-center font-bold text-rose-300 z-10 text-xl">+</div>
                <div className="absolute left-[230px] top-[180px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>

                {/* Daun */}
                <div className="absolute left-[30px] top-[250px] font-bold text-2xl text-emerald-400">2</div>
                <div className="absolute left-[230px] top-[250px] font-bold text-2xl text-emerald-400">3</div>
                <div className="absolute left-[430px] top-[250px] font-bold text-2xl text-emerald-400">4</div>
              </motion.div>
            ) : (
              <motion.div key="tree-right" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {/* Garis Tree 2 (Root: +) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Root ke Level 1 */}
                  <line x1="300" y1="40" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  <line x1="300" y1="40" x2="300" y2="100" stroke="#475569" strokeWidth="3" />
                  <line x1="300" y1="40" x2="450" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Level 1 (Kanan) ke Level 2 */}
                  <line x1="450" y1="120" x2="350" y2="180" stroke="#475569" strokeWidth="3" />
                  <line x1="450" y1="120" x2="450" y2="180" stroke="#475569" strokeWidth="3" />
                  <line x1="450" y1="120" x2="550" y2="180" stroke="#475569" strokeWidth="3" />
                  {/* Daun (Angka) */}
                  <line x1="150" y1="120" x2="150" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                  <line x1="350" y1="200" x2="350" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                  <line x1="550" y1="200" x2="550" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                </svg>
                {/* Node Tree 2 */}
                <div className="absolute left-[280px] top-[20px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10 border-2 border-indigo-300">E</div>
                
                <div className="absolute left-[130px] top-[100px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>
                <div className="absolute left-[280px] top-[100px] w-10 h-10 bg-emerald-900 border border-emerald-500 rounded-full flex justify-center items-center font-bold text-emerald-300 z-10 text-xl">+</div>
                <div className="absolute left-[430px] top-[100px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>

                <div className="absolute left-[330px] top-[180px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>
                <div className="absolute left-[430px] top-[180px] w-10 h-10 bg-emerald-900 border border-emerald-500 rounded-full flex justify-center items-center font-bold text-emerald-300 z-10 text-xl">*</div>
                <div className="absolute left-[530px] top-[180px] w-10 h-10 bg-indigo-600 rounded-full flex justify-center items-center font-bold text-white z-10">E</div>

                {/* Daun */}
                <div className="absolute left-[130px] top-[250px] font-bold text-2xl text-emerald-400">2</div>
                <div className="absolute left-[330px] top-[250px] font-bold text-2xl text-emerald-400">3</div>
                <div className="absolute left-[530px] top-[250px] font-bold text-2xl text-emerald-400">4</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {treeType === 'left' ? (
          <motion.div key="res1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-rose-900/20 border border-rose-500/50 p-6 rounded-2xl w-full max-w-4xl flex items-center gap-4">
            <AlertTriangle className="text-rose-500 flex-shrink-0" size={32} />
            <div>
              <h4 className="text-rose-400 font-bold text-lg mb-1">Hasil Kalkulasi: 20 (SALAH!)</h4>
              <p className="text-slate-300 text-sm">Karena operasi (+) berada lebih di bawah pada pohon, ia dieksekusi lebih dulu oleh compiler: <code className="bg-slate-900 px-1 rounded">(2 + 3) * 4 = 20</code>. Ini menyalahi aturan matematika!</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="res2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-emerald-900/20 border border-emerald-500/50 p-6 rounded-2xl w-full max-w-4xl flex items-center gap-4">
            <CheckCircle className="text-emerald-500 flex-shrink-0" size={32} />
            <div>
              <h4 className="text-emerald-400 font-bold text-lg mb-1">Hasil Kalkulasi: 14 (BENAR)</h4>
              <p className="text-slate-300 text-sm">Operasi (*) berada lebih dalam di pohon, sehingga dieksekusi lebih dulu: <code className="bg-slate-900 px-1 rounded">2 + (3 * 4) = 14</code>. Kedua pohon ini valid dari 1 grammar yang sama, itulah <strong>Ambiguitas</strong>!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}