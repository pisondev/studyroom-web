"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Combine, Radar, BarChart2 } from "lucide-react";
import KMeansCanvas from "@/components/canvas/KMeansCanvas";
import HierarchicalCanvas from "@/components/canvas/HierarchicalCanvas";
import DBSCANCanvas from "@/components/canvas/DBSCANCanvas";
import SilhouetteCanvas from "@/components/canvas/SilhouetteCanvas";

// Tambahkan 'silhouette' ke dalam tipe simulasi
type SimType = 'kmeans' | 'hierarchical' | 'dbscan' | 'silhouette';

export default function PlaygroundPage() {
  const [activeSim, setActiveSim] = useState<SimType>('kmeans');

  const renderCanvas = () => {
    switch(activeSim) {
      case 'kmeans': return <KMeansCanvas />;
      case 'hierarchical': return <HierarchicalCanvas />;
      case 'dbscan': return <DBSCANCanvas />;
      case 'silhouette': return <SilhouetteCanvas />;
      default: return null;
    }
  };

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden">
      
      {/* Header Playground */}
      <header className="shrink-0 p-3 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 gap-4">
        
        {/* Kiri: Tombol Keluar + Judul */}
        <div className="flex items-center gap-4 z-10 w-full sm:w-1/4">
          <Link href="/ml" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Keluar</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mode Latihan Bebas</span>
            <span className="text-slate-200 text-sm md:text-base font-bold whitespace-nowrap">Playground ML</span>
          </div>
        </div>

        {/* Tengah/Kanan: Menu Tab Algoritma (Scrollable horizontal di mobile) */}
        <div className="flex justify-start sm:justify-end gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-3/4">
           <button 
             onClick={() => setActiveSim('kmeans')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'kmeans' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
           >
             <Target size={16}/> K-Means
           </button>
           <button 
             onClick={() => setActiveSim('hierarchical')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'hierarchical' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
           >
             <Combine size={16}/> Hierarchical
           </button>
           <button 
             onClick={() => setActiveSim('dbscan')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'dbscan' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
           >
             <Radar size={16}/> DBSCAN
           </button>
           <button 
             onClick={() => setActiveSim('silhouette')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${activeSim === 'silhouette' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
           >
             <BarChart2 size={16}/> Validasi (Silhouette)
           </button>
        </div>
      </header>

      {/* Konten Utama Canvas */}
      <div className="flex-1 overflow-hidden bg-slate-900/40 p-2 md:p-4">
         <div className="w-full h-full max-w-[1600px] mx-auto bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4">
            {renderCanvas()}
         </div>
      </div>

    </main>
  );
}