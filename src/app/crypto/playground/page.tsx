"use client";
import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ArrowRightLeft, Cpu, Grid3x3, LayoutGrid, Binary, AlignJustify, ScanLine, Activity, Network, Layers, DivideCircle, Sigma, FolderOpen } from "lucide-react";

// Bab 2 Import
import CaesarCanvas from "@/components/crypto/CaesarCanvas";
import VigenereCanvas from "@/components/crypto/VigenereCanvas";
import AffineCanvas from "@/components/crypto/AffineCanvas";
import PlayfairCanvas from "@/components/crypto/PlayfairCanvas";
import HillCanvas from "@/components/crypto/HillCanvas";
import VernamCanvas from "@/components/crypto/VernamCanvas";
import RowTransCanvas from "@/components/crypto/RowTransCanvas";
import RailFenceCanvas from "@/components/crypto/RailFenceCanvas";

// Bab 3 Import
import StreamVSBlockCanvas from "@/components/crypto/StreamVSBlockCanvas"; // <-- Diperbaiki Typo-nya!
// import AvalancheCanvas from "@/components/crypto/AvalancheCanvas"; // Menyusul
import FeistelCanvas from "@/components/crypto/FeistelCanvas";

// Bab 4-6 Import (Placeholder)
import DesSBoxCanvas from "@/components/crypto/DesSBoxCanvas";
import AvalancheCanvas from "@/components/crypto/AvalancheCanvas";
// import EuclideanCanvas from "@/components/crypto/EuclideanCanvas";
// import GF28MathCanvas from "@/components/crypto/GF28MathCanvas";
// import AesStateCanvas from "@/components/crypto/AesStateCanvas";

type CryptoSimType = 
  | 'caesar' | 'affine' | 'vigenere' | 'playfair' | 'hill' | 'vernam' | 'rowtrans' | 'railfence'
  | 'streamvsblock' | 'avalanche' | 'feistel'
  | 'dessbox' | 'euclidean' | 'gf28math' | 'aesstate';

type ChapterType = 'bab2' | 'bab3' | 'bab456';

export default function CryptoPlaygroundPage() {
  const [activeChapter, setActiveChapter] = useState<ChapterType>('bab2');
  const [activeSim, setActiveSim] = useState<CryptoSimType>('caesar');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // --- KONTROL RENDER CANVAS ---
  const renderCanvas = () => {
    switch(activeSim) {
      // BAB 2
      case 'caesar': return <CaesarCanvas />;
      case 'affine': return <AffineCanvas />;
      case 'vigenere': return <VigenereCanvas />;
      case 'playfair': return <PlayfairCanvas />;
      case 'hill': return <HillCanvas />;
      case 'vernam': return <VernamCanvas />;
      case 'rowtrans': return <RowTransCanvas />;
      case 'railfence': return <RailFenceCanvas />;
      
      // BAB 3
      case 'streamvsblock': return <StreamVSBlockCanvas />;
      case 'avalanche': return <AvalancheCanvas/>;
      case 'feistel': return <FeistelCanvas />;
      
      // BAB 4-6
      case 'dessbox': return <DesSBoxCanvas />;
      case 'euclidean': return <div className="h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">Simulator Algoritma Euclid sedang disiapkan...</div>;
      case 'gf28math': return <div className="h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">Simulator GF(2⁸) Math sedang disiapkan...</div>;
      case 'aesstate': return <div className="h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">Simulator AES State sedang disiapkan...</div>;
      
      default: return <div className="text-white p-8">Simulasi belum tersedia.</div>;
    }
  };

  // --- LOGIKA PERUBAHAN BAB ---
  const handleChapterChange = (chapter: ChapterType) => {
    setActiveChapter(chapter);
    // Auto-switch ke simulasi pertama di bab tersebut agar tampilan sinkron
    if (chapter === 'bab2') setActiveSim('caesar');
    if (chapter === 'bab3') setActiveSim('streamvsblock');
    if (chapter === 'bab456') setActiveSim('dessbox');
  };

  // --- LOGIKA DRAG-TO-SCROLL ANTI SELEKSI ---
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
    
    // MENCEGAH TEKS TER-BLOCK/TERSELEKSI SAAT MOUSE DI-DRAG KANAN KIRI
    window.getSelection()?.removeAllRanges();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2.5; // Angka 2.5 mengatur sensitivitas geseran
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* ========================================================= */}
      {/* HEADER PLAYGROUND: NAVIGASI 2 TINGKAT                       */}
      {/* ========================================================= */}
      <header className="shrink-0 p-3 md:px-5 md:py-4 flex flex-col xl:flex-row justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 gap-4 xl:gap-8">
        
        {/* BAGIAN KIRI: Info & Back Button */}
        <div className="flex items-center gap-4 z-10 shrink-0 mb-1 xl:mb-0">
          <Link href="/crypto" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-700/50 shrink-0 shadow-sm hover:bg-slate-700">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Keluar</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mode Latihan Bebas</span>
            <span className="text-slate-200 text-base md:text-lg font-black whitespace-nowrap">Kripto Playground</span>
          </div>
        </div>

        {/* BAGIAN KANAN: Navigasi Menu */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
          
          {/* TINGKAT 1: TAB PILIHAN BAB */}
          <div className="flex gap-2.5 overflow-x-auto beautiful-scrollbar pb-2 mask-edges-right border-b border-slate-800/50">
            <ChapterButton 
              active={activeChapter === 'bab2'} onClick={() => handleChapterChange('bab2')}
              label="Bab 2: Kriptografi Klasik" icon={<FolderOpen size={14} />} 
            />
            <ChapterButton 
              active={activeChapter === 'bab3'} onClick={() => handleChapterChange('bab3')}
              label="Bab 3: Simetris Dasar" icon={<FolderOpen size={14} />} 
            />
            <ChapterButton 
              active={activeChapter === 'bab456'} onClick={() => handleChapterChange('bab456')}
              label="Bab 4-6: Standar Modern & Math" icon={<FolderOpen size={14} />} 
            />
          </div>

          {/* TINGKAT 2: TAB SIMULASI (Berdasarkan Bab yang dipilih) */}
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
            className={`flex items-start gap-4 md:gap-6 overflow-x-auto beautiful-scrollbar pb-3 pt-1 px-1 mask-edges-right ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
             {activeChapter === 'bab2' && (
               <>
                 <div className="flex flex-col gap-2 shrink-0 border-r border-slate-700/50 pr-4 md:pr-6">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Klasik (Monoalphabetic)</span>
                   <div className="flex gap-2 pointer-events-auto">
                     <TabButton active={activeSim === 'caesar'} onClick={() => setActiveSim('caesar')} icon={<ArrowRightLeft size={16}/>} label="Caesar" />
                     <TabButton active={activeSim === 'affine'} onClick={() => setActiveSim('affine')} icon={<Cpu size={16}/>} label="Affine" />
                   </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 shrink-0 border-r border-slate-700/50 pr-4 md:pr-6">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Klasik (Polyalphabetic)</span>
                   <div className="flex gap-2 pointer-events-auto">
                     <TabButton active={activeSim === 'playfair'} onClick={() => setActiveSim('playfair')} icon={<Grid3x3 size={16}/>} label="Playfair" />
                     <TabButton active={activeSim === 'hill'} onClick={() => setActiveSim('hill')} icon={<LayoutGrid size={16}/>} label="Hill" />
                     <TabButton active={activeSim === 'vigenere'} onClick={() => setActiveSim('vigenere')} icon={<KeyRound size={16}/>} label="Vigenère" />
                     <TabButton active={activeSim === 'vernam'} onClick={() => setActiveSim('vernam')} icon={<Binary size={16}/>} label="Vernam / OTP" />
                   </div>
                 </div>

                 <div className="flex flex-col gap-2 shrink-0 pr-12">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Klasik (Transposisi)</span>
                   <div className="flex gap-2 pointer-events-auto">
                     <TabButton active={activeSim === 'rowtrans'} onClick={() => setActiveSim('rowtrans')} icon={<AlignJustify size={16}/>} label="Row Transposition" />
                     <TabButton active={activeSim === 'railfence'} onClick={() => setActiveSim('railfence')} icon={<ScanLine size={16}/>} label="Rail Fence" />
                   </div>
                 </div>
               </>
             )}

             {activeChapter === 'bab3' && (
               <div className="flex flex-col gap-2 shrink-0 pr-12">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Kriptografi Simetris Modern</span>
                 <div className="flex gap-2 pointer-events-auto">
                   <TabButton active={activeSim === 'streamvsblock'} onClick={() => setActiveSim('streamvsblock')} icon={<Activity size={16}/>} label="Stream vs Block" isModern />
                   <TabButton active={activeSim === 'avalanche'} onClick={() => setActiveSim('avalanche')} icon={<Network size={16}/>} label="Avalanche Effect" isModern />
                   <TabButton active={activeSim === 'feistel'} onClick={() => setActiveSim('feistel')} icon={<Layers size={16}/>} label="Feistel Cipher" isModern />
                 </div>
               </div>
             )}

             {activeChapter === 'bab456' && (
               <div className="flex flex-col gap-2 shrink-0 pr-12">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-1">DES, AES & Finite Fields GF(2⁸)</span>
                 <div className="flex gap-2 pointer-events-auto">
                   <TabButton active={activeSim === 'dessbox'} onClick={() => setActiveSim('dessbox')} icon={<LayoutGrid size={16}/>} label="DES S-Box" isModern />
                   <TabButton active={activeSim === 'euclidean'} onClick={() => setActiveSim('euclidean')} icon={<DivideCircle size={16}/>} label="Algoritma Euclid" isModern />
                   <TabButton active={activeSim === 'gf28math'} onClick={() => setActiveSim('gf28math')} icon={<Sigma size={16}/>} label="GF(2⁸) Math" isModern />
                   <TabButton active={activeSim === 'aesstate'} onClick={() => setActiveSim('aesstate')} icon={<Grid3x3 size={16}/>} label="AES State" isModern />
                 </div>
               </div>
             )}
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* CANVAS AREA                                               */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-hidden bg-slate-900/40 p-2 md:p-4">
         <div className="w-full h-full max-w-[1600px] mx-auto bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4">
            {renderCanvas()}
         </div>
      </div>
      
      {/* Global Styles */}
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

// --- HELPER COMPONENTS ---

function ChapterButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-t-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all border-b-2 shrink-0 ${active ? 'bg-slate-800/60 text-white border-indigo-500' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'}`}
    >
      {icon} {label}
    </button>
  );
}

function TabButton({ active, onClick, icon, label, isModern = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isModern?: boolean }) {
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