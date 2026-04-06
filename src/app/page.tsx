"use client";
import { BookOpen, Code2 } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { useEffect, useState } from 'react';
import { courseData } from '@/data/chapters';

export default function Dashboard() {
  const [totalProgress, setTotalProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let totalCompletedSlides = 0;
    let totalSlidesAvailable = 0;

    courseData.forEach(chapter => {
      totalSlidesAvailable += chapter.slides.length;
      const maxPageReached = parseInt(localStorage.getItem(`ml_progress_${chapter.id}`) || '-1');
      totalCompletedSlides += (maxPageReached + 1);
    });

    if (totalSlidesAvailable > 0) {
      setTotalProgress(Math.round((totalCompletedSlides / totalSlidesAvailable) * 100));
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
          href="/ml" 
          icon={<BookOpen size={24} />} 
          title="Machine Learning" 
          description="Konsep dasar, eksplorasi data, dan algoritma clustering (K-Means & DBSCAN) untuk persiapan UTS." 
          progress={totalProgress} // Persentase Gabungan Real-time
        />
        <CourseCard 
          href="#" 
          icon={<Code2 size={24} />} 
          title="Pengembangan API" 
          description="Arsitektur Microservices menggunakan GoFiber dan PostgreSQL." 
          progress={0} 
        />
      </div>
    </main>
  );
}