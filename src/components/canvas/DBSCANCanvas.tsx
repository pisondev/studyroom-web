"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Shuffle, Settings2, ArrowRight, TerminalSquare, Eye, Fingerprint } from 'lucide-react';

type PointType = 'core' | 'border' | 'noise' | 'unclassified';
type Point = { id: number; x: number; y: number; type: PointType; cluster?: number; neighbors: number[] };
type Step = 'idle' | 'scan' | 'cluster';
type DataPattern = 'donut' | 'smiley' | 'random';
type LogEntry = { title: string; desc: string };

const CLUSTER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DBSCANCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const [points, setPoints] = useState<Point[]>([]);
  const [step, setStep] = useState<Step>('idle');
  const [pattern, setPattern] = useState<DataPattern>('donut');
  
  const [eps, setEps] = useState(30);
  const [minPts, setMinPts] = useState(4);
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Auto-scroll untuk Terminal Logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const generateData = useCallback(() => {
    const newPoints: Point[] = [];
    const width = 600; const height = 400; 
    const cx = width / 2; const cy = height / 2;
    
    if (pattern === 'donut') {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2; const radius = 100 + Math.random() * 20;
        newPoints.push({ id: newPoints.length, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, type: 'unclassified', neighbors: [] });
      }
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2; const radius = Math.random() * 35;
        newPoints.push({ id: newPoints.length, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, type: 'unclassified', neighbors: [] });
      }
    } else if (pattern === 'smiley') {
      for (let i = 0; i < 100; i++) {
        if (i % 4 === 0) newPoints.push({ id: newPoints.length, x: cx - 60 + (Math.random()-0.5)*30, y: cy - 40 + (Math.random()-0.5)*30, type: 'unclassified', neighbors: [] });
        else if (i % 4 === 1) newPoints.push({ id: newPoints.length, x: cx + 60 + (Math.random()-0.5)*30, y: cy - 40 + (Math.random()-0.5)*30, type: 'unclassified', neighbors: [] });
        else {
          const angle = Math.random() * Math.PI; const r = 90 + Math.random()*15;
          newPoints.push({ id: newPoints.length, x: cx + Math.cos(angle)*r, y: cy + 20 + Math.sin(angle)*r, type: 'unclassified', neighbors: [] });
        }
      }
    } else {
      for (let i = 0; i < 100; i++) {
        newPoints.push({ id: newPoints.length, x: Math.random() * (width - 40) + 20, y: Math.random() * (height - 40) + 20, type: 'unclassified', neighbors: [] });
      }
    }

    // Tambahkan sedikit Noise (Pencilan Acak) di semua pola
    for (let i = 0; i < 15; i++) {
      newPoints.push({ id: newPoints.length, x: Math.random() * (width - 20) + 10, y: Math.random() * (height - 20) + 10, type: 'unclassified', neighbors: [] });
    }
    
    setPoints(newPoints); resetState();
  }, [pattern]);

  useEffect(() => { generateData(); }, [generateData]);

  const resetState = () => {
    setPoints(prev => prev.map(p => ({ ...p, type: 'unclassified', cluster: undefined, neighbors: [] })));
    setStep('idle'); setIteration(0); setLogs([]);
  };

  const handleNextStep = () => {
    const dist = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    if (step === 'idle') {
      // TAHAP 1: SCANNING & KLASIFIKASI
      const scannedPoints = points.map(p => {
        const neighbors = points.filter(other => p.id !== other.id && dist(p, other) <= eps).map(n => n.id);
        return { ...p, neighbors };
      });

      let coreCount = 0; let borderCount = 0; let noiseCount = 0;

      scannedPoints.forEach(p => { if (p.neighbors.length >= minPts) { p.type = 'core'; coreCount++; } });
      scannedPoints.forEach(p => {
        if (p.type !== 'core') {
          const hasCoreNeighbor = p.neighbors.some(nId => scannedPoints[nId].type === 'core');
          if (hasCoreNeighbor) { p.type = 'border'; borderCount++; } 
          else { p.type = 'noise'; noiseCount++; }
        }
      });

      setPoints(scannedPoints); setStep('scan'); setIteration(1);
      setLogs([{ title: "Phase 1: Density Scanning", desc: `Radar memindai radius ${eps}px. Hasil: ${coreCount} Core, ${borderCount} Border, ${noiseCount} Noise.` }]);
    } 
    
    else if (step === 'scan') {
      // TAHAP 2: CLUSTERING (BFS)
      const clusteredPoints = [...points];
      let currentClusterId = 0;

      clusteredPoints.forEach(p => {
        if (p.type === 'core' && p.cluster === undefined) {
          const queue = [p]; p.cluster = currentClusterId;

          while (queue.length > 0) {
            const curr = queue.shift()!;
            curr.neighbors.forEach(nId => {
              const neighbor = clusteredPoints.find(n => n.id === nId)!;
              if (neighbor.type === 'core' && neighbor.cluster === undefined) {
                neighbor.cluster = currentClusterId; queue.push(neighbor);
              } else if (neighbor.type === 'border' && neighbor.cluster === undefined) {
                neighbor.cluster = currentClusterId;
              }
            });
          }
          currentClusterId++;
        }
      });

      setPoints(clusteredPoints); setStep('cluster'); setIteration(2);
      setLogs(prev => [...prev, { title: "Phase 2: Grouping (Selesai)", desc: `Menggabungkan Inti yang berdekatan. Terbentuk ${currentClusterId} Kelompok berbeda. Titik Noise dibiarkan merah (diabaikan).` }]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 600; canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach((p) => {
      // Gambar Radius Eps saat Scanning
      if (step === 'scan' && p.type === 'core') {
        ctx.beginPath(); ctx.arc(p.x, p.y, eps, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.05)'; ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(p.x, p.y, p.type === 'core' ? 5 : 4, 0, Math.PI * 2);
      
      if (step === 'idle') {
        ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#0f172a';
      } else if (step === 'scan') {
        // Hijau (Core), Kuning (Border), Merah (Noise)
        ctx.fillStyle = p.type === 'core' ? '#10b981' : p.type === 'border' ? '#eab308' : '#ef4444';
        ctx.strokeStyle = '#fff';
      } else if (step === 'cluster') {
        ctx.fillStyle = p.cluster !== undefined ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] : '#1e293b';
        ctx.strokeStyle = p.cluster !== undefined ? '#fff' : '#ef4444';
      }
      
      ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
    });
  }, [points, step, eps]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      
      {/* KIRI: Visualisasi */}
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Fingerprint size={18} className="text-indigo-400"/> Simulator DBSCAN
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] md:text-xs font-mono uppercase px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded">
              Status: {step}
            </span>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-inner relative">
          <canvas ref={canvasRef} className="w-full h-full object-contain relative z-10" />
          
          {step === 'scan' && (
            <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 text-xs flex flex-col gap-2 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-medium"><div className="w-3 h-3 rounded-full bg-[#10b981] border border-white"></div> Core (Inti)</div>
              <div className="flex items-center gap-2 text-slate-200 font-medium"><div className="w-3 h-3 rounded-full bg-[#eab308] border border-white"></div> Border (Batas)</div>
              <div className="flex items-center gap-2 text-slate-200 font-medium"><div className="w-3 h-3 rounded-full bg-[#ef4444] border border-white"></div> Noise (Sampah)</div>
            </div>
          )}
        </div>
      </div>

      {/* KANAN: Terminal Panel */}
      <div className="lg:w-2/5 h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden">
        
        <div className="bg-slate-800/80 p-2 flex items-center gap-2 border-b border-slate-700 shrink-0">
          <div className="flex gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
          <span className="text-slate-400 text-xs mx-auto flex items-center gap-2"><TerminalSquare size={14}/> execution_log.sh</span>
        </div>

        {/* Kontrol Parameter */}
        <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4">
          <select value={pattern} onChange={(e) => {setPattern(e.target.value as DataPattern);}} className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs p-2 rounded outline-none focus:border-indigo-500">
            <option value="donut">Pola: Donat (Lingkaran Ganda)</option>
            <option value="smiley">Pola: Smiley Face</option>
            <option value="random">Pola: Acak & Berantakan</option>
          </select>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-indigo-300 flex justify-between"><span>[VAR] EPS (Radius):</span> <span>{eps} px</span></label>
            <input type="range" min="15" max="80" value={eps} onChange={(e) => {setEps(Number(e.target.value)); resetState();}} className="accent-indigo-500" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-indigo-300 flex justify-between"><span>[VAR] MIN_PTS (Tetangga):</span> <span>{minPts}</span></label>
            <input type="range" min="2" max="12" value={minPts} onChange={(e) => {setMinPts(Number(e.target.value)); resetState();}} className="accent-indigo-500" />
          </div>

          <div className="flex gap-2 shrink-0 mt-2">
            <button onClick={generateData} title="Acak Pola Baru" className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"><Shuffle size={14} /></button>
            <button onClick={resetState} title="Reset Status" className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"><RotateCcw size={14} /></button>
            <button onClick={handleNextStep} disabled={step === 'cluster'} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-400/50">
              {step === 'cluster' ? 'FINISHED' : step === 'idle' ? 'SCAN DENSITY()' : 'FORM CLUSTERS()'} 
              {step !== 'cluster' && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Log History */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#090c15]">
          <div className="flex flex-col gap-3 pb-4">
            {logs.length === 0 && <span className="text-slate-600 text-xs">Waiting for execution command...</span>}
            {logs.map((log, index) => (
              <div key={index} className={`flex gap-3 text-xs ${index === logs.length - 1 ? 'text-indigo-300' : 'text-slate-500'} animate-in fade-in duration-300`}>
                <span className="text-emerald-500 shrink-0">~%</span>
                <div>
                  <span className="font-bold block mb-1">{log.title}</span>
                  <span className="opacity-80 leading-relaxed">{log.desc}</span>
                </div>
              </div>
            ))}
            <div ref={logContainerRef} />
          </div>
        </div>

      </div>
    </div>
  );
}