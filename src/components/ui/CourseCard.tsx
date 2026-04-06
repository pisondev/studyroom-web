import Link from 'next/link';
import { ReactNode } from 'react';

interface CourseCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  progress?: number;
  isChapter?: boolean;
}

export default function CourseCard({ href, icon, title, description, progress, isChapter = false }: CourseCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className={`bg-slate-800/40 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex ${isChapter ? 'items-center gap-6' : 'flex-col h-full'}`}>
        
        {/* Dekorasi Glow untuk Non-Chapter */}
        {!isChapter && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        )}

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-indigo-400 group-hover:scale-110 transition-transform ${isChapter ? 'bg-slate-900' : 'bg-slate-900 mb-6'}`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h2 className={`${isChapter ? 'text-lg' : 'text-xl'} font-bold text-slate-100 mb-2`}>{title}</h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</p>
          
          {progress !== undefined && (
            <div className="mt-auto">
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{progress}% Selesai</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}