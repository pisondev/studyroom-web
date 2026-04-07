"use client";
import Link from 'next/link';
import { PlayCircle, Database, Network, ArrowLeft, Play, ShieldAlert, Gamepad2, ArrowRight } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { useEffect, useState } from 'react';
import { courseData } from '@/data/chapters';

export default function MachineLearningCourse() {
  const [lastChapter, setLastChapter] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedChapter = localStorage.getItem('ml_last_chapter');
    if (savedChapter) setLastChapter(savedChapter);

    const newProgress: Record<string, number> = {};
    courseData.forEach(chapter => {
      const maxPageReached = parseInt(localStorage.getItem(`ml_progress_${chapter.id}`) || '-1');
      const slidesCompleted = maxPageReached + 1; 
      const percentage = Math.round((slidesCompleted / chapter.slides.length) * 100);
      newProgress[chapter.id] = percentage;
    });
    setProgressData(newProgress);
  }, []);

  const chapters = [
    { id: "1", title: "Pengantar & Sejarah ML", icon: <PlayCircle size={20}/>, desc: "Evolusi Supervised, Unsupervised, dan Reinforcement Learning.", href: "/ml/learn/1" },
    { id: "2", title: "Eksplorasi Data", icon: <Database size={20}/>, desc: "Prinsip GIGO dan Tipe Data (Nominal, Ordinal, Ratio).", href: "/ml/learn/2" },
    { id: "3", title: "Clustering Part 1", icon: <Network size={20}/>, desc: "Struktur data matriks dan algoritma Partitioning.", href: "/ml/learn/3" },
    { id: "4", title: "Clustering Part 2", icon: <ShieldAlert size={20}/>, desc: "Kelemahan K-Means dan algoritma Density-Based (DBSCAN).", href: "/ml/learn/4" },
  ];

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
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-3 tracking-tight">Machine Learning</h1>
              <p className="text-slate-400 text-lg">Pahami logika mesin sebelum UTS dimulai.</p>
            </div>
            
            {lastChapter && (
              <Link href={`/ml/learn/${lastChapter}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                <Play size={18} /> Lanjutkan Bab {lastChapter}
              </Link>
            )}
          </div>
        </div>

        {/* --- TAMBAHAN KOTAK PLAYGROUND --- */}
        <div className="mb-8">
           <Link href="/ml/playground" className="block p-6 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 rounded-2xl hover:border-indigo-500/60 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
               <Gamepad2 size={100} className="text-indigo-400" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Zona Bebas</span>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-100 mb-1">Playground Simulasi Ujian</h2>
                   <p className="text-slate-400">Pilih algoritma, atur koordinat sesuka hati, dan cocokkan hasil hitungan corat-coretmu!</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <ArrowRight size={24} />
                </div>
             </div>
           </Link>
        </div>

        <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Materi Pembelajaran</h3>
        <div className="flex flex-col gap-4">
          {chapters.map((cap) => (
            <CourseCard 
              key={cap.id}
              isChapter={true}
              href={cap.href}
              icon={cap.icon}
              title={`Bab ${cap.id}: ${cap.title}`}
              description={cap.desc}
              progress={progressData[cap.id] || 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}