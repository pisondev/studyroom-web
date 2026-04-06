"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Shuffle, ArrowRight, Combine, TerminalSquare, SplitSquareHorizontal } from 'lucide-react';

type Point = { id: number; x: number; y: number; clusterId: number };
type Link = { id: string; p1: Point; p2: Point; distance: number; active: boolean; stepAdded?: number };
type Algorithm = 'agglomerative' | 'divisive';
type LogEntry = { title: string; desc: string };

export default function HierarchicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [algo, setAlgo] = useState<Algorithm>('agglomerative');
  const [isFinished, setIsFinished] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [numPoints, setNumPoints] = useState(25);

  // Auto-scroll logic untuk terminal
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Algoritma Kruskal untuk membuat Minimum Spanning Tree (Akar dari Top-Down)
  const generateMST = (pts: Point[]) => {
    const edges: {p1: Point, p2: Point, dist: number}[] = [];
    for(let i=0; i<pts.length; i++) {
      for(let j=i+1; j<pts.length; j++) {
        edges.push({ p1: pts[i], p2: pts[j], dist: Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) });
      }
    }
    edges.sort((a,b) => a.dist - b.dist);

    const parent = Array.from({length: pts.length}, (_, i) => i);
    const find = (i: number): number => parent[i] === i ? i : (parent[i] = find(parent[i]));
    const union = (i: number, j: number) => {
      const rootI = find(i), rootJ = find(j);
      if(rootI !== rootJ) { parent[rootI] = rootJ; return true; }
      return false;
    };

    const mst: Link[] = [];
    for(const e of edges) {
      if(union(e.p1.id, e.p2.id)) {
        mst.push({ id: Math.random().toString(), p1: e.p1, p2: e.p2, distance: e.dist, active: true });
      }
    }
    return mst;
  };

  const generateData = useCallback(() => {
    const newPoints: Point[] = [];
    const width = 600; const height = 400;
    
    // Generate cluster-like data agar garisnya terlihat menarik
    const numClusters = 4;
    for (let i = 0; i < numClusters; i++) {
      const cx = Math.random() * (width - 100) + 50;
      const cy = Math.random() * (height - 100) + 50;
      const pointsPerCluster = Math.floor(numPoints / numClusters);
      for (let j = 0; j < pointsPerCluster; j++) {
        newPoints.push({
          id: newPoints.length,
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 60,
          clusterId: newPoints.length
        });
      }
    }

    setPoints(newPoints);
    if (algo === 'divisive') {
      // Top-Down: Mulai dengan semua terhubung (MST)
      setLinks(generateMST(newPoints));
      setPoints(newPoints.map(p => ({...p, clusterId: 0}))); // Semua 1 kelompok
    } else {
      // Bottom-Up: Mulai tanpa hubungan
      setLinks([]);
    }
    setIsFinished(false);
    setIteration(0);
    setLogs([{ title: `Mode: ${algo === 'agglomerative' ? 'Bottom-Up' : 'Top-Down'} Dimulai`, desc: algo === 'agglomerative' ? 'Setiap titik adalah kelompok mandiri. Menunggu penggabungan terdekat.' : 'Semua titik terhubung dalam 1 pohon raksasa (Minimum Spanning Tree).' }]);
  }, [algo, numPoints]);

  useEffect(() => { generateData(); }, [generateData]);

  const resetState = () => { generateData(); };

  const handleNextStep = () => {
    if (isFinished) return;

    if (algo === 'agglomerative') {
      // --- BOTTOM-UP LOGIC ---
      let minDist = Infinity;
      let bestPair: { p1: Point; p2: Point } | null = null;

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i]; const p2 = points[j];
          if (p1.clusterId !== p2.clusterId) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < minDist) { minDist = dist; bestPair = { p1, p2 }; }
          }
        }
      }

      if (bestPair) {
        const { p1, p2 } = bestPair;
        const newLinks = [...links, { id: Math.random().toString(), p1, p2, distance: minDist, active: true, stepAdded: iteration }];
        setLinks(newLinks);

        const newClusterId = p1.clusterId;
        const updatedPoints = points.map(p => p.clusterId === p2.clusterId ? { ...p, clusterId: newClusterId } : p);
        setPoints(updatedPoints);

        const uniqueClusters = new Set(updatedPoints.map(p => p.clusterId)).size;
        setIteration(prev => prev + 1);
        setLogs(prev => [...prev, { title: `Iterasi ${iteration + 1} - Penggabungan`, desc: `Menggabungkan 2 titik/kelompok terdekat. Sisa: ${uniqueClusters} Kelompok.` }]);

        if (uniqueClusters === 1) {
          setIsFinished(true);
          setLogs(prev => [...prev, { title: "Selesai (Konvergen)", desc: "Semua titik telah terhubung menjadi 1 kelompok raksasa." }]);
        }
      }
    } else {
      // --- TOP-DOWN LOGIC ---
      const activeLinks = links.filter(l => l.active);
      if (activeLinks.length > 0) {
        // Cari garis terpanjang untuk diputus
        let maxDist = -1;
        let linkToBreak: Link | null = null;
        activeLinks.forEach(l => {
          if (l.distance > maxDist) { maxDist = l.distance; linkToBreak = l; }
        });

        if (linkToBreak) {
          const updatedLinks = links.map(l => l.id === linkToBreak!.id ? { ...l, active: false } : l);
          setLinks(updatedLinks);
          
          setIteration(prev => prev + 1);
          setLogs(prev => [...prev, { title: `Iterasi ${iteration + 1} - Pemecahan`, desc: `Memutus garis terpanjang sejauh ${Math.round(maxDist)}px. Kelompok terpecah.` }]);

          if (updatedLinks.filter(l => l.active).length === 0) {
            setIsFinished(true);
            setLogs(prev => [...prev, { title: "Selesai (Konvergen)", desc: "Semua garis putus. Setiap titik kini menjadi kelompok mandiri kembali." }]);
          }
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 600; canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar Garis (Links)
    links.forEach((link, idx) => {
      if (!link.active && algo === 'divisive') return; // Jangan gambar garis yang sudah diputus di Top-Down

      ctx.beginPath(); ctx.moveTo(link.p1.x, link.p1.y); ctx.lineTo(link.p2.x, link.p2.y);
      
      // Efek highlight untuk garis yang baru saja diproses (hanya di Bottom-Up)
      if (algo === 'agglomerative' && idx === links.length - 1) {
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'; ctx.lineWidth = 1.5;
      }
      ctx.stroke();
    });

    // Gambar Titik
    points.forEach((p) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8'; ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();
    });
  }, [points, links, algo]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      
      {/* KIRI: Visualisasi */}
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Combine size={18} className="text-indigo-400"/> Hierarchical Clustering
          </h3>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setAlgo('agglomerative')} className={`flex items-center gap-1 px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${algo === 'agglomerative' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Bottom-Up</button>
            <button onClick={() => setAlgo('divisive')} className={`flex items-center gap-1 px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${algo === 'divisive' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}><SplitSquareHorizontal size={12}/> Top-Down</button>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-inner relative">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* KANAN: Terminal Panel */}
      <div className="lg:w-2/5 h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden">
        
        {/* Terminal Header */}
        <div className="bg-slate-800/80 p-2 flex items-center gap-2 border-b border-slate-700 shrink-0">
          <div className="flex gap-1.5 ml-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
          <span className="text-slate-400 text-xs mx-auto flex items-center gap-2"><TerminalSquare size={14}/> execution_log.sh</span>
        </div>

        {/* Panel Kontrol */}
        <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-indigo-300 flex justify-between"><span>[VAR] DATA_POINTS:</span> <span>{numPoints}</span></label>
            <input type="range" min="10" max="60" step="5" value={numPoints} onChange={(e) => {setNumPoints(Number(e.target.value)); resetState();}} className="accent-indigo-500" />
          </div>

          <div className="flex gap-2 shrink-0 mt-2">
            <button onClick={resetState} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"><RotateCcw size={16} /></button>
            <button onClick={handleNextStep} disabled={isFinished} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-400/50">
              {isFinished ? 'PROCESS FINISHED' : algo === 'agglomerative' ? 'MERGE NEAREST()' : 'SPLIT LONGEST()'} 
              {!isFinished && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Terminal Logs (Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#090c15]">
          <div className="flex flex-col gap-3 pb-4">
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