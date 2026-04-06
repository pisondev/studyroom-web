'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Info } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown'; // IMPORT DROPDOWN

export default function MachineLogicCanvas() {
  const [testCase, setTestCase] = useState<string>('valid');
  const [isRunning, setIsRunning] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);
  const [result, setResult] = useState<'idle' | 'accepted' | 'rejected'>('idle');

  const stringData = testCase === 'valid' ? ['p', 'a', 's', 's'] : ['f', 'a', 'i', 'l'];

  const runSimulation = () => {
    setIsRunning(true); setResult('idle'); setCharIndex(-1);
    let i = 0;
    const interval = setInterval(() => {
      setCharIndex(i);
      if (i === stringData.length - 1) {
        clearInterval(interval);
        setTimeout(() => { setResult(testCase === 'valid' ? 'accepted' : 'rejected'); setIsRunning(false); }, 800);
      }
      i++;
    }, 800);
  };

  const reset = () => { setIsRunning(false); setResult('idle'); setCharIndex(-1); };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      
      {/* Penjelasan Makna */}
      <div className="w-full max-w-4xl mb-8 p-5 bg-slate-900 border border-slate-700 rounded-2xl">
        <h3 className="text-xl font-bold text-indigo-400 mb-2 flex items-center gap-2"><Info size={20}/> Bagaimana Mesin Bekerja?</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          Sebuah string dibaca karakter demi karakter oleh mesin. 
          <strong className="text-emerald-400"> "DITERIMA" (Pass)</strong> berarti setelah semua karakter habis dibaca, status mesin mendarat di titik akhir yang sah (Final State). 
          <strong className="text-rose-400"> "DITOLAK" (Fail)</strong> berarti mesin kehilangan arah (crash) atau berakhir di jebakan (Dead State).
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800 items-center justify-between">
          <CustomDropdown 
            options={[ { value: 'valid', label: 'Skenario: Input Valid' }, { value: 'invalid', label: 'Skenario: Input Salah' } ]}
            value={testCase} onChange={(val) => { setTestCase(val); reset(); }} disabled={isRunning}
          />
          <button onClick={result !== 'idle' ? reset : runSimulation} disabled={isRunning} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            {result !== 'idle' ? <><RotateCcw size={18}/> Reset Ulang</> : isRunning ? 'Memproses...' : <><Play size={18}/> Mulai Simulasi</>}
          </button>
        </div>
      </div>

      {/* Visualisasi Mesin (Sama seperti sebelumnya) */}
      <div className="relative w-full max-w-4xl h-64 border border-dashed border-slate-700 bg-slate-900/30 rounded-3xl flex items-center overflow-hidden">
        <div className="absolute left-8 flex gap-2">
          {stringData.map((char, idx) => (
            <motion.div key={idx} animate={{ x: charIndex >= idx ? 250 : 0, opacity: charIndex >= idx ? 0 : 1 }} transition={{ duration: 0.5 }} className="w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-md flex items-center justify-center text-2xl font-mono font-bold text-slate-300">{char}</motion.div>
          ))}
          <div className="absolute -bottom-4 -left-4 w-64 h-2 bg-slate-800 rounded-full"></div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-48 h-48 bg-slate-800 border-4 border-indigo-900 rounded-2xl flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(49,46,129,0.5)] overflow-hidden">
            <motion.div animate={{ rotate: isRunning ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-64 h-64 bg-indigo-500/10 blur-xl" />
            <span className="text-indigo-400 font-bold tracking-widest text-lg mb-2 z-10">AUTOMATA</span>
            <div className="flex gap-2 z-10">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}/>
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse delay-75' : 'bg-slate-600'}`}/>
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse delay-150' : 'bg-slate-600'}`}/>
            </div>
          </div>
        </div>

        <div className="absolute right-16 flex items-center justify-center">
          <AnimatePresence>
            {result === 'accepted' && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-emerald-400">
                <div className="w-20 h-20 bg-emerald-900/30 border-4 border-emerald-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">✅</div>
                <span className="text-xl font-bold tracking-widest">DITERIMA</span>
              </motion.div>
            )}
            {result === 'rejected' && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-rose-400">
                <div className="w-20 h-20 bg-rose-900/30 border-4 border-rose-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">❌</div>
                <span className="text-xl font-bold tracking-widest">DITOLAK</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}