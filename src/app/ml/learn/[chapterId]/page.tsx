"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Bookmark, FastForward } from "lucide-react";

import KMeansCanvas from "@/components/canvas/KMeansCanvas";
import DataTypesInteractive from "@/components/canvas/DataTypesInteractive";
import HierarchicalCanvas from "@/components/canvas/HierarchicalCanvas";
import DBSCANCanvas from "@/components/canvas/DBSCANCanvas";
import { courseData, getIcon } from "@/data/chapters";

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 100 : -100, opacity: 0 }),
};

export default function InteractiveLearn() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params.chapterId as string;
  
  const chapterIndex = courseData.findIndex(c => c.id === chapterId);
  const currentChapter = courseData[chapterIndex];
  const slides = currentChapter?.slides || []; // Fallback aman
  
  // 1. Semua State
  const [[page, direction], setPage] = useState([0, 0]);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Effect: Mount & Load Progress
  useEffect(() => {
    setIsMounted(true);
    if (!currentChapter) return;
    
    const savedProgress = localStorage.getItem(`ml_resume_${chapterId}`);
    if (savedProgress) {
      const savedPage = parseInt(savedProgress, 10);
      if (!isNaN(savedPage) && savedPage >= 0 && savedPage < currentChapter.slides.length) {
        setPage([savedPage, 0]);
      }
    }
  }, [chapterId, currentChapter]);

  // 3. Effect: Save Progress
  useEffect(() => {
    if (isMounted && currentChapter) {
      localStorage.setItem('ml_last_chapter', chapterId); 
      localStorage.setItem(`ml_resume_${chapterId}`, page.toString());
      
      const currentMax = parseInt(localStorage.getItem(`ml_progress_${chapterId}`) || '0');
      if (page > currentMax) {
        localStorage.setItem(`ml_progress_${chapterId}`, page.toString());
      }
    }
  }, [page, chapterId, isMounted, currentChapter]);

  const isLastSlide = page === slides.length - 1;
  const hasNextChapter = chapterIndex < courseData.length - 1;

  // 4. Logika Navigasi (Dibungkus useCallback agar aman dimasukkan ke dependencies useEffect)
  const paginate = useCallback((newDirection: number) => {
    if (!currentChapter) return;
    
    const newPage = page + newDirection;
    
    // Logika Mundur
    if (newPage < 0) { 
      if (chapterIndex > 0) router.push(`/ml/learn/${courseData[chapterIndex - 1].id}`); 
      return; 
    }
    
    // Logika Maju
    if (newPage >= slides.length) {
      if (hasNextChapter) router.push(`/ml/learn/${courseData[chapterIndex + 1].id}`);
      else router.push('/ml');
      return;
    }
    
    setPage([newPage, newDirection]);
  }, [page, chapterIndex, currentChapter, slides.length, hasNextChapter, router]);

  const jumpToSummary = () => setPage([slides.length - 1, 1]);

  // 5. Effect: Keyboard Listener (Semua Hook SELESAI di baris ini)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);


  // === EARLY RETURNS (Aman diletakkan di sini karena semua Hooks sudah dipanggil) ===
  if (!currentChapter) return <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-slate-300 font-medium">Bab tidak ditemukan.</div>;
  if (!isMounted) return null;

  // Variabel untuk render
  const currentSlide = slides[page];
  const isCanvasMode = currentSlide?.isCanvas;

  return (
    <main className="h-screen bg-[#0b1120] text-slate-100 flex flex-col overflow-hidden">
      
      {/* Header Baru (Sejajar Kiri & Absolute Center) */}
      <header className="shrink-0 p-3 md:p-5 flex items-center justify-between border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 relative h-[70px]">
        
        {/* Kiri: Tombol Keluar + Judul */}
        <div className="flex items-center gap-4 z-10 w-1/3">
          <Link href="/ml" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
            <ArrowLeft size={16} /> <span className="hidden md:inline">Keluar</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm md:text-base font-bold whitespace-nowrap border-l border-slate-700/50 pl-4">
            <Bookmark size={16} className="text-indigo-400" />
            Bab {chapterId}: {currentChapter.title}
          </div>
        </div>

        {/* Tengah (Absolute Center): Garis Penanda */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-1.5 justify-center z-0 w-1/3 pointer-events-none">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === page ? "w-8 bg-indigo-500 shadow-[0_0_10px_#6366f1]" : idx < page ? "w-4 bg-indigo-900" : "w-4 bg-slate-700"}`} />
          ))}
        </div>
        
        {/* Kanan: Rangkuman */}
        <div className="flex items-center justify-end z-10 w-1/3">
          {!isLastSlide && (
            <button onClick={jumpToSummary} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30">
              <span className="hidden md:inline">Rangkuman</span> <FastForward size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Konten Utama */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col items-center ${isCanvasMode ? 'p-2 md:p-4' : 'p-4 md:p-8'}`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className={`w-full my-auto pb-8 md:pb-0 ${isCanvasMode ? 'max-w-7xl h-[calc(100vh-140px)] flex flex-col' : 'max-w-3xl'}`} 
          >
            <div className={`bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl flex flex-col ${isCanvasMode ? 'p-4 h-full' : 'p-6 md:p-12'}`}>
              
              {!isCanvasMode && (
                <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-inner shadow-indigo-500/10 shrink-0">
                  {getIcon(currentSlide.iconName)}
                </div>
              )}
              
              {!isCanvasMode && (
                <>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-4 md:mb-6 text-white leading-tight tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                    {currentSlide.content}
                  </p>
                </>
              )}
              
              {/* Canvas Renderer */}
              <div className={isCanvasMode ? "flex-1 h-full" : "mt-8"}>
                {currentSlide.isCanvas && currentSlide.canvasType === "datatypes" && <DataTypesInteractive />}
                {currentSlide.isCanvas && currentSlide.canvasType === "kmeans" && <KMeansCanvas />}
                {currentSlide.isCanvas && currentSlide.canvasType === "hierarchical" && <HierarchicalCanvas />}
                {currentSlide.isCanvas && currentSlide.canvasType === "dbscan" && <DBSCANCanvas />}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 md:p-4 flex justify-between items-center border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => paginate(-1)} className="px-5 py-3 bg-slate-800 rounded-xl disabled:opacity-50 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 flex items-center gap-2 font-medium text-sm md:text-base">
          <ArrowLeft size={18} /> <span className="hidden sm:inline">{page === 0 ? "Bab Sebelumnya" : "Kembali"}</span>
        </button>
        <button onClick={() => paginate(1)} className="px-5 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 active:scale-95 transition-all text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 font-bold text-sm md:text-base">
          {isLastSlide ? (hasNextChapter ? "Bab Berikutnya" : "Selesai") : "Langkah Berikutnya"} {isLastSlide && !hasNextChapter ? <CheckCircle2 size={18}/> : <ArrowRight size={18} />}
        </button>
      </div>
    </main>
  );
}