"use client";
import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ArrowRightLeft, Cpu, Grid3x3, LayoutGrid, Binary, AlignJustify, ScanLine, Activity, Network, Layers } from "lucide-react";

// Bab 2 Import
import CaesarCanvas from "@/components/crypto/CaesarCanvas";
import VigenereCanvas from "@/components/crypto/VigenereCanvas";
import AffineCanvas from "@/components/crypto/AffineCanvas";
import PlayfairCanvas from "@/components/crypto/PlayfairCanvas";
import HillCanvas from "@/components/crypto/HillCanvas";
import VernamCanvas from "@/components/crypto/VernamCanvas";
import RowTransCanvas from "@/components/crypto/RowTransCanvas";
import RailFenceCanvas from "@/components/crypto/RailFenceCanvas";

// Bab 3 Import (Akan kita buat nanti)
import StreamVsBlockCanvas from "@/components/crypto/StreamVSBlockCanvas";
// import AvalancheCanvas from "@/components/crypto/AvalancheCanvas";
// import FeistelCanvas from "@/components/crypto/FeistelCanvas";

type CryptoSimType = 
  | 'caesar' | 'affine' | 'vigenere' | 'playfair' | 'hill' | 'vernam' | 'rowtrans' | 'railfence' // Bab 2
  | 'streamvsblock' | 'avalanche' | 'feistel'; // Bab 3

export default function CryptoPlaygroundPage() {
  const [activeSim, setActiveSim] = useState<CryptoSimType>('caesar');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const renderCanvas = () => {
    switch(activeSim) {
      // Klasik
      case 'caesar': return <CaesarCanvas />;
      case 'affine': return <AffineCanvas />;
      case 'vigenere': return <VigenereCanvas />;
      case 'playfair': return <PlayfairCanvas />;
      case 'hill': return <HillCanvas />;
      case 'vernam': return <VernamCanvas />;
      case 'rowtrans': return <RowTransCanvas />;
      case 'railfence': return <RailFenceCanvas />;
      
      // Modern (Fallback sementara)
      case 'streamvsblock': return <StreamVsBlockCanvas />;
      case 'avalanche': return <div className="h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">Simulator Avalanche Effect sedang disiapkan...</div>;
      case 'feistel': return <div className="h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">Simulator Feistel Network sedang disiapkan...</div>;
      
      default: return <div className="text-white p-8">Simulasi belum tersedia.</div>;
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden">
      
      <header className="shrink-0 p-3 md:px-5 md:py-4 flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 gap-4">
        
        <div className="flex items-center gap-4 z-10 shrink-0 mb-2 xl:mb-0">
          <Link href="/crypto" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50 shrink-0">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Keluar</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mode Latihan Bebas</span>
            <span className="text-slate-200 text-sm md:text-base font-bold whitespace-nowrap">Kripto Playground</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
            className={`flex items-start gap-4 md:gap-6 overflow-x-auto beautiful-scrollbar pb-3 pt-1 px-2 mask-edges-right select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
             {/* KELOMPOK: KLASIK */}
             <div className="flex flex-col gap-2 shrink-0 border-r border-slate-700/50 pr-4 md:pr-6">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Klasik (Substitusi)</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'caesar'} onClick={() => setActiveSim('caesar')} icon={<ArrowRightLeft size={16}/>} label="Caesar" />
                 <TabButton active={activeSim === 'affine'} onClick={() => setActiveSim('affine')} icon={<Cpu size={16}/>} label="Affine" />
                 <TabButton active={activeSim === 'playfair'} onClick={() => setActiveSim('playfair')} icon={<Grid3x3 size={16}/>} label="Playfair" />
                 <TabButton active={activeSim === 'hill'} onClick={() => setActiveSim('hill')} icon={<LayoutGrid size={16}/>} label="Hill" />
                 <TabButton active={activeSim === 'vigenere'} onClick={() => setActiveSim('vigenere')} icon={<KeyRound size={16}/>} label="Vigenère" />
                 <TabButton active={activeSim === 'vernam'} onClick={() => setActiveSim('vernam')} icon={<Binary size={16}/>} label="Vernam" />
               </div>
             </div>
             
             <div className="flex flex-col gap-2 shrink-0 border-r border-slate-700/50 pr-4 md:pr-6">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Klasik (Transposisi)</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'rowtrans'} onClick={() => setActiveSim('rowtrans')} icon={<AlignJustify size={16}/>} label="Row Transposition" />
                 <TabButton active={activeSim === 'railfence'} onClick={() => setActiveSim('railfence')} icon={<ScanLine size={16}/>} label="Rail Fence" />
               </div>
             </div>

             {/* KELOMPOK: MODERN */}
             <div className="flex flex-col gap-2 shrink-0 pr-12">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Kriptografi Modern</span>
               <div className="flex gap-2 pointer-events-auto">
                 <TabButton active={activeSim === 'streamvsblock'} onClick={() => setActiveSim('streamvsblock')} icon={<Activity size={16}/>} label="Stream vs Block" isModern />
                 <TabButton active={activeSim === 'avalanche'} onClick={() => setActiveSim('avalanche')} icon={<Network size={16}/>} label="Avalanche Effect" isModern />
                 <TabButton active={activeSim === 'feistel'} onClick={() => setActiveSim('feistel')} icon={<Layers size={16}/>} label="Feistel Cipher" isModern />
               </div>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-slate-900/40 p-2 md:p-4">
         <div className="w-full h-full max-w-[1600px] mx-auto bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4">
            {renderCanvas()}
         </div>
      </div>
      
      <style jsx global>{`
        .mask-edges-right { mask-image: linear-gradient(to right, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, black 90%, transparent); }
        .beautiful-scrollbar::-webkit-scrollbar { height: 6px; }
        .beautiful-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 8px; }
        .beautiful-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 8px; }
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.8); }
      `}</style>
    </main>
  );
}

function TabButton({ active, onClick, icon, label, isModern = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isModern?: boolean }) {
  // Beri warna khusus (indigo) jika ini adalah tab algoritma modern
  const modernActive = 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30';
  const modernInactive = 'bg-slate-900 text-indigo-300 border-indigo-900/50 hover:bg-slate-800 hover:text-indigo-200';
  
  const classicActive = 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
  const classicInactive = 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300';

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }} 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${active ? (isModern ? modernActive : classicActive) : (isModern ? modernInactive : classicInactive)}`}
    >
      {icon} {label}
    </button>
  );
}