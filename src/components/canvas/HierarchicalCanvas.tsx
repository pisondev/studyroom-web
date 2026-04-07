"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ArrowRight, TerminalSquare, Calculator, Table2, ArrowLeft, Eye, EyeOff, Target, Combine, SplitSquareHorizontal, Settings2, ChevronDown, ChevronUp, Edit3, Plus, Trash2, Save, CheckCircle2, Shuffle } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

type Point = { id: number; x: number; y: number };
type Cluster = { id: string; points: Point[]; color: string; label: string };
type Link = { id: string; p1: Point; p2: Point; distance: number; active: boolean; isHighlight?: boolean };
type DendroNode = { id: string; label: string; height: number; left?: DendroNode; right?: DendroNode; color: string };
type Algorithm = 'agglomerative' | 'divisive';
type Linkage = 'single' | 'complete' | 'average';

type MatrixRow = { label: string; values: (number | string)[] };
type TableData = { type: 'matrix'; headers: string[]; rows: MatrixRow[]; highlightRow?: number; highlightCol?: number; title: string };
type LogEntry = { type: 'init' | 'merge' | 'split' | 'converged'; title: string; desc: string; tableData?: TableData };

type Snapshot = {
  clusters: Cluster[];
  links: Link[];
  dendroRoots: DendroNode[];
  step: 'idle' | 'processing' | 'converged';
  iteration: number;
  logs: LogEntry[];
  expandedLogs: number[];
  clusterCounter: number;
};

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const GRID_MAX = 20; const GRID_RENDER = 21; const CANVAS_SIZE = 504; const UNIT = CANVAS_SIZE / GRID_RENDER;

export default function HierarchicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dendroCanvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [points, setPoints] = useState<Point[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [dendroRoots, setDendroRoots] = useState<DendroNode[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  
  const [algo, setAlgo] = useState<Algorithm>('agglomerative');
  const [linkage, setLinkage] = useState<Linkage>('single');
  
  const [numPointsStr, setNumPointsStr] = useState("6"); 
  const numPoints = parseInt(numPointsStr) || 0;
  
  const [step, setStep] = useState<'idle' | 'processing' | 'converged'>('idle');
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  
  const [showCoords, setShowCoords] = useState(false);
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);
  const [activeTable, setActiveTable] = useState<TableData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [clusterCounter, setClusterCounter] = useState(0);

  const toCanvasX = useCallback((x: number) => x * UNIT, []);
  const toCanvasY = useCallback((y: number) => CANVAS_SIZE - (y * UNIT), []);

  useEffect(() => {
    if (logContainerRef.current && !activeTable && !showEditor) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, activeTable, showEditor, expandedLogs]);

  const getDist = (p1: Point, p2: Point) => Math.round(Math.hypot(p1.x - p2.x, p1.y - p2.y) * 100) / 100;

  const getDiameter = (pts: Point[]) => {
    let max = 0;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) max = Math.max(max, getDist(pts[i], pts[j]));
    return max;
  };

  const getClusterDist = (c1: Cluster, c2: Cluster, linkType: Linkage): { dist: number, p1: Point, p2: Point } => {
    let minDist = Infinity; let maxDist = -Infinity; let sumDist = 0; let count = 0;
    let minPair = { p1: c1.points[0], p2: c2.points[0] };
    let maxPair = { p1: c1.points[0], p2: c2.points[0] };

    for (const p1 of c1.points) {
      for (const p2 of c2.points) {
        const d = getDist(p1, p2);
        if (d < minDist) { minDist = d; minPair = { p1, p2 }; }
        if (d > maxDist) { maxDist = d; maxPair = { p1, p2 }; }
        sumDist += d; count++;
      }
    }

    if (linkType === 'single') return { dist: minDist, ...minPair };
    if (linkType === 'complete') return { dist: maxDist, ...maxPair };
    return { dist: Math.round((sumDist / count) * 100) / 100, ...minPair };
  };

  const generateMST = (pts: Point[], col: string): Link[] => {
    if(pts.length < 2) return [];
    const edges = [];
    for(let i=0; i<pts.length; i++) for(let j=i+1; j<pts.length; j++) edges.push({ p1: pts[i], p2: pts[j], dist: getDist(pts[i], pts[j]) });
    edges.sort((a,b) => a.dist - b.dist);
    const parent = Array.from({length: pts.length}, (_, i) => i);
    const find = (i: number): number => parent[i] === i ? i : (parent[i] = find(parent[i]));
    const union = (i: number, j: number) => { const rI = find(i), rJ = find(j); if(rI !== rJ) { parent[rI] = rJ; return true; } return false; };
    const mst: Link[] = [];
    for(const e of edges) if(union(pts.indexOf(e.p1), pts.indexOf(e.p2))) mst.push({ id: Math.random().toString(), p1: e.p1, p2: e.p2, distance: e.dist, active: true });
    return mst;
  };

  const resetState = (pts = points) => {
    if (algo === 'agglomerative') {
      const initialClusters = pts.map((p, i) => ({ id: `P${p.id}`, points: [p], color: COLORS[i % COLORS.length], label: `P${p.id}` }));
      setClusters(initialClusters); setLinks([]);
      setDendroRoots(pts.map((p, i) => ({ id: `P${p.id}`, label: `P${p.id}`, height: 0, color: COLORS[i % COLORS.length] })));
    } else {
      setClusters([{ id: 'K0', points: pts, color: COLORS[0], label: 'Semua Data' }]);
      setLinks(generateMST(pts, COLORS[0]));
      setDendroRoots([{ id: 'K0', label: 'All', height: getDiameter(pts), color: COLORS[0] }]);
    }
    setStep('idle'); setIteration(0); setLogs([]); setActiveTable(null); setExpandedLogs([]); setClusterCounter(1);
    setHistory([]); // Reset History saat di-reset
  };

  const generateData = useCallback((forcedNum?: number) => {
    const targetNum = forcedNum !== undefined ? forcedNum : numPoints;
    const newPoints: Point[] = [];
    for (let i = 0; i < targetNum; i++) {
      newPoints.push({ id: i + 1, x: Math.round((Math.random() * 18 + 1) * 2) / 2, y: Math.round((Math.random() * 18 + 1) * 2) / 2 });
    }
    setPoints(newPoints); resetState(newPoints);
  }, [numPoints, algo, linkage]);

  useEffect(() => { generateData(); }, [algo]); 

  const buildMatrixTable = (clstrs: Cluster[], hlRow?: number, hlCol?: number): TableData => {
    const headers = ["", ...clstrs.map(c => c.label)];
    const rows: MatrixRow[] = clstrs.map((c1, i) => {
      const values = clstrs.map((c2, j) => {
        if (i === j) return 0;
        if (algo === 'agglomerative' && j < i) return "-";
        return getClusterDist(c1, c2, linkage).dist;
      });
      return { label: c1.label, values };
    });
    return { type: 'matrix', headers, rows, highlightRow: hlRow, highlightCol: hlCol, title: `Matriks Jarak (${linkage.toUpperCase()})` };
  };

  const saveHistory = () => {
    setHistory(prev => [...prev, {
      clusters: JSON.parse(JSON.stringify(clusters)),
      links: JSON.parse(JSON.stringify(links)),
      dendroRoots: JSON.parse(JSON.stringify(dendroRoots)),
      step, iteration,
      logs: JSON.parse(JSON.stringify(logs)),
      expandedLogs: [...expandedLogs],
      clusterCounter
    }]);
  };

  const handlePrevStep = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setClusters(prev.clusters); setLinks(prev.links); setDendroRoots(prev.dendroRoots);
    setStep(prev.step); setIteration(prev.iteration); setLogs(prev.logs);
    setExpandedLogs(prev.expandedLogs); setClusterCounter(prev.clusterCounter);
    setHistory(h => h.slice(0, -1)); setActiveTable(null);
  };

  const handleNextStep = () => {
    if (step === 'converged') return;
    saveHistory(); // Simpan state sebelum diubah

    if (algo === 'agglomerative') {
      if (step === 'idle') {
        const newLogIdx = logs.length;
        setLogs([{ type: 'init', title: "Inisialisasi Matriks Jarak", desc: `Terdapat ${clusters.length} titik. Masing-masing dianggap sebagai 1 kelompok terpisah.\nMatriks jarak awal dihitung menggunakan jarak Euclidean (d).`, tableData: buildMatrixTable(clusters) }]);
        setExpandedLogs([newLogIdx]); setStep('processing'); setIteration(1); return;
      }

      let minDist = Infinity; let c1Idx = -1; let c2Idx = -1; let bestLink: Link | null = null;
      
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const res = getClusterDist(clusters[i], clusters[j], linkage);
          if (res.dist < minDist) { minDist = res.dist; c1Idx = i; c2Idx = j; bestLink = { id: Math.random().toString(), p1: res.p1, p2: res.p2, distance: res.dist, active: true, isHighlight: true }; }
        }
      }

      if (c1Idx !== -1 && c2Idx !== -1 && bestLink) {
        const c1 = clusters[c1Idx]; const c2 = clusters[c2Idx];
        const newClusterLabel = `K${clusterCounter}`;
        const newCluster: Cluster = { id: newClusterLabel, points: [...c1.points, ...c2.points], color: c1.color, label: `(${c1.label}, ${c2.label})` };
        
        const nextClusters = clusters.filter((_, idx) => idx !== c1Idx && idx !== c2Idx);
        nextClusters.push(newCluster);

        const tableData = buildMatrixTable(clusters, c1Idx, c2Idx);

        const t1 = dendroRoots.find(t => t.id === c1.id); const t2 = dendroRoots.find(t => t.id === c2.id);
        const newTree: DendroNode = { id: newCluster.id, label: newClusterLabel, height: minDist, left: t1, right: t2, color: c1.color };
        setDendroRoots(prev => prev.filter(t => t.id !== c1.id && t.id !== c2.id).concat(newTree));

        setClusters(nextClusters);
        setLinks(prev => { const next = prev.map(l => ({ ...l, isHighlight: false })); return [...next, bestLink!]; });
        setClusterCounter(prev => prev + 1);
        
        const newLogIdx = logs.length;
        setLogs(prev => [...prev, { type: 'merge', title: `Iterasi ${iteration} > Gabung ${c1.label} & ${c2.label}`, desc: `Jarak terkecil di matriks adalah ${minDist}. Kedua kelompok digabung menjadi kelompok baru.\nUpdate baris/kolom dengan aturan ${linkage.toUpperCase()} Linkage.`, tableData }]);
        setExpandedLogs(prev => [...prev, newLogIdx]);
        setIteration(prev => prev + 1);

        if (nextClusters.length === 1) {
          setStep('converged');
          setLogs(prev => [...prev, { type: 'converged', title: "Konvergensi Tercapai", desc: "Semua titik telah terhubung menjadi 1 kelompok hirarki utama (Pohon Dendrogram Selesai)." }]);
          setExpandedLogs(prev => [...prev, newLogIdx + 1]);
        }
      }

    } else {
      // --- TOP DOWN (DIVISIVE) ---
      if (step === 'idle') {
        const newLogIdx = logs.length;
        setLogs([{ type: 'init', title: "Inisialisasi Kotak Utama", desc: `Semua ${points.length} titik berada di dalam 1 kelompok raksasa.\nMemulai algoritma pencarian diameter terbesar untuk memecah kelompok.` }]);
        setExpandedLogs([newLogIdx]); setStep('processing'); setIteration(1); return;
      }

      let maxDiameter = -1; let clusterToSplitIdx = -1; let seed1: Point | null = null; let seed2: Point | null = null;

      clusters.forEach((c, idx) => {
        if (c.points.length < 2) return;
        for(let i=0; i<c.points.length; i++) {
          for(let j=i+1; j<c.points.length; j++) {
            const d = getDist(c.points[i], c.points[j]);
            if (d > maxDiameter) { maxDiameter = d; clusterToSplitIdx = idx; seed1 = c.points[i]; seed2 = c.points[j]; }
          }
        }
      });

      if (clusterToSplitIdx !== -1 && seed1 && seed2) {
        const s1 = seed1 as unknown as Point; const s2 = seed2 as unknown as Point; 
        const cToSplit = clusters[clusterToSplitIdx];
        const newC1Pts: Point[] = []; const newC2Pts: Point[] = [];

        cToSplit.points.forEach(p => {
          if (getDist(p, s1) < getDist(p, s2)) newC1Pts.push(p); else newC2Pts.push(p);
        });

        const newC1: Cluster = { id: `K${clusterCounter}`, points: newC1Pts, color: COLORS[clusterCounter % COLORS.length], label: `K${clusterCounter}` };
        const newC2: Cluster = { id: `K${clusterCounter+1}`, points: newC2Pts, color: COLORS[(clusterCounter+1) % COLORS.length], label: `K${clusterCounter+1}` };

        const nextClusters = clusters.filter((_, idx) => idx !== clusterToSplitIdx);
        nextClusters.push(newC1, newC2);

        let nextLinks: Link[] = [];
        nextClusters.forEach(c => { nextLinks = nextLinks.concat(generateMST(c.points, c.color)); });

        const d1 = getDiameter(newC1Pts); const d2 = getDiameter(newC2Pts);
        const leftNode: DendroNode = { id: newC1.id, label: newC1.label, height: d1, color: newC1.color };
        const rightNode: DendroNode = { id: newC2.id, label: newC2.label, height: d2, color: newC2.color };
        
        const replaceNode = (nodes: DendroNode[]): DendroNode[] => {
           return nodes.map(n => {
              if (n.id === cToSplit.id) return { ...n, left: leftNode, right: rightNode };
              if (n.left || n.right) return { ...n, left: n.left ? replaceNode([n.left])[0] : undefined, right: n.right ? replaceNode([n.right])[0] : undefined };
              return n;
           });
        };
        setDendroRoots(prev => replaceNode(prev));

        setClusters(nextClusters); setLinks(nextLinks); setClusterCounter(prev => prev + 2);
        
        const newLogIdx = logs.length;
        setLogs(prev => [...prev, { type: 'split', title: `Iterasi ${iteration} > Pecah Kelompok ${cToSplit.label}`, desc: `Diameter terjauh ditemukan (${maxDiameter}) antara P${s1.id} dan P${s2.id}.\nMemecah ${cToSplit.label} menjadi dua dan mendistribusikan anggotanya berdasarkan jarak terdekat ke titik ujung.` }]);
        setExpandedLogs(prev => [...prev, newLogIdx]);
        setIteration(prev => prev + 1);

        if (nextClusters.length === points.length) {
          setStep('converged');
          setLogs(prev => [...prev, { type: 'converged', title: "Konvergensi Tercapai", desc: "Setiap titik kini berdiri sendiri sebagai kelompok mandiri." }]);
          setExpandedLogs(prev => [...prev, newLogIdx + 1]);
        }
      }
    }
  };

  const handleNumPointsChange = (valStr: string) => { setNumPointsStr(valStr); const val = parseInt(valStr); if (!isNaN(val) && val >= 2 && val <= 15) generateData(val); };
  const toggleLog = (index: number) => setExpandedLogs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);

  const getLogIcon = (type: string) => {
    switch(type) { case 'init': return <Target size={14} className="text-amber-400" />; case 'merge': return <Combine size={14} className="text-indigo-400" />; case 'split': return <SplitSquareHorizontal size={14} className="text-rose-400" />; case 'converged': return <CheckCircle2 size={14} className="text-emerald-400" />; default: return <ArrowRight size={14} />; }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (CANVAS_SIZE / rect.width); const mouseY = (e.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    
    let foundPId = null;
    let minD = 20; // Radius pencarian terdekat

    for (const p of points) { 
      const dist = Math.hypot(toCanvasX(p.x) - mouseX, toCanvasY(p.y) - mouseY);
      if (dist < minD) { 
        minD = dist;
        foundPId = p.id; 
      } 
    }
    setHoveredPointId(foundPId);
  };

  // Render Scatter Plot
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= GRID_MAX; i+=2) {
      ctx.beginPath(); ctx.moveTo(toCanvasX(i), 0); ctx.lineTo(toCanvasX(i), CANVAS_SIZE); ctx.stroke();
      if (i !== 0) ctx.fillText(i.toString(), toCanvasX(i), CANVAS_SIZE - 10);
      ctx.beginPath(); ctx.moveTo(0, toCanvasY(i)); ctx.lineTo(CANVAS_SIZE, toCanvasY(i)); ctx.stroke();
      if (i !== 0) ctx.fillText(i.toString(), 15, toCanvasY(i));
    }
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), toCanvasY(0)); ctx.lineTo(toCanvasX(GRID_MAX), toCanvasY(0)); ctx.stroke(); 
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), toCanvasY(0)); ctx.lineTo(toCanvasX(0), toCanvasY(GRID_MAX)); ctx.stroke(); 
    ctx.fillText("0", 12, toCanvasY(0) - 10);

    links.forEach(l => {
      ctx.beginPath(); ctx.moveTo(toCanvasX(l.p1.x), toCanvasY(l.p1.y)); ctx.lineTo(toCanvasX(l.p2.x), toCanvasY(l.p2.y));
      ctx.strokeStyle = l.isHighlight ? '#6366f1' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = l.isHighlight ? 3 : 1.5; ctx.stroke();
    });

    clusters.forEach(c => {
      c.points.forEach(p => {
        const isHovered = p.id === hoveredPointId;
        const cx = toCanvasX(p.x); const cy = toCanvasY(p.y);
        
        if (isHovered) { ctx.shadowBlur = 12; ctx.shadowColor = c.color; }
        ctx.beginPath(); ctx.arc(cx, cy, isHovered ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = c.color; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.stroke();
        
        if (showCoords || isHovered) {
          ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1'; ctx.font = isHovered ? 'bold 11px monospace' : '10px monospace';
          ctx.textAlign = 'left'; ctx.fillText(`P${p.id}(${p.x},${p.y})`, cx + 8, cy - 8);
        }
      });
    });
  }, [points, clusters, links, showCoords, hoveredPointId, toCanvasX, toCanvasY]);

  // Render Dendrogram
  useEffect(() => {
    const canvas = dendroCanvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (dendroRoots.length === 0) return;

    const leaves: DendroNode[] = [];
    const getLeaves = (n: DendroNode) => { if (!n.left && !n.right) leaves.push(n); if (n.left) getLeaves(n.left); if (n.right) getLeaves(n.right); };
    dendroRoots.forEach(getLeaves);

    const padding = 30;
    const spacing = (canvas.width - padding * 2) / Math.max(1, leaves.length - 1);
    const leafX: Record<string, number> = {};
    leaves.forEach((l, i) => { leafX[l.id] = padding + i * spacing; });

    let maxH = 0;
    const getMaxH = (n: DendroNode) => { if (n.height > maxH) maxH = n.height; if (n.left) getMaxH(n.left); if (n.right) getMaxH(n.right); };
    dendroRoots.forEach(getMaxH);
    if (maxH === 0) maxH = 10;

    const mapY = (h: number) => canvas.height - 40 - (h / maxH) * (canvas.height - 80);

    const drawNode = (n: DendroNode): {x: number, y: number} => {
      if (!n.left && !n.right) {
        const x = leafX[n.id]; const y = mapY(n.height);
        ctx.fillStyle = n.color || '#cbd5e1'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.fillText(n.label, x, y + 20);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = n.color; ctx.fill();
        return { x, y };
      }

      const leftPos = drawNode(n.left!); const rightPos = drawNode(n.right!);
      const x = (leftPos.x + rightPos.x) / 2; const y = mapY(n.height);

      ctx.strokeStyle = n.color || '#64748b'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leftPos.x, leftPos.y); ctx.lineTo(leftPos.x, y);
      ctx.lineTo(rightPos.x, y); 
      ctx.lineTo(rightPos.x, rightPos.y); 
      ctx.stroke();

      ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(n.height.toString(), x, y - 8);

      return { x, y };
    };

    dendroRoots.forEach(drawNode);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.beginPath();
    [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
       const y = mapY(ratio * maxH); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    });
    ctx.stroke();

  }, [dendroRoots]);

  const algoOptions = [ { value: "agglomerative", label: "Bottom-Up" }, { value: "divisive", label: "Top-Down" } ];
  const linkOptions = [ { value: "single", label: "Single (Min)" }, { value: "complete", label: "Complete (Max)" }, { value: "average", label: "Average (Mean)" } ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      
      {/* KIRI: VISUALISASI GANDA (Koordinat & Dendrogram) */}
      <div className="flex-1 lg:w-[65%] flex flex-col xl:flex-row gap-3 h-full">
        {/* Plot Koordinat */}
        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner relative p-2 min-h-[250px]">
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
             <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded">📍 Plot Koordinat</span>
             <button onClick={() => setShowCoords(!showCoords)} className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors border ${showCoords ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
              {showCoords ? <><Eye size={12}/> Label ON</> : <><EyeOff size={12}/> Label OFF</>}
            </button>
          </div>
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredPointId(null)} className="w-full flex-1 object-contain mt-8 cursor-crosshair transition-all" style={{ aspectRatio: '1/1' }} />
        </div>
        
        {/* Pohon Dendrogram */}
        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner relative p-2 min-h-[250px]">
           <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded z-10">🌳 Pohon Dendrogram</span>
           <canvas ref={dendroCanvasRef} className="w-full flex-1 object-contain mt-8 transition-all" />
        </div>
      </div>

      {/* KANAN: KONTROL & LOG TERMINAL */}
      <div className="lg:w-[35%] h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden relative">
        <div className="bg-slate-800/80 p-2 flex items-center justify-between border-b border-slate-700 shrink-0 pr-4">
          <div className="flex gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400 text-xs ml-3 flex items-center gap-2"><TerminalSquare size={14}/> hitung_matriks.sh</span>
          </div>
          {step === 'idle' && !activeTable && !showEditor && (
             <button onClick={() => setShowEditor(true)} className="flex items-center gap-1.5 text-[10px] bg-slate-700 hover:bg-indigo-600 text-slate-200 px-2 py-1 rounded transition-colors font-bold">
               <Edit3 size={12}/> Edit Manual
             </button>
          )}
        </div>

        {!activeTable && !showEditor && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-left-2 duration-200">
            <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4 z-10">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Arah Tree</label>
                  <div className="w-full [&>div]:!w-full [&>div]:!min-w-0"><CustomDropdown options={algoOptions} value={algo} onChange={(val) => { setAlgo(val as Algorithm); }} disabled={step !== 'idle'}/></div>
                </div>
                {algo === 'agglomerative' && (
                  <div className="flex-1 flex flex-col gap-1 min-w-0 animate-in fade-in">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Linkage (Update Matriks)</label>
                    <div className="w-full [&>div]:!w-full [&>div]:!min-w-0"><CustomDropdown options={linkOptions} value={linkage} onChange={(val) => { setLinkage(val as Linkage); resetState(); }} disabled={step !== 'idle'}/></div>
                  </div>
                )}
                {algo === 'divisive' && (
                   <div className="flex-1 flex flex-col gap-2 justify-center mt-1 sm:mt-0 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        Banyak Data <button onClick={() => generateData()} disabled={step !== 'idle'} className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50" title="Acak Posisi Data"><Shuffle size={12}/></button>
                      </label>
                      <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        <input type="number" min="2" max="15" value={numPointsStr} disabled={step !== 'idle'} onChange={(e) => handleNumPointsChange(e.target.value)} className="w-8 bg-transparent text-emerald-400 font-bold text-right outline-none disabled:opacity-50"/>
                        <span className="text-[10px] text-emerald-500/70 font-bold">Titik</span>
                      </div>
                    </div>
                    <input type="range" min="2" max="15" step="1" value={numPoints} onChange={(e) => handleNumPointsChange(e.target.value)} disabled={step !== 'idle'} className="accent-emerald-500"/>
                  </div>
                )}
              </div>

              {/* BARISAN TOMBOL KONTROL */}
              <div className="flex gap-2 shrink-0">
                <button onClick={() => resetState(points)} disabled={step === 'idle'} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl border border-slate-600 transition-colors" title="Ulangi Animasi dari Awal"><RotateCcw size={18} /></button>
                <button onClick={handlePrevStep} disabled={history.length === 0} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-500/50">
                  <ArrowLeft size={18} /> <span className="hidden sm:inline">KEMBALI</span>
                </button>
                <button onClick={handleNextStep} disabled={step === 'converged'} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-400/50">
                  {step === 'converged' ? 'SELESAI' : step === 'idle' ? 'MULAI' : <span className="hidden sm:inline">{algo === 'agglomerative' ? 'GABUNG' : 'PECAH'}</span>} 
                  {step !== 'converged' && step !== 'idle' && 'LANJUT'}
                  {!step.includes('converged') && <ArrowRight size={18} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex flex-col gap-3 pb-4">
                {logs.length === 0 && <span className="text-slate-600 text-xs text-center py-4 border border-dashed border-slate-700 rounded-lg">Pilih metode lalu klik Mulai. Sebaiknya gunakan 4-7 data saja untuk latihan UTS.</span>}
                {logs.map((log, index) => {
                  const isExpanded = expandedLogs.includes(index);
                  return (
                    <div key={index} className="flex flex-col gap-1 text-xs animate-in fade-in duration-300">
                      <button onClick={() => toggleLog(index)} className="w-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors rounded-lg border border-slate-700/50 flex items-center justify-between px-3 py-2.5 shadow-sm group">
                        <div className="flex items-center gap-2">{getLogIcon(log.type)}<span className="font-bold text-[11px] md:text-xs uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors text-left">{log.title}</span></div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500 shrink-0"/> : <ChevronDown size={16} className="text-slate-500 shrink-0"/>}
                      </button>
                      
                      {isExpanded && (
                        <div className="w-full pl-2 mt-1 border-l-2 border-slate-800/80 ml-2 animate-in slide-in-from-top-1 fade-in duration-200">
                          <div className="text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 mb-2 whitespace-pre-wrap">{log.desc}</div>
                          {log.tableData && (
                            <button onClick={() => setActiveTable(log.tableData!)} className="w-full mb-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-colors font-bold shadow-sm">
                              <Table2 size={14}/> Lihat Detail Matriks
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={logContainerRef} />
              </div>
            </div>
          </div>
        )}

        {/* --- Editor Manual --- */}
        {showEditor && (
          <div className="flex-1 flex flex-col bg-[#0f172a] animate-in slide-in-from-bottom-4 duration-200 absolute inset-0 z-30">
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shadow-md shrink-0">
               <span className="font-bold text-slate-200 text-xs flex items-center gap-2"><Edit3 size={14} className="text-indigo-400"/> Editor Soal UTS</span>
               <button onClick={() => {setShowEditor(false); resetState(points); setNumPointsStr(points.length.toString());}} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors">
                  <Save size={14}/> Simpan & Terapkan
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
               <section>
                 <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                   <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Titik Data ({points.length}/15)</h4>
                   <button onClick={() => { if(points.length < 15) { const newId = points.length > 0 ? Math.max(...points.map(p=>p.id)) + 1 : 1; setPoints([...points, {id: newId, x: 5, y: 5}]); } }} disabled={points.length >= 15} className="flex items-center gap-1 text-[10px] bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded text-slate-200 transition-colors">
                     <Plus size={12}/> Tambah Titik
                   </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {points.map((p, idx) => (
                     <div key={p.id} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                       <span className="text-[10px] font-bold text-slate-400 w-5">P{p.id}</span>
                       <div className="flex flex-1 gap-1">
                          <input type="number" step="0.1" value={p.x} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newPts = [...points]; newPts[idx].x = Math.max(0, Math.min(20, val)); setPoints(newPts); } }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-200 outline-none focus:border-indigo-500" placeholder="X"/>
                          <input type="number" step="0.1" value={p.y} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newPts = [...points]; newPts[idx].y = Math.max(0, Math.min(20, val)); setPoints(newPts); } }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-200 outline-none focus:border-indigo-500" placeholder="Y"/>
                       </div>
                       <button onClick={() => setPoints(points.filter(pt => pt.id !== p.id))} className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"><Trash2 size={12}/></button>
                     </div>
                   ))}
                 </div>
               </section>
            </div>
          </div>
        )}

        {/* --- Tabel Matriks --- */}
        {activeTable && !showEditor && (
          <div className="flex-1 flex flex-col bg-[#0f172a] animate-in slide-in-from-right-4 duration-200 absolute inset-0 z-20">
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shadow-md">
              <button onClick={() => setActiveTable(null)} className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-bold">
                <ArrowLeft size={14}/> Kembali
              </button>
              <span className="font-bold text-indigo-400 text-[10px] sm:text-xs uppercase tracking-widest truncate max-w-[150px] sm:max-w-none ml-2 text-right">{activeTable.title}</span>
            </div>
            
            <div className="flex-1 overflow-auto p-4 custom-scrollbar flex justify-center items-start">
              {activeTable.type === 'matrix' && (
                <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-lg w-full max-w-[100%] overflow-x-auto">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr>
                        {activeTable.headers.map((h, i) => (
                          <th key={i} className={`border-b border-r border-slate-700 p-3 text-slate-300 bg-slate-800/80 ${i===0 ? 'sticky left-0 z-10' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="border-b border-r border-slate-700 p-3 font-bold text-slate-300 bg-slate-800/80 sticky left-0 z-10">{row.label}</td>
                          {row.values.map((val, cIdx) => {
                            const isHighlight = (rIdx === activeTable.highlightRow && cIdx === activeTable.highlightCol) || (rIdx === activeTable.highlightCol && cIdx === activeTable.highlightRow);
                            const isZero = val === 0;
                            const isEmpty = val === "-";
                            return (
                              <td key={cIdx} className={`border-b border-slate-700 p-3 ${isHighlight ? 'bg-indigo-600/30 font-bold text-indigo-300 border-indigo-500/50' : isZero || isEmpty ? 'text-slate-600' : 'text-slate-400'}`}>
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}