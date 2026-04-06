"use client";
import Link from 'next/link';
import { Share2, Repeat, Type, ArrowLeft, Play, GitBranch } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { useEffect, useState } from 'react';
import { basotCourseData } from '@/data/basotChapters';

export default function BasotCourse() {
  const [lastChapter, setLastChapter] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedChapter = localStorage.getItem('basot_last_chapter');
    if (savedChapter) setLastChapter(savedChapter);

    const newProgress: Record<string, number> = {};
    basotCourseData.forEach(chapter => {
      const maxPageReached = parseInt(localStorage.getItem(`basot_progress_${chapter.id}`) || '-1');
      const slidesCompleted = maxPageReached + 1; 
      const percentage = Math.round((slidesCompleted / chapter.slides.length) * 100);
      newProgress[chapter.id] = percentage;
    });
    setProgressData(newProgress);
  }, []);

  const chapters = [
    { id: "1", title: "Finite State Automata", icon: <Share2 size={20}/>, desc: "Desain mesin logika DFA dan NFA untuk membaca string.", href: "/basot/learn/1" },
    { id: "2", title: "Transformasi Automata", icon: <Repeat size={20}/>, desc: "Algoritma Konstruksi Subset (NFA ke DFA).", href: "/basot/learn/2" },
    { id: "3", title: "Regex & Pumping Lemma", icon: <Type size={20}/>, desc: "Batas memori mesin dan pembuktian matematis kontradiksi.", href: "/basot/learn/3" },
    { id: "4", title: "Context-Free Grammar", icon: <GitBranch size={20}/>, desc: "Pohon Penurunan (Derivation Trees) dan Ambiguitas.", href: "/basot/learn/4" },
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
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-3 tracking-tight">Bahasa & Automata</h1>
              <p className="text-slate-400 text-lg">Eksplorasi batas komputasi dan manajemen state sebelum UTS.</p>
            </div>
            
            {lastChapter && (
              <Link href={`/basot/learn/${lastChapter}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
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
              progress={progressData[cap.id] || 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}