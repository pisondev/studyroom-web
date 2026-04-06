"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, Activity } from "lucide-react";
import KMeansCanvas from "@/components/canvas/KMeansCanvas";

// Konfigurasi Animasi Dinamis
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100, // Jika maju, datang dari kanan. Jika mundur, datang dari kiri.
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100, // Jika mundur, pergi ke kanan. Jika maju, pergi ke kiri.
    opacity: 0,
  }),
};

const slides = [
  { id: 1, type: "intro", title: "Evolusi Machine Learning", content: "Mesin tidak tiba-tiba menjadi pintar. Mari kita lihat sejarah bagaimana ilmuwan mengajari mesin berpikir, dari aturan kaku hingga eksplorasi mandiri.", icon: <BrainCircuit size={32} /> },
  { id: 2, type: "interactive", title: "Visualisasi K-Means", content: "Algoritma ini mengelompokkan data buta dengan mencari 'titik tengah' (Centroid). Coba jalankan kalkulasi di bawah ini.", icon: <Activity size={32} />, isCanvas: true }
];

export default function InteractiveLearn() {
  const [[page, direction], setPage] = useState([0, 0]);

  // Handler Navigasi
  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < slides.length) {
      setPage([newPage, newDirection]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page]);

  const currentSlide = slides[page];

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <Link href="/ml" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> <span className="hidden md:inline">Keluar Modul</span>
        </Link>
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === page ? "w-8 bg-indigo-500" : "w-4 bg-slate-700"}`} />
          ))}
        </div>
        <div className="text-slate-400 text-xs md:text-sm hidden sm:block">
          Navigasi: <kbd className="bg-slate-800 border border-slate-700 px-2 py-1 rounded mx-1">←</kbd> <kbd className="bg-slate-800 border border-slate-700 px-2 py-1 rounded">→</kbd>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="w-full max-w-3xl absolute"
          >
            <div className="bg-slate-800/40 p-6 md:p-12 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-inner shadow-indigo-500/10">
                {currentSlide.icon}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 md:mb-6 text-white leading-tight tracking-tight">
                {currentSlide.title}
              </h2>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-6 md:mb-8">
                {currentSlide.content}
              </p>
              
              {currentSlide.isCanvas && <KMeansCanvas />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Controls */}
      <div className="p-4 flex justify-between sm:hidden border-t border-slate-800/60 bg-slate-900/50 backdrop-blur-md z-10">
        <button onClick={() => paginate(-1)} disabled={page === 0} className="px-6 py-3 bg-slate-800 rounded-xl disabled:opacity-50 active:scale-95 transition-transform text-slate-300">
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => paginate(1)} disabled={page === slides.length - 1} className="px-6 py-3 bg-indigo-600 rounded-xl disabled:opacity-50 active:scale-95 transition-transform text-white shadow-lg shadow-indigo-500/20">
          <ArrowRight size={20} />
        </button>
      </div>
    </main>
  );
}