'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, AlertTriangle, Zap, RotateCcw, Pointer } from 'lucide-react';

export default function NFADilemmaCanvas() {
  const [phase, setPhase] = useState(0);

  const handleTap = () => {
    if (phase < 3) setPhase((p) => p + 1);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik tombol memicu handleTap
    setPhase(0);
  };

  return (
    <div 
      onClick={handleTap}
      className={`w-full h-full flex flex-col items-center justify-center p-4 transition-colors duration-500 rounded-xl relative ${phase < 3 ? 'cursor-pointer hover:bg-slate-900/40' : ''}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Dilema NFA di Dunia Nyata</h2>
        <p className="text-slate-400">Mengapa NFA sempurna untuk manusia, tapi menjadi mimpi buruk bagi komputer?</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mb-12 pointer-events-none">
        {/* KIRI: Manusia */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><BrainCircuit size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-200">Manusia (Desainer)</h3>
              <p className="text-sm text-slate-500">Berpikir Intuitif</p>
            </div>
          </div>
          
          <div className="h-48 flex flex-col justify-center items-center relative">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-center w-full">
              <div className="bg-slate-800 border border-indigo-500/50 text-indigo-300 px-4 py-3 rounded-xl font-mono mb-4 text-sm shadow-[0_0_20px_rgba(99,102,241,0.1)] inline-block">
                <span className="text-white">q0</span> <span className="text-slate-500">──(0)➔</span> <span className="text-indigo-400 font-bold">{"{q0, q1}"}</span>
              </div>
              <p className="text-slate-300 italic text-sm">"Gampang! Nanti mesinnya tebak aja sendiri mau lewat cabang yang mana."</p>
            </motion.div>
          </div>
        </div>

        {/* TENGAH: Petir */}
        <div className="hidden md:flex flex-col justify-center items-center text-rose-500">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
            <Zap size={40} />
          </motion.div>
        </div>

        {/* KANAN: Komputer */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl"><Cpu size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-200">Komputer (CPU)</h3>
              <p className="text-sm text-slate-500">Eksekutor Deterministik</p>
            </div>
          </div>

          <div className="h-48 flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-400 text-center">
                  <Cpu size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Menunggu Instruksi...</p>
                </motion.div>
              )}
              {phase === 1 && (
                <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-center">
                  <div className="text-lg font-mono text-amber-400 bg-amber-400/10 px-4 py-2 rounded-lg inline-block border border-amber-400/30 mb-4">Input diterima: '0'</div>
                  <p className="text-slate-300 text-sm">"Mengecek tabel transisi dari state q0..."</p>
                </motion.div>
              )}
              {phase === 2 && (
                <motion.div key="p2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                  <p className="text-slate-300 mb-4 text-sm">"Tunggu, ada dua jalan terbuka!"</p>
                  <div className="flex justify-center gap-3 mb-4">
                    <div className="bg-slate-800 border border-slate-600 text-slate-300 p-2 rounded text-sm w-28">Ke q0?</div>
                    <div className="bg-slate-800 border border-slate-600 text-slate-300 p-2 rounded text-sm w-28">Ke q1?</div>
                  </div>
                </motion.div>
              )}
              {phase === 3 && (
                <motion.div key="p3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.2 }} className="text-rose-500 flex items-center justify-center gap-2 font-bold text-lg bg-rose-500/10 py-3 rounded-lg border border-rose-500/50">
                    <AlertTriangle size={24} /> KERNEL PANIC
                  </motion.div>
                  <p className="text-sm text-rose-400 mt-3 font-mono">Fatal: Non-deterministic path detected.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Kontrol Navigasi Mengambang di Bawah */}
      <div className="flex items-center gap-6 z-10">
        {phase < 3 ? (
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-900/30 px-6 py-3 rounded-full border border-indigo-500/30 pointer-events-none">
            <Pointer size={20} /> Ketuk layar untuk melanjutkan...
          </motion.div>
        ) : (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={reset} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all z-20">
            <RotateCcw size={18} /> Reset Simulasi
          </motion.button>
        )}
      </div>
    </div>
  );
}