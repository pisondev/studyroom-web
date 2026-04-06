"use client";
import Link from 'next/link';
import { PlayCircle, Database, Network, ArrowLeft, Play, ShieldAlert } from 'lucide-react';
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

    // Hitung progress masing-masing bab
    const newProgress: Record<string, number> = {};
    courseData.forEach(chapter => {
      const maxPageReached = parseInt(localStorage.getItem(`ml_progress_${chapter.id}`) || '-1');
      // Jika belum pernah buka, -1. Jika buka slide 1 (index 0), berarti 1 slide dibaca.
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

  if (!isMounted) return null; // Mencegah kedipan UI saat load localstorage

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
            
            {/* Tombol Lanjutkan Belajar (Pintar) */}
            {lastChapter && (
              <Link href={`/ml/learn/${lastChapter}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                <Play size={18} /> Lanjutkan Bab {lastChapter}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {chapters.map((cap) => (
            <CourseCard 
              key={cap.id}
              isChapter={true}
              href={cap.href}
              icon={cap.icon}
              title={`Bab ${cap.id}: ${cap.title}`}
              description={cap.desc}
              progress={progressData[cap.id] || 0} // Injeksi progress ke card
            />
          ))}
        </div>
      </div>
    </main>
  );
}