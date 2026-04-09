"use client";
import Link from 'next/link';
import { ArrowLeft, Play, ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { useEffect, useState } from 'react';
import { cryptoCourseData } from '@/data/cryptoChapters';
import { getIcon } from '@/data/chapters';

export default function CryptoCoursePage() {
  const [lastChapter, setLastChapter] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedChapter = localStorage.getItem('crypto_last_chapter');
    if (savedChapter) setLastChapter(savedChapter);

    const newProgress: Record<string, number> = {};
    cryptoCourseData.forEach(chapter => {
      const maxPageReached = parseInt(localStorage.getItem(`crypto_progress_${chapter.id}`) || '-1');
      const slidesCompleted = maxPageReached + 1; 
      const percentage = Math.round((slidesCompleted / chapter.slides.length) * 100);
      newProgress[chapter.id] = percentage;
    });
    setProgressData(newProgress);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#0b1120] p-6 md:p-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium mb-6">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-3 tracking-tight">Kriptografi & Keamanan</h1>
              <p className="text-slate-400 text-lg">Pahami alur enkripsi & dekripsi sebelum UTS dimulai.</p>
            </div>
            
            {lastChapter && (
              <Link href={`/crypto/learn/${lastChapter}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                <Play size={18} /> Lanjutkan Bab {lastChapter}
              </Link>
            )}
          </div>
        </div>

        {/* Kotak Playground Kriptografi */}
        <div className="mb-8">
           <Link href="/crypto/playground" className="block p-6 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 rounded-2xl hover:border-indigo-500/60 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
               <Gamepad2 size={100} className="text-indigo-400" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Zona Bebas</span>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-100 mb-1">Terminal Simulator Sandi</h2>
                   <p className="text-slate-400">Simulasikan Caesar, Vigenère, dan hitung penggeserannya secara interaktif.</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <ArrowRight size={24} />
                </div>
             </div>
           </Link>
        </div>

        <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Materi Pembelajaran</h3>
        <div className="flex flex-col gap-4">
          {cryptoCourseData.map((cap) => {
            // Ambil icon dari slide pertama sebagai representasi bab
            const firstSlideIcon = cap.slides[0]?.iconName || "ShieldCheck";
            return (
              <CourseCard 
                key={cap.id}
                isChapter={true}
                href={`/crypto/learn/${cap.id}`}
                icon={getIcon(firstSlideIcon)}
                title={`Bab ${cap.id}: ${cap.title}`}
                description={`${cap.slides.length} slide pembelajaran interaktif.`}
                progress={progressData[cap.id] || 0}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}