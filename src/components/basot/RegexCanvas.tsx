'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Asterisk, Minus } from 'lucide-react';

type RegexOp = 'concat' | 'union' | 'star';

export default function RegexCanvas() {
  const [operation, setOperation] = useState<RegexOp>('concat');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Thompson's Construction</h2>
        <p className="text-slate-400">Bagaimana compiler merakit mesin NFA dari rumus Regex sederhana.</p>
      </div>

      {/* Kontrol Operasi */}
      <div className="flex gap-4 mb-8 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-lg">
        <button onClick={() => setOperation('concat')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${operation === 'concat' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Minus size={18} /> Concatenation (ab)
        </button>
        <button onClick={() => setOperation('union')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${operation === 'union' ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,132,252,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Plus size={18} /> Union (a+b)
        </button>
        <button onClick={() => setOperation('star')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${operation === 'star' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Asterisk size={18} /> Kleene Star (a*)
        </button>
      </div>

      {/* Visualisasi Graf */}
      <div className="relative w-full max-w-4xl h-80 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner">
        <div className="absolute top-4 left-4 flex gap-2">
           <div className="px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">λ (Lambda) = Jalan Tol Tanpa Input</div>
        </div>

        <AnimatePresence mode="wait">
          {/* CONCATENATION (ab) */}
          {operation === 'concat' && (
            <motion.div key="concat" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative w-[500px] h-[100px]">
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <defs><marker id="arr-reg" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#818cf8" /></marker></defs>
                <path d="M 50 50 L 170 50" fill="none" stroke="#818cf8" strokeWidth="3" markerEnd="url(#arr-reg)" />
                <text x="100" y="40" fill="#818cf8" fontSize="16" fontWeight="bold">a</text>
                <path d="M 230 50 L 320 50" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-reg)" />
                <text x="270" y="40" fill="#94a3b8" fontSize="14">λ</text>
                <path d="M 380 50 L 500 50" fill="none" stroke="#818cf8" strokeWidth="3" markerEnd="url(#arr-reg)" />
                <text x="430" y="40" fill="#818cf8" fontSize="16" fontWeight="bold">b</text>
              </svg>
              {/* Nodes */}
              <div className="absolute left-[30px] top-[30px] w-10 h-10 bg-slate-800 border-2 border-indigo-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]">q0</div>
              <div className="absolute left-[180px] top-[30px] w-10 h-10 bg-slate-800 border-2 border-indigo-400 rounded-full flex items-center justify-center font-bold text-white z-10">q1</div>
              <div className="absolute left-[330px] top-[30px] w-10 h-10 bg-slate-800 border-2 border-indigo-400 rounded-full flex items-center justify-center font-bold text-white z-10">q2</div>
              <div className="absolute left-[510px] top-[30px] w-10 h-10 bg-slate-800 border-4 border-double border-indigo-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]">q3</div>
            </motion.div>
          )}

          {/* UNION (a+b) */}
          {operation === 'union' && (
            <motion.div key="union" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative w-[500px] h-[200px]">
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <defs><marker id="arr-uni" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#c084fc" /></marker></defs>
                {/* Branch Top (a) */}
                <path d="M 60 90 Q 100 40 140 40" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-uni)" />
                <text x="90" y="50" fill="#94a3b8" fontSize="14">λ</text>
                <path d="M 190 40 L 310 40" fill="none" stroke="#c084fc" strokeWidth="3" markerEnd="url(#arr-uni)" />
                <text x="245" y="30" fill="#c084fc" fontSize="16" fontWeight="bold">a</text>
                <path d="M 360 40 Q 400 40 440 90" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-uni)" />
                <text x="400" y="50" fill="#94a3b8" fontSize="14">λ</text>
                {/* Branch Bottom (b) */}
                <path d="M 60 110 Q 100 160 140 160" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-uni)" />
                <text x="90" y="165" fill="#94a3b8" fontSize="14">λ</text>
                <path d="M 190 160 L 310 160" fill="none" stroke="#c084fc" strokeWidth="3" markerEnd="url(#arr-uni)" />
                <text x="245" y="150" fill="#c084fc" fontSize="16" fontWeight="bold">b</text>
                <path d="M 360 160 Q 400 160 440 110" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-uni)" />
                <text x="400" y="165" fill="#94a3b8" fontSize="14">λ</text>
              </svg>
              <div className="absolute left-[10px] top-[80px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(192,132,252,0.4)]">q0</div>
              <div className="absolute left-[140px] top-[20px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10">q1</div>
              <div className="absolute left-[310px] top-[20px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10">q2</div>
              <div className="absolute left-[140px] top-[140px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10">q3</div>
              <div className="absolute left-[310px] top-[140px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10">q4</div>
              <div className="absolute left-[440px] top-[80px] w-10 h-10 bg-slate-800 border-4 border-double border-fuchsia-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(192,132,252,0.4)]">q5</div>
            </motion.div>
          )}

          {/* KLEENE STAR (a*) */}
          {operation === 'star' && (
            <motion.div key="star" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative w-[500px] h-[180px]">
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <defs><marker id="arr-star" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10b981" /></marker></defs>
                {/* Main forward */}
                <path d="M 50 100 L 140 100" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-star)" />
                <text x="90" y="90" fill="#94a3b8" fontSize="14">λ</text>
                <path d="M 190 100 L 310 100" fill="none" stroke="#10b981" strokeWidth="3" markerEnd="url(#arr-star)" />
                <text x="245" y="90" fill="#10b981" fontSize="16" fontWeight="bold">a</text>
                <path d="M 360 100 L 450 100" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-star)" />
                <text x="400" y="90" fill="#94a3b8" fontSize="14">λ</text>
                {/* Loop Back (Repeat) */}
                <path d="M 330 80 Q 250 20 170 80" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-star)" />
                <text x="245" y="40" fill="#94a3b8" fontSize="14">λ (Ulangi)</text>
                {/* Bypass (Zero times) */}
                <path d="M 30 120 Q 250 200 470 120" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arr-star)" />
                <text x="245" y="180" fill="#94a3b8" fontSize="14">λ (Lewati)</text>
              </svg>
              <div className="absolute left-[10px] top-[80px] w-10 h-10 bg-slate-800 border-2 border-emerald-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]">q0</div>
              <div className="absolute left-[140px] top-[80px] w-10 h-10 bg-slate-800 border-2 border-emerald-400 rounded-full flex items-center justify-center font-bold text-white z-10">q1</div>
              <div className="absolute left-[310px] top-[80px] w-10 h-10 bg-slate-800 border-2 border-emerald-400 rounded-full flex items-center justify-center font-bold text-white z-10">q2</div>
              <div className="absolute left-[460px] top-[80px] w-10 h-10 bg-slate-800 border-4 border-double border-emerald-400 rounded-full flex items-center justify-center font-bold text-white z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]">q3</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}