"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ArrowRightLeft, Grid3X3, Hash } from "lucide-react";
import CaesarCanvas from "@/components/crypto/CaesarCanvas";
import VigenereCanvas from "@/components/crypto/VigenereCanvas";

type CryptoSimType = 'caesar' | 'vigenere' | 'playfair' | 'affine';

export default function CryptoPlaygroundPage() {
  const [activeSim, setActiveSim] = useState<CryptoSimType>('caesar');

  const renderCanvas = () => {
    switch(activeSim) {
      case 'caesar': return <CaesarCanvas />;
      case 'vigenere': return <VigenereCanvas />;
      // case 'playfair': return <PlayfairCanvas />;
      // case 'affine': return <AffineCanvas />;
      default: return <div className="text-white p-8">Simulasi belum tersedia.</div>;
    }
  };

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 p-3 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 gap-4">
        <div className="flex items-center gap-4 z-10 w-full sm:w-1/4">
          <Link href="/crypto" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Keluar</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mode Latihan Bebas</span>
            <span className="text-slate-200 text-sm md:text-base font-bold whitespace-nowrap">Playground Kriptografi</span>
          </div>
        </div>

        <div className="flex justify-start sm:justify-end gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-3/4">
           <button onClick={() => setActiveSim('caesar')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'caesar' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
             <ArrowRightLeft size={16}/> Caesar Cipher
           </button>
           <button onClick={() => setActiveSim('vigenere')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'vigenere' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
             <KeyRound size={16}/> Vigenère Cipher
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-slate-900/40 p-2 md:p-4">
         <div className="w-full h-full max-w-[1600px] mx-auto bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4">
            {renderCanvas()}
         </div>
      </div>
    </main>
  );
}