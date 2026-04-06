'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const vocabularies = [
  {
    id: "alfabet", symbol: "Σ", title: "Alfabet (Sigma)",
    desc: "Himpunan simbol dasar yang berhingga. Ibarat 'tipe data' karakter yang diizinkan oleh sistem.",
    mathDef: "Σ = { a_1, a_2, ..., a_n } dimana n > 0",
    code: (
      <>
        <span className="text-slate-500">// 1. Mendefinisikan 'Tipe Data' Karakter</span><br/>
        <span className="text-pink-400">const</span> <span className="text-indigo-300">Sigma</span> <span className="text-cyan-400">=</span> new <span className="text-emerald-300">Set</span>([<span className="text-amber-300">'a'</span>, <span className="text-amber-300">'b'</span>]);<br/><br/>
        <span className="text-slate-500">// Sistem hanya mengenali huruf 'a' dan 'b'.</span>
      </>
    )
  },
  {
    id: "string", symbol: "w", title: "String (Kata)",
    desc: "Deretan simbol yang disusun dari alfabet. Ini adalah data input/payload aktual yang akan diproses.",
    mathDef: "w = x_1 x_2 ... x_k dimana x_i ∈ Σ",
    code: (
      <>
        <span className="text-slate-500">// 2. Merangkai karakter menjadi String (w)</span><br/>
        <span className="text-pink-400">let</span> <span className="text-indigo-300">w</span> <span className="text-cyan-400">=</span> <span className="text-amber-300">"aba"</span>;<br/><br/>
        <span className="text-slate-500">// Catatan Penting:</span><br/>
        <span className="text-pink-400">let</span> <span className="text-indigo-300">lambda</span> <span className="text-cyan-400">=</span> <span className="text-amber-300">""</span>; <span className="text-slate-500">// λ (String kosong) adalah valid!</span>
      </>
    )
  },
  {
    id: "language", symbol: "L", title: "Bahasa (Language)",
    desc: "Kumpulan string yang dianggap 'Valid'. Sistem hanya akan menerima string yang terdaftar di sini.",
    mathDef: "L ⊆ Σ* (Bahasa adalah subset dari semua kombinasi string)",
    code: (
      <>
        <span className="text-slate-500">// 3. Membuat Aturan Validasi (Bahasa L)</span><br/>
        <span className="text-pink-400">function</span> <span className="text-blue-400">validate</span>(<span className="text-orange-300">w</span>) {"{"}<br/>
        &nbsp;&nbsp;<span className="text-pink-400">if</span> (w.<span className="text-blue-400">startsWith</span>(<span className="text-amber-300">'a'</span>)) <span className="text-pink-400">return</span> <span className="text-emerald-400">"DITERIMA"</span>;<br/>
        &nbsp;&nbsp;<span className="text-pink-400">return</span> <span className="text-rose-400">"DITOLAK"</span>;<br/>
        {"}"}<br/>
      </>
    )
  },
  {
    id: "grammar", symbol: "G", title: "Tata Bahasa (Grammar)",
    desc: "Aturan matematis di balik layar untuk memproduksi string-string valid di dalam sebuah Bahasa.",
    mathDef: "G = (V, T, S, P) -> Variabel, Terminal, Start, Produksi",
    code: (
      <>
        <span className="text-slate-500">// 4. Aturan Produksi (Grammar)</span><br/>
        <span className="text-indigo-300">S</span> <span className="text-cyan-400">→</span> <span className="text-amber-300">a</span><span className="text-indigo-300">A</span> &nbsp;&nbsp;<span className="text-slate-500">// Cetak 'a', panggil 'A'</span><br/>
        <span className="text-indigo-300">A</span> <span className="text-cyan-400">→</span> <span className="text-amber-300">a</span><span className="text-indigo-300">A</span> &nbsp;&nbsp;<span className="text-slate-500">// Lanjut cetak 'a'</span><br/>
        <span className="text-indigo-300">A</span> <span className="text-cyan-400">→</span> <span className="text-amber-300">b</span><span className="text-indigo-300">A</span> &nbsp;&nbsp;<span className="text-slate-500">// Lanjut cetak 'b'</span><br/>
        <span className="text-indigo-300">A</span> <span className="text-cyan-400">→</span> <span className="text-orange-400">λ</span> &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Berhenti (Kosong)</span><br/>
      </>
    )
  }
];

export default function VocabCanvas() {
  const [activeId, setActiveId] = useState<string>(vocabularies[0].id);

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 mt-4">
        {vocabularies.map((v) => {
          const isActive = activeId === v.id;
          return (
            <motion.button key={v.id} onClick={() => setActiveId(v.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              animate={{ borderColor: isActive ? '#818cf8' : '#334155', backgroundColor: isActive ? '#1e1b4b' : '#0f172a' }}
              className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center cursor-pointer transition-colors shadow-lg"
            >
              <span className={`text-2xl md:text-4xl font-bold font-mono ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>{v.symbol}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {vocabularies.map((v) => v.id === activeId && (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
            
            <div className="flex-1 bg-slate-900/80 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{v.title}</h3>
                <p className="text-slate-300 leading-relaxed text-lg">{v.desc}</p>
              </div>
              <div className="mt-auto p-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Definisi Matematis</span>
                <code className="text-indigo-200 font-mono text-sm">{v.mathDef}</code>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"/><div className="w-3 h-3 rounded-full bg-amber-500"/><div className="w-3 h-3 rounded-full bg-emerald-500"/></div>
                <span className="ml-4 text-xs font-mono text-slate-500">contoh_{v.id}.js</span>
              </div>
              <pre className="p-5 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{v.code}</pre>
            </div>
            
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}