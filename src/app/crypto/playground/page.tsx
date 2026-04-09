"use client";
import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ArrowRightLeft, Cpu, Grid3x3, LayoutGrid, Binary, AlignJustify, ScanLine } from "lucide-react";

import CaesarCanvas from "@/components/crypto/CaesarCanvas";
import VigenereCanvas from "@/components/crypto/VigenereCanvas";
import AffineCanvas from "@/components/crypto/AffineCanvas";
import PlayfairCanvas from "@/components/crypto/PlayfairCanvas";
import HillCanvas from "@/components/crypto/HillCanvas";
import VernamCanvas from "@/components/crypto/VernamCanvas";
import RowTransCanvas from "@/components/crypto/RowTransCanvas";
import RailFenceCanvas from "@/components/crypto/RailFenceCanvas";

type CryptoSimType = 'caesar' | 'affine' | 'vigenere' | 'playfair' | 'hill' | 'vernam' | 'rowtrans' | 'railfence';

export default function CryptoPlaygroundPage() {
  const [activeSim, setActiveSim] = useState<CryptoSimType>('caesar');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const renderCanvas = () => {
    switch(activeSim) {
      case 'caesar': return <CaesarCanvas />;
      case 'affine': return <AffineCanvas />;
      case 'vigenere': return <VigenereCanvas />;
      case 'playfair': return <PlayfairCanvas />;
      case 'hill': return <HillCanvas />;
      case 'vernam': return <VernamCanvas />;
      case 'rowtrans': return <RowTransCanvas />;
      case 'railfence': return <RailFenceCanvas />;
      default: return <div className="text-white p-8">Simulasi belum tersedia.</div>;
    }
  };

  // Logic untuk drag-to-scroll
  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden">
      
      {/* Header Playground */}
      <header className="shrink-0 p-3 md:px-5 md:py-4 flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 gap-4">
        
        {/* Kiri: Tombol Keluar + Judul */}
        <div className="flex items-center gap-4 z-10 shrink-0 mb-2 xl:mb-0">
          <Link href="/crypto" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50 shrink-0">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Keluar</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mode Latihan Bebas</span>
            <span className="text-slate-200 text-sm md:text-base font-bold whitespace-nowrap">Kripto Playground</span>
          </div>
        </div>

        {/* Tengah/Kanan: Menu Tab Algoritma Terklasifikasi */}
        {/* PERBAIKAN: flex-1 min-w-0 memastikan scroll container tidak menabrak batas layar */}
        <div className="flex-1 min-w-0 w-full">
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex items-start gap-4 md:gap-6 overflow-x-auto beautiful-scrollbar pb-3 pt-1 px-2 mask-edges-right select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
             {/* Kelompok Monoalphabetic */}
             <div className="flex flex-col gap-2 shrink-0">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Monoalphabetic</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'caesar'} onClick={() => setActiveSim('caesar')} icon={<ArrowRightLeft size={16}/>} label="Caesar" />
                 <TabButton active={activeSim === 'affine'} onClick={() => setActiveSim('affine')} icon={<Cpu size={16}/>} label="Affine" />
               </div>
             </div>
             
             {/* PERBAIKAN: Divider vertikal yang lebih stabil */}
             <div className="hidden md:block w-px bg-slate-700/50 self-stretch mt-6 shrink-0" /> 

             {/* Kelompok Polyalphabetic */}
             <div className="flex flex-col gap-2 shrink-0">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Polyalphabetic</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'playfair'} onClick={() => setActiveSim('playfair')} icon={<Grid3x3 size={16}/>} label="Playfair" />
                 <TabButton active={activeSim === 'hill'} onClick={() => setActiveSim('hill')} icon={<LayoutGrid size={16}/>} label="Hill" />
                 <TabButton active={activeSim === 'vigenere'} onClick={() => setActiveSim('vigenere')} icon={<KeyRound size={16}/>} label="Vigenère" />
                 <TabButton active={activeSim === 'vernam'} onClick={() => setActiveSim('vernam')} icon={<Binary size={16}/>} label="Vernam/OTP" />
               </div>
             </div>

             <div className="hidden md:block w-px bg-slate-700/50 self-stretch mt-6 shrink-0" /> 

             {/* Kelompok Transposisi */}
             <div className="flex flex-col gap-2 shrink-0 pr-12">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Transposisi</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'rowtrans'} onClick={() => setActiveSim('rowtrans')} icon={<AlignJustify size={16}/>} label="Row Transposition" />
                 <TabButton active={activeSim === 'railfence'} onClick={() => setActiveSim('railfence')} icon={<ScanLine size={16}/>} label="Rail Fence" />
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Konten Utama Canvas */}
      <div className="flex-1 overflow-hidden bg-slate-900/40 p-2 md:p-4">
         <div className="w-full h-full max-w-[1600px] mx-auto bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4">
            {renderCanvas()}
         </div>
      </div>
      
      {/* Global Style */}
      <style jsx global>{`
        .mask-edges-right {
          mask-image: linear-gradient(to right, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, black 90%, transparent);
        }
        .beautiful-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4); 
          border-radius: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4); 
          border-radius: 8px;
        }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </main>
  );
}

// Komponen Helper untuk merapikan Tab Button
function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }} 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${active ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
    >
      {icon} {label}
    </button>
  );
}