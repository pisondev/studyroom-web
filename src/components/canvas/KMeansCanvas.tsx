"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Shuffle, Target, Settings2, ArrowRight, TerminalSquare, Calculator, Eye, GripHorizontal } from 'lucide-react';

type Point = { x: number; y: number; cluster?: number };
type Centroid = { x: number; y: number; color: string; isMedoid?: boolean; pointIndex?: number };
type Step = 'idle' | 'assign' | 'update' | 'converged';
type Algorithm = 'kmeans' | 'kmedoids';
type ViewMode = 'calc' | 'visual';
type DataPattern = 'clusters' | 'random' | 'donut' | 'smiley';
type LogEntry = { title: string; desc: string; isMath?: boolean };

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function KMeansCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [step, setStep] = useState<Step>('idle');
  const [algo, setAlgo] = useState<Algorithm>('kmeans');
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [pattern, setPattern] = useState<DataPattern>('clusters');
  
  const [k, setK] = useState(3);
  const [numPoints, setNumPoints] = useState(60);
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Auto-scroll logic (hanya log yang terscroll)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const generateData = useCallback(() => {
    const newPoints: Point[] = [];
    const width = 600; const height = 400; 
    // Jika Mode Kalkulator, batasi maksimal 15 data agar hitungan visual tidak menumpuk
    const actualPoints = viewMode === 'calc' ? Math.min(numPoints, 15) : numPoints;

    if (pattern === 'random') {
      for (let i = 0; i < actualPoints; i++) newPoints.push({ x: Math.random() * (width-40) + 20, y: Math.random() * (height-40) + 20 });
    } else if (pattern === 'donut') {
      const cx = width/2; const cy = height/2;
      for (let i = 0; i < actualPoints; i++) {
        const isInner = i % 3 === 0;
        const angle = Math.random() * Math.PI * 2;
        const radius = isInner ? Math.random() * 40 : 100 + Math.random() * 30;
        newPoints.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
      }
    } else if (pattern === 'smiley') {
      const cx = width/2; const cy = height/2;
      for (let i = 0; i < actualPoints; i++) {
        if (i % 4 === 0) newPoints.push({ x: cx - 60 + (Math.random()-0.5)*30, y: cy - 40 + (Math.random()-0.5)*30 }); // Mata kiri
        else if (i % 4 === 1) newPoints.push({ x: cx + 60 + (Math.random()-0.5)*30, y: cy - 40 + (Math.random()-0.5)*30 }); // Mata kanan
        else {
          const angle = Math.random() * Math.PI; // Senyum (setengah lingkaran bawah)
          const r = 90 + Math.random()*15;
          newPoints.push({ x: cx + Math.cos(angle)*r, y: cy + 20 + Math.sin(angle)*r });
        }
      }
    } else {
      // Default Clusters
      for (let i = 0; i < k; i++) {
        const cx = Math.random() * (width - 150) + 75; const cy = Math.random() * (height - 150) + 75;
        const pointsPerCluster = Math.floor(actualPoints / k);
        for (let j = 0; j < pointsPerCluster; j++) newPoints.push({ x: cx + (Math.random() - 0.5) * 100, y: cy + (Math.random() - 0.5) * 100 });
      }
    }
    setPoints(newPoints); resetState();
  }, [k, numPoints, viewMode, pattern]);

  useEffect(() => { generateData(); }, [generateData]);

  const resetState = () => { setCentroids([]); setStep('idle'); setIteration(0); setLogs([]); setPoints(prev => prev.map(p => ({ ...p, cluster: undefined }))); };
  const addOutlier = () => { setPoints(prev => [...prev, { x: 580, y: 20 }]); resetState(); };

  const handleNextStep = () => {
    if (step === 'idle' || step === 'converged') {
      const shuffled = [...points].sort(() => 0.5 - Math.random());
      const newCentroids = shuffled.slice(0, k).map((p, i) => ({ x: p.x, y: p.y, color: COLORS[i], isMedoid: algo === 'kmedoids', pointIndex: points.indexOf(p) }));
      setCentroids(newCentroids); setStep('assign'); setIteration(1);
      setLogs([{ title: "Sistem Dimulai", desc: "Menginisialisasi pusat kelompok acak berdasarkan koordinat data awal." }]);
    } else if (step === 'assign') {
      const newPoints = points.map(p => {
        let minDist = Infinity; let cluster = 0;
        centroids.forEach((c, i) => {
          const dist = Math.hypot(p.x - c.x, p.y - c.y);
          if (dist < minDist) { minDist = dist; cluster = i; }
        });
        return { ...p, cluster };
      });
      setPoints(newPoints); setStep('update');
      
      const mathLog = viewMode === 'calc' && points.length > 0 
        ? `Contoh titik A(${Math.round(points[0].x)}, ${Math.round(points[0].y)}) ke C1(${Math.round(centroids[0].x)}, ${Math.round(centroids[0].y)}) \n=> √((${Math.round(points[0].x)}-${Math.round(centroids[0].x)})² + (${Math.round(points[0].y)}-${Math.round(centroids[0].y)})²) = ${Math.round(Math.hypot(points[0].x - centroids[0].x, points[0].y - centroids[0].y))}`
        : `Menghitung jarak Euclidean ke seluruh centroid.`;
      setLogs(prev => [...prev, { title: `Iterasi ${iteration} - Pencocokan Jarak`, desc: mathLog, isMath: viewMode === 'calc' }]);
    } else if (step === 'update') {
      let moved = false;
      const newCentroids = centroids.map((c, i) => {
        const clusterPoints = points.filter(p => p.cluster === i);
        if (clusterPoints.length === 0) return c;
        let newX = c.x; let newY = c.y; let newMedoidIndex = c.pointIndex;

        if (algo === 'kmeans') {
          newX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
          newY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
        } else {
          let minTotalDist = Infinity;
          clusterPoints.forEach(candidate => {
            const totalDist = clusterPoints.reduce((sum, p) => sum + Math.hypot(p.x - candidate.x, p.y - candidate.y), 0);
            if (totalDist < minTotalDist) { minTotalDist = totalDist; newX = candidate.x; newY = candidate.y; newMedoidIndex = points.indexOf(candidate); }
          });
        }
        if (Math.abs(newX - c.x) > 0.1 || Math.abs(newY - c.y) > 0.1) moved = true;
        return { ...c, x: newX, y: newY, pointIndex: newMedoidIndex };
      });
      setCentroids(newCentroids);
      setLogs(prev => [...prev, { title: `Iterasi ${iteration} - Pergeseran Rata-rata`, desc: algo === 'kmeans' ? 'Pusat bergeser ke titik mean (rata-rata) X dan Y dari anggotanya.' : 'Pusat bergeser mencari titik data asli (Medoid) yang paling efisien.' }]);
      if (moved) { setIteration(prev => prev + 1); setStep('assign'); } 
      else { setStep('converged'); setLogs(prev => [...prev, { title: "Konvergensi Tercapai", desc: "Posisi pusat sudah stabil. Proses selesai." }]); }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 600; canvas.height = 400; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Grid Matematis Jika Mode Calc
    if (viewMode === 'calc') {
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for (let i = 0; i <= canvas.height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    }

    if (step === 'update' || step === 'converged') {
      ctx.lineWidth = 0.5;
      points.forEach(p => {
        if (p.cluster !== undefined && centroids[p.cluster]) {
          ctx.strokeStyle = centroids[p.cluster].color + '50';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(centroids[p.cluster].x, centroids[p.cluster].y); ctx.stroke();
        }
      });
    }

    points.forEach((p) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, viewMode === 'calc' ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = p.cluster !== undefined && step !== 'idle' ? centroids[p.cluster]?.color : '#64748b';
      if (p.x > 570 && p.y < 30) { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fill();
      
      // Teks Koordinat untuk Mode Kalkulator
      if (viewMode === 'calc') {
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
        ctx.fillText(`(${Math.round(p.x)},${Math.round(p.y)})`, p.x + 8, p.y + 4);
      }
    });

    centroids.forEach(c => {
      ctx.fillStyle = c.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath();
      if (algo === 'kmeans') { ctx.rect(c.x - 7, c.y - 7, 14, 14); } 
      else { ctx.moveTo(c.x, c.y - 10); ctx.lineTo(c.x + 10, c.y); ctx.lineTo(c.x, c.y + 10); ctx.lineTo(c.x - 10, c.y); }
      ctx.fill(); ctx.stroke();
      
      // Teks Koordinat Centroid
      if (viewMode === 'calc') {
        ctx.fillStyle = c.color; ctx.font = 'bold 11px monospace';
        ctx.fillText(`C(${Math.round(c.x)},${Math.round(c.y)})`, c.x - 20, c.y - 12);
      }
    });
  }, [points, centroids, step, algo, viewMode]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* KIRI: Visualisasi */}
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Settings2 size={18} className="text-indigo-400"/> Simulator K-Means
          </h3>
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => {setViewMode('visual'); generateData();}} className={`flex items-center gap-1 px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${viewMode === 'visual' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}><Eye size={12}/> Visual</button>
            <button onClick={() => {setViewMode('calc'); generateData();}} className={`flex items-center gap-1 px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${viewMode === 'calc' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}><Calculator size={12}/> Matematis</button>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-inner relative">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* KANAN: Terminal Panel - Perbaikan Fix Parameter, Scroll hanya di Log */}
      <div className="lg:w-2/5 h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden">
        
        {/* Terminal Header (Fix) */}
        <div className="bg-slate-800/80 p-2 flex items-center gap-2 border-b border-slate-700 shrink-0">
          <div className="flex gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
          <span className="text-slate-400 text-xs mx-auto flex items-center gap-2"><TerminalSquare size={14}/> execution_log.sh</span>
        </div>

        {/* Panel Kontrol (Fix di atas) */}
        <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <select value={algo} onChange={(e) => {setAlgo(e.target.value as Algorithm); resetState();}} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs p-2 rounded outline-none focus:border-indigo-500">
              <option value="kmeans">Algo: K-Means</option>
              <option value="kmedoids">Algo: K-Medoids</option>
            </select>
            <select value={pattern} onChange={(e) => {setPattern(e.target.value as DataPattern);}} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs p-2 rounded outline-none focus:border-indigo-500">
              <option value="clusters">Pola: Terkelompok</option>
              <option value="random">Pola: Acak (Random)</option>
              <option value="donut">Pola: Donat (Lingkaran)</option>
              <option value="smiley">Pola: Smiley Face</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-indigo-300 flex justify-between"><span>[VAR] K_CLUSTERS:</span> <span>{k}</span></label>
            <input type="range" min="2" max="5" value={k} onChange={(e) => {setK(Number(e.target.value)); resetState();}} className="accent-indigo-500" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-indigo-300 flex justify-between"><span>[VAR] DATA_POINTS:</span> <span>{viewMode === 'calc' ? 'Maks 15 (Mode Matematis)' : numPoints}</span></label>
            <input type="range" min="10" max="150" step="5" value={numPoints} onChange={(e) => {setNumPoints(Number(e.target.value)); resetState();}} disabled={viewMode === 'calc'} className="accent-indigo-500 disabled:opacity-50" />
          </div>

          <div className="flex gap-2 shrink-0 mt-2">
            <button onClick={resetState} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"><RotateCcw size={16} /></button>
            <button onClick={handleNextStep} disabled={step === 'converged'} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-400/50">
              {step === 'converged' ? 'FINISHED' : step === 'idle' ? 'START EXEC' : 'NEXT STEP()'} {!step.includes('converged') && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Terminal Logs (Hanya bagian ini yang SCROLL) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#090c15]">
          <div className="flex flex-col gap-3 pb-4">
            {logs.length === 0 && <span className="text-slate-600 text-xs">Waiting for execution command...</span>}
            {logs.map((log, index) => (
              <div key={index} className={`flex gap-3 text-xs ${index === logs.length - 1 ? 'text-indigo-300' : 'text-slate-500'} animate-in fade-in duration-300`}>
                <span className="text-emerald-500 shrink-0">~%</span>
                <div>
                  <span className="font-bold block mb-1">{log.title}</span>
                  <span className={`opacity-80 leading-relaxed ${log.isMath ? 'text-emerald-400 font-mono whitespace-pre-wrap block bg-slate-900 p-2 mt-1 rounded border border-slate-800' : ''}`}>{log.desc}</span>
                </div>
              </div>
            ))}
            <div ref={logContainerRef} /> {/* Anchor for auto-scroll */}
          </div>
        </div>

      </div>
    </div>
  );
}