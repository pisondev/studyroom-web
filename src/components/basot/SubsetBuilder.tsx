'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepForward, RotateCcw, CheckCircle, Search, GitCompare } from 'lucide-react';

const conversionSteps = [
  { 
    title: "Langkah 1: Tentukan Start State", 
    desc: <p>Mulai dari Start State NFA <strong className="text-fuchsia-400">q0</strong>. Kita bungkus ia menjadi satu <strong>himpunan state DFA baru</strong>: <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0]</code>.</p>,
    row: { state: "[q0]", in0: "?", in1: "?", isFinal: false, isNew: true },
    activeNodes: ['q0']
  },
  { 
    title: "Langkah 2: Lacak Input untuk [q0]", 
    desc: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Baca <strong className="text-white">'0'</strong>: NFA q0 bisa ke q0 & q1. Gabungkan menjadi <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q1]</code>.</li>
        <li>Baca <strong className="text-white">'1'</strong>: NFA q0 hanya ke q0. Hasilnya <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0]</code>.</li>
      </ul>
    ),
    row: { state: "[q0]", in0: "[q0, q1]", in1: "[q0]", isFinal: false, isNew: false },
    activeNodes: ['q0']
  },
  { 
    title: "Langkah 3: Evaluasi State Baru [q0, q1]", 
    desc: (
      <div className="space-y-2">
        <p>Himpunan baru <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q1]</code> ditemukan! Mari evaluasi:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Baca <strong className="text-white">'0'</strong>: q0➔{`{q0,q1}`}, q1➔{`{∅}`}. Gabungan: <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q1]</code>.</li>
          <li>Baca <strong className="text-white">'1'</strong>: q0➔{`{q0}`}, q1➔{`{q2}`}. Gabungan: <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q2]</code>.</li>
        </ul>
      </div>
    ),
    row: { state: "[q0, q1]", in0: "[q0, q1]", in1: "[q0, q2]", isFinal: false, isNew: true },
    activeNodes: ['q0', 'q1']
  },
  { 
    title: "Langkah 4: Evaluasi State Baru [q0, q2]", 
    desc: (
      <div className="space-y-2">
        <p>Himpunan baru <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q2]</code> ditemukan! Evaluasi lagi:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Baca <strong className="text-white">'0'</strong>: q0➔{`{q0,q1}`}, q2➔{`{∅}`}. Gabungan: <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0, q1]</code>.</li>
          <li>Baca <strong className="text-white">'1'</strong>: q0➔{`{q0}`}, q2➔{`{∅}`}. Gabungan: <code className="bg-slate-800 text-indigo-300 px-1 rounded">[q0]</code>.</li>
        </ul>
      </div>
    ),
    row: { state: "[q0, q2]", in0: "[q0, q1]", in1: "[q0]", isFinal: false, isNew: true },
    activeNodes: ['q0', 'q2']
  },
  { 
    title: "Langkah 5: Penentuan Final State", 
    desc: (
      <p>Pencarian Selesai!<br/><br/>
      <span className="text-emerald-400">Aturan Final:</span> Karena NFA memiliki q2 sebagai Final State, maka himpunan DFA mana pun yang memuat q2 (<code className="bg-emerald-900/30 text-emerald-300 px-1 rounded">*[q0, q2]</code>) otomatis menjadi Final State.</p>
    ),
    row: { state: "*[q0, q2]", in0: "[q0, q1]", in1: "[q0]", isFinal: true, isNew: false },
    activeNodes: ['q0', 'q1', 'q2']
  }
];

export default function SubsetBuilder() {
  const [step, setStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const tableRows = [
    step >= 1 ? conversionSteps[1].row : (step === 0 ? conversionSteps[0].row : null),
    step >= 2 ? conversionSteps[2].row : null,
    step >= 3 ? (step === 4 ? conversionSteps[4].row : conversionSteps[3].row) : null,
  ].filter(Boolean);

  const currentNodes = conversionSteps[step].activeNodes;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 text-slate-200 h-full">
      
      {/* KIRI: Visualizer / Diagram Komparasi */}
      <div className="w-full lg:w-5/12 bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col relative overflow-hidden transition-all duration-500">
        
        {!showComparison ? (
          <>
            <h3 className="text-xl font-bold mb-4 text-fuchsia-400 border-b border-slate-700 pb-2 flex items-center gap-2">
              <Search size={20}/> Melacak NFA Asli
            </h3>
            
            <div className="relative w-full h-[180px] bg-slate-950 border border-slate-800 rounded-xl mb-6 shadow-inner flex items-center justify-center">
              <div className="relative w-[340px] h-[120px]">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arr-mini" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#64748b" /></marker>
                  </defs>
                  {/* q0 Loop */}
                  <path d="M 45 40 C 25 -10, 85 -10, 65 40" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arr-mini)" />
                  <text x="45" y="10" fill="#94a3b8" fontSize="12" fontWeight="bold">0,1</text>
                  {/* q0 to q1 */}
                  <path d="M 75 60 L 145 60" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arr-mini)" />
                  <text x="105" y="52" fill="#94a3b8" fontSize="12" fontWeight="bold">0</text>
                  {/* q1 to q2 */}
                  <path d="M 195 60 L 265 60" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arr-mini)" />
                  <text x="225" y="52" fill="#94a3b8" fontSize="12" fontWeight="bold">1</text>
                </svg>

                {/* Nodes */}
                <motion.div animate={{ borderColor: currentNodes.includes('q0') ? '#c084fc' : '#475569', boxShadow: currentNodes.includes('q0') ? '0 0 15px rgba(192,132,252,0.6)' : 'none', color: currentNodes.includes('q0') ? '#fff' : '#94a3b8' }} className="absolute left-[35px] top-[40px] w-10 h-10 bg-slate-800 border-2 rounded-full flex items-center justify-center font-bold z-10">q0</motion.div>
                <motion.div animate={{ borderColor: currentNodes.includes('q1') ? '#c084fc' : '#475569', boxShadow: currentNodes.includes('q1') ? '0 0 15px rgba(192,132,252,0.6)' : 'none', color: currentNodes.includes('q1') ? '#fff' : '#94a3b8' }} className="absolute left-[155px] top-[40px] w-10 h-10 bg-slate-800 border-2 rounded-full flex items-center justify-center font-bold z-10">q1</motion.div>
                <motion.div animate={{ borderColor: currentNodes.includes('q2') ? '#c084fc' : '#475569', boxShadow: currentNodes.includes('q2') ? '0 0 15px rgba(192,132,252,0.6)' : 'none', color: currentNodes.includes('q2') ? '#c084fc' : '#94a3b8' }} className="absolute left-[275px] top-[40px] w-10 h-10 bg-slate-800 border-4 border-double rounded-full flex items-center justify-center font-bold z-10">q2</motion.div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-sm mt-auto h-[180px]">
              <AnimatePresence>
                {/* FIX: Penambahan atribut Key yang diwajibkan AnimatePresence */}
                {currentNodes.includes('q0') && (
                  <motion.div key="rule-q0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-3 rounded border bg-fuchsia-900/20 border-fuchsia-500/50">
                    <span className="text-fuchsia-400">q0</span> <span className="text-slate-500">──(0)➔</span> <span className="text-white">{"{q0, q1}"}</span><br/>
                    <span className="text-fuchsia-400">q0</span> <span className="text-slate-500">──(1)➔</span> <span className="text-white">{"{q0}"}</span>
                  </motion.div>
                )}
                {currentNodes.includes('q1') && (
                  <motion.div key="rule-q1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-3 rounded border bg-fuchsia-900/20 border-fuchsia-500/50">
                    <span className="text-fuchsia-400">q1</span> <span className="text-slate-500">──(0)➔</span> <span className="text-slate-500">∅ (Buntu)</span><br/>
                    <span className="text-fuchsia-400">q1</span> <span className="text-slate-500">──(1)➔</span> <span className="text-white">{"{q2}"}</span>
                  </motion.div>
                )}
                {currentNodes.includes('q2') && (
                  <motion.div key="rule-q2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-3 rounded border bg-fuchsia-900/20 border-fuchsia-500/50">
                    <span className="text-fuchsia-400">q2</span> <span className="text-slate-500">──(0,1)➔</span> <span className="text-slate-500">∅ (Buntu)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full">
            <h3 className="text-xl font-bold mb-4 text-emerald-400 border-b border-slate-700 pb-2 flex items-center gap-2">
              <GitCompare size={20}/> Hasil Konversi NFA vs DFA
            </h3>
            
            {/* Visualisasi NFA (Kecil di atas) */}
            <div className="relative w-full h-[120px] bg-slate-950/50 border border-slate-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <span className="absolute top-2 left-3 text-xs font-bold text-fuchsia-400">NFA Asli (Non-Deterministik)</span>
              <div className="relative w-[300px] h-[60px] mt-4">
                <svg className="absolute inset-0 w-full h-full"><path d="M 30 20 C 15 -10, 65 -10, 50 20" fill="none" stroke="#c084fc" strokeWidth="2" markerEnd="url(#arr-mini)"/><path d="M 60 30 L 130 30" fill="none" stroke="#c084fc" strokeWidth="2" markerEnd="url(#arr-mini)"/><path d="M 170 30 L 240 30" fill="none" stroke="#c084fc" strokeWidth="2" markerEnd="url(#arr-mini)"/></svg>
                <div className="absolute left-[20px] top-[10px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center text-xs font-bold text-white">q0</div>
                <div className="absolute left-[130px] top-[10px] w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center text-xs font-bold text-white">q1</div>
                <div className="absolute left-[240px] top-[10px] w-10 h-10 bg-slate-800 border-4 border-double border-fuchsia-400 rounded-full flex items-center justify-center text-xs font-bold text-white">q2</div>
              </div>
            </div>

            {/* Visualisasi DFA (Besar di bawah) */}
            <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
              <span className="absolute top-2 left-3 text-xs font-bold text-indigo-400">DFA Baru (Deterministik)</span>
              <div className="relative w-[340px] h-[220px] mt-4">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs><marker id="arr-dfa" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#818cf8" /></marker></defs>
                  
                  {/* [q0] to [q0, q1] (0) */}
                  <path d="M 80 110 L 160 50" fill="none" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr-dfa)" />
                  <text x="110" y="70" fill="#cbd5e1" fontSize="12" fontWeight="bold">0</text>
                  
                  {/* [q0] Loop (1) */}
                  <path d="M 40 130 C 0 170, 0 90, 40 100" fill="none" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr-dfa)" />
                  <text x="15" y="115" fill="#cbd5e1" fontSize="12" fontWeight="bold">1</text>
                  
                  {/* [q0,q1] Loop (0) */}
                  <path d="M 210 20 C 250 -20, 280 20, 220 40" fill="none" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr-dfa)" />
                  <text x="250" y="15" fill="#cbd5e1" fontSize="12" fontWeight="bold">0</text>

                  {/* [q0,q1] to [q0,q2] (1) */}
                  <path d="M 195 65 L 195 145" fill="none" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr-dfa)" />
                  <text x="205" y="110" fill="#cbd5e1" fontSize="12" fontWeight="bold">1</text>

                  {/* [q0,q2] to [q0,q1] (0 - curved) */}
                  <path d="M 175 145 Q 140 105 175 65" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arr-dfa)" />
                  <text x="145" y="110" fill="#cbd5e1" fontSize="12" fontWeight="bold">0</text>

                  {/* [q0,q2] to [q0] (1 - curved) */}
                  <path d="M 160 160 Q 100 170 70 140" fill="none" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr-dfa)" />
                  <text x="110" y="175" fill="#cbd5e1" fontSize="12" fontWeight="bold">1</text>
                </svg>

                {/* DFA Nodes */}
                <div className="absolute left-[30px] top-[100px] w-14 h-14 bg-indigo-900 border-2 border-indigo-400 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]">[q0]</div>
                <div className="absolute left-[165px] top-[20px] w-[60px] h-14 bg-indigo-900 border-2 border-indigo-400 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]">[q0,q1]</div>
                <div className="absolute left-[165px] top-[150px] w-[60px] h-14 bg-emerald-900 border-4 border-double border-emerald-400 rounded-full flex items-center justify-center text-xs font-bold text-emerald-100 z-10 shadow-[0_0_15px_rgba(52,211,153,0.4)]">[q0,q2]</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* KANAN: Interaktif Tabel DFA */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-indigo-400 font-mono">Tabel Konstruksi Subset</h3>
          <div className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            Progres: {step} / {conversionSteps.length - 1}
          </div>
        </div>

        <motion.div key={step} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 bg-indigo-900/20 border border-indigo-500/30 rounded-xl min-h-[120px]">
          <h4 className="font-bold text-white mb-2 text-lg">{conversionSteps[step].title}</h4>
          <div className="text-slate-300 text-sm leading-relaxed">{conversionSteps[step].desc}</div>
        </motion.div>

        {/* FIX: CSS Kustom Scrollbar */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-950 text-slate-400 sticky top-0 z-10">
                <th className="p-4 font-medium border-r border-slate-800 whitespace-nowrap">State DFA</th>
                <th className="p-4 font-medium border-r border-slate-800 text-center">Input '0'</th>
                <th className="p-4 font-medium text-center">Input '1'</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {tableRows.map((r: any, idx: number) => (
                  <motion.tr key={r.state + idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`border-b border-slate-800/50 ${r.isFinal ? 'bg-emerald-900/20' : 'hover:bg-slate-800/50'}`}>
                    <td className="p-4 font-mono font-bold text-indigo-300 border-r border-slate-800 whitespace-nowrap">
                      {idx === 0 && !r.isFinal && <span className="text-slate-500 mr-2">➔</span>}
                      {r.state}
                    </td>
                    <td className={`p-4 font-mono border-r border-slate-800 text-center ${r.in0 === '?' ? 'text-slate-600' : 'text-white'}`}>{r.in0}</td>
                    <td className={`p-4 font-mono text-center ${r.in1 === '?' ? 'text-slate-600' : 'text-white'}`}>{r.in1}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4">
          <button onClick={() => { setStep(0); setShowComparison(false); }} disabled={step === 0} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-md transition-colors flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
          
          {step < conversionSteps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-500/20 font-bold flex items-center gap-2">
              Langkah Selanjutnya <StepForward size={16} />
            </button>
          ) : !showComparison ? (
            <button onClick={() => setShowComparison(true)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold flex items-center gap-2 animate-bounce">
              <GitCompare size={16} /> Lihat Hasil Akhir
            </button>
          ) : (
            <button disabled className="px-6 py-2 bg-emerald-900/50 text-emerald-400 border border-emerald-500/50 rounded-md font-bold flex items-center gap-2 cursor-default">
              <CheckCircle size={16} /> Konversi Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}