"use client";
import { BookOpen, Code2, Network, ShieldCheck } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { useEffect, useState } from 'react';
import { courseData } from '@/data/chapters';
import { basotCourseData } from '@/data/basotChapters';
import { cryptoCourseData } from '@/data/cryptoChapters'; // Pastikan file ini dibuat berdasarkan data bab 2 yang kamu kirim

export default function Dashboard() {
  const [mlProgress, setMlProgress] = useState(0);
  const [basotProgress, setBasotProgress] = useState(0);
  const [cryptoProgress, setCryptoProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Hitung Progress ML
    let mlCompleted = 0, mlTotal = 0;
    courseData.forEach(chapter => {
      mlTotal += chapter.slides.length;
      const maxPage = parseInt(localStorage.getItem(`ml_progress_${chapter.id}`) || '-1');
      mlCompleted += (maxPage + 1);
    });
    if (mlTotal > 0) setMlProgress(Math.round((mlCompleted / mlTotal) * 100));

    // Hitung Progress Basot
    let basotCompleted = 0, basotTotal = 0;
    basotCourseData.forEach(chapter => {
      basotTotal += chapter.slides.length;
      const maxPage = parseInt(localStorage.getItem(`basot_progress_${chapter.id}`) || '-1');
      basotCompleted += (maxPage + 1);
    });
    if (basotTotal > 0) setBasotProgress(Math.round((basotCompleted / basotTotal) * 100));

    // Hitung Progress Crypto
    let cryptoCompleted = 0, cryptoTotal = 0;
    if (typeof cryptoCourseData !== 'undefined') {
      cryptoCourseData.forEach(chapter => {
        cryptoTotal += chapter.slides.length;
        const maxPage = parseInt(localStorage.getItem(`crypto_progress_${chapter.id}`) || '-1');
        cryptoCompleted += (maxPage + 1);
      });
      if (cryptoTotal > 0) setCryptoProgress(Math.round((cryptoCompleted / cryptoTotal) * 100));
    }

  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#0b1120] p-6 md:p-16">
      <header className="mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-3 tracking-tight">Studio Belajar</h1>
        <p className="text-slate-400 text-lg">Kelola progres belajarmu hari ini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <CourseCard 
          href="/ml" icon={<Network size={24} />} 
          title="Machine Learning" 
          description="Konsep dasar, eksplorasi data, dan algoritma clustering (K-Means & DBSCAN)." 
          progress={mlProgress} 
        />
        <CourseCard 
          href="/basot" icon={<BookOpen size={24} />} 
          title="Bahasa & Automata" 
          description="Logika State Machine, Regex, Pumping Lemma, dan Grammar Parser." 
          progress={basotProgress} 
        />
        <CourseCard 
          href="/crypto" icon={<ShieldCheck size={24} />} 
          title="Kriptografi & Keamanan" 
          description="Sandi Klasik, DES, AES, dan Aritmetika Modular untuk UTS." 
          progress={cryptoProgress} 
        />
      </div>
    </main>
  );
}