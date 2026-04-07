"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ArrowRight, TerminalSquare, Calculator, Table2, ArrowLeft, Eye, EyeOff, Target, Radar, Fingerprint, Network, ChevronDown, ChevronUp, Edit3, Plus, Trash2, Save, CheckCircle2, Shuffle, Layers } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

type PointType = 'unclassified' | 'core' | 'border' | 'noise';
type Point = { id: number; x: number; y: number; type: PointType; cluster?: number; neighbors: number[] };
type Step = 'idle' | 'scan' | 'cluster' | 'converged';
type DataPattern = 'random' | 'clusters' | 'donut' | 'smiley';

type MatrixRow = { label: string; values: number[] };
type ScanRecord = { point: Point; neighborIds: number[]; count: number; type: PointType };
type RelationRecord = { point: Point; ddr: number[]; dr: number[]; dc: number[] };
type ClusterRecord = { clusterId: number | 'Noise'; members: { id: number, type: PointType }[], color: string };

type TableData = 
  | { type: 'scan'; title: string; matrix: { headers: string[], rows: MatrixRow[] }; scanRecords: ScanRecord[]; relationRecords: RelationRecord[] }
  | { type: 'cluster'; title: string; records: ClusterRecord[] };

type LogEntry = { type: 'init' | 'scan' | 'cluster' | 'converged'; title: string; desc: string; tableData?: TableData };

type Snapshot = {
  points: Point[];
  step: Step;
  iteration: number;
  logs: LogEntry[];
  expandedLogs: number[];
  clusterCounter: number;
};

const CLUSTER_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6'];
const GRID_MAX = 20; const GRID_RENDER = 21; const CANVAS_SIZE = 504; const UNIT = CANVAS_SIZE / GRID_RENDER;

export default function DBSCANCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [points, setPoints] = useState<Point[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  
  const [pattern, setPattern] = useState<DataPattern>('random');
  const [epsStr, setEpsStr] = useState("3");
  const [minPtsStr, setMinPtsStr] = useState("3");
  const [numPointsStr, setNumPointsStr] = useState("12"); 
  
  const eps = parseFloat(epsStr) || 3;
  const minPts = parseInt(minPtsStr) || 3;
  const numPoints = parseInt(numPointsStr) || 0;
  
  const [step, setStep] = useState<Step>('idle');
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  
  const [showCoords, setShowCoords] = useState(false);
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);
  const [activeTable, setActiveTable] = useState<TableData | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'scan' | 'relations'>('matrix');
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

  const resetState = (pts = points) => {
    setPoints(pts.map(p => ({ ...p, type: 'unclassified', cluster: undefined, neighbors: [] })));
    setStep('idle'); setIteration(0); setLogs([]); setActiveTable(null); setExpandedLogs([]); setClusterCounter(0);
    setHistory([]); setActiveTab('matrix');
  };

  const generateData = useCallback(() => {
    const newPoints: Point[] = [];
    const targetNum = numPoints;
    const cx = 10; const cy = 10; // Pusat Grid 20x20

    if (pattern === 'donut') {
      const inner = Math.floor(targetNum * 0.3); const outer = targetNum - inner;
      for(let i=0; i<outer; i++) { const a = Math.random()*Math.PI*2; const r = 6 + Math.random()*2; newPoints.push({ id: i+1, x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, type: 'unclassified', neighbors: [] }); }
      for(let i=0; i<inner; i++) { const a = Math.random()*Math.PI*2; const r = 1 + Math.random()*2; newPoints.push({ id: outer+i+1, x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, type: 'unclassified', neighbors: [] }); }
    } else if (pattern === 'smiley') {
      const eyes = Math.floor(targetNum * 0.3); const mouth = targetNum - eyes;
      for(let i=0; i<eyes; i++) { const isLeft = i%2===0; newPoints.push({ id: i+1, x: cx + (isLeft ? -3 : 3) + (Math.random()-0.5)*1.5, y: cy + 3 + (Math.random()-0.5)*1.5, type: 'unclassified', neighbors: [] }); }
      for(let i=0; i<mouth; i++) { const a = Math.PI + Math.random()*Math.PI; const r = 5 + Math.random()*1; newPoints.push({ id: eyes+i+1, x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, type: 'unclassified', neighbors: [] }); }
    } else if (pattern === 'clusters') {
      const k = 3; const ptsPerCluster = Math.floor(targetNum / k);
      for(let c=0; c<k; c++) { const ccx = 4 + Math.random()*12; const ccy = 4 + Math.random()*12;
        for(let i=0; i<ptsPerCluster; i++) newPoints.push({ id: newPoints.length+1, x: ccx + (Math.random()-0.5)*4, y: ccy + (Math.random()-0.5)*4, type: 'unclassified', neighbors: [] });
      }
      while(newPoints.length < targetNum) newPoints.push({ id: newPoints.length+1, x: Math.random()*19+0.5, y: Math.random()*19+0.5, type: 'unclassified', neighbors: [] });
    } else {
      for (let i = 0; i < targetNum; i++) newPoints.push({ id: i + 1, x: Math.round((Math.random() * 19 + 0.5) * 2) / 2, y: Math.round((Math.random() * 19 + 0.5) * 2) / 2, type: 'unclassified', neighbors: [] });
    }

    // Pembulatan ke 1 desimal untuk kerapian
    const cleanPoints = newPoints.map(p => ({...p, x: Math.round(p.x*10)/10, y: Math.round(p.y*10)/10}));
    setPoints(cleanPoints); resetState(cleanPoints);
  }, [numPoints, pattern]);

  useEffect(() => { generateData(); }, [pattern]); 

  const saveHistory = () => {
    setHistory(prev => [...prev, { points: JSON.parse(JSON.stringify(points)), step, iteration, logs: JSON.parse(JSON.stringify(logs)), expandedLogs: [...expandedLogs], clusterCounter }]);
  };

  const handlePrevStep = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setPoints(prev.points); setStep(prev.step); setIteration(prev.iteration); setLogs(prev.logs);
    setExpandedLogs(prev.expandedLogs); setClusterCounter(prev.clusterCounter);
    setHistory(h => h.slice(0, -1)); setActiveTable(null);
  };

  const handleNextStep = () => {
    if (step === 'converged') return;
    saveHistory(); 

    if (step === 'idle') {
      // --- TAHAP 1: SCANNING ---
      const scannedPoints = [...points].map(p => ({ ...p, neighbors: [] as number[] }));
      const scanRecords: ScanRecord[] = [];
      const headers = ["", ...scannedPoints.map(p => `P${p.id}`)];
      const matrixRows: MatrixRow[] = [];

      // 1. Hitung Jarak & Tetangga
      for (let i = 0; i < scannedPoints.length; i++) {
        const p1 = scannedPoints[i];
        const rowVals: number[] = [];
        for (let j = 0; j < scannedPoints.length; j++) {
          const p2 = scannedPoints[j];
          const d = getDist(p1, p2);
          rowVals.push(d);
          if (d <= eps) p1.neighbors.push(p2.id); // Terjangkau radius Eps
        }
        matrixRows.push({ label: `P${p1.id}`, values: rowVals });
      }

      let coreCount = 0; let borderCount = 0; let noiseCount = 0;

      // 2. Tentukan Status
      scannedPoints.forEach(p => { if (p.neighbors.length >= minPts) { p.type = 'core'; coreCount++; } });
      scannedPoints.forEach(p => {
        if (p.type !== 'core') {
          const hasCoreNeighbor = p.neighbors.some(nId => scannedPoints.find(sp => sp.id === nId)?.type === 'core');
          if (hasCoreNeighbor) { p.type = 'border'; borderCount++; } else { p.type = 'noise'; noiseCount++; }
        }
        scanRecords.push({ point: p, neighborIds: [...p.neighbors], count: p.neighbors.length, type: p.type });
      });

      // 3. Hitung DDR, DR, DC (Relasi Kepadatan)
      const ddrMap: Record<number, number[]> = {};
      const drMap: Record<number, number[]> = {};
      const dcMap: Record<number, number[]> = {};

      scannedPoints.forEach(p => { ddrMap[p.id] = p.type === 'core' ? p.neighbors.filter(n => n !== p.id) : []; });

      scannedPoints.forEach(p => {
        if (p.type === 'core') {
          const visited = new Set<number>(); const queue = [...ddrMap[p.id]];
          while(queue.length > 0) {
            const currId = queue.shift()!;
            if (!visited.has(currId)) {
              visited.add(currId);
              const currPoint = scannedPoints.find(pt => pt.id === currId);
              if (currPoint?.type === 'core') ddrMap[currId].forEach(n => { if (!visited.has(n)) queue.push(n); });
            }
          }
          visited.delete(p.id); drMap[p.id] = Array.from(visited).sort((a,b)=>a-b);
        } else { drMap[p.id] = []; }
      });

      scannedPoints.forEach(p => {
        const connected = new Set<number>();
        scannedPoints.forEach(o => {
          if (o.type === 'core') {
            const oDR = [o.id, ...drMap[o.id]]; 
            if (oDR.includes(p.id)) oDR.forEach(n => { if (n !== p.id) connected.add(n); });
          }
        });
        dcMap[p.id] = Array.from(connected).sort((a,b)=>a-b);
      });

      const relationRecords: RelationRecord[] = scannedPoints.map(p => ({ point: p, ddr: ddrMap[p.id], dr: drMap[p.id], dc: dcMap[p.id] }));

      setPoints(scannedPoints); setStep('scan'); setIteration(1);
      const newLogIdx = logs.length;
      setLogs([{ 
        type: 'scan', title: "Tahap 1: Pindai Kepadatan Titik (Scanning)", 
        desc: `Radius (ε) = ${eps}, MinPts = ${minPts}.\n1. Membangun Matriks Jarak (d).\n2. Memindai jumlah tetangga per titik.\n3. Menentukan relasi DDR, DR, dan DC.\n\nHasil: ${coreCount} Core, ${borderCount} Border, ${noiseCount} Noise`,
        tableData: { type: 'scan', title: `Tabel Analisis Scan (ε=${eps})`, matrix: { headers, rows: matrixRows }, scanRecords, relationRecords }
      }]);
      setExpandedLogs([newLogIdx]);

    } else if (step === 'scan') {
      // --- TAHAP 2: CLUSTERING ---
      const clusteredPoints = JSON.parse(JSON.stringify(points)) as Point[];
      let currentCId = 0;

      clusteredPoints.forEach(p => {
        if (p.type === 'core' && p.cluster === undefined) {
          const queue = [p]; p.cluster = currentCId;
          while (queue.length > 0) {
            const curr = queue.shift()!;
            curr.neighbors.forEach(nId => {
              const neighbor = clusteredPoints.find(n => n.id === nId);
              if (neighbor) {
                if (neighbor.type === 'core' && neighbor.cluster === undefined) { neighbor.cluster = currentCId; queue.push(neighbor); } 
                else if (neighbor.type === 'border' && neighbor.cluster === undefined) { neighbor.cluster = currentCId; }
              }
            });
          }
          currentCId++;
        }
      });

      const clusterRecords: ClusterRecord[] = [];
      for (let i = 0; i < currentCId; i++) clusterRecords.push({ clusterId: i, color: CLUSTER_COLORS[i % CLUSTER_COLORS.length], members: clusteredPoints.filter(p => p.cluster === i).map(p => ({id: p.id, type: p.type})) });
      const noises = clusteredPoints.filter(p => p.type === 'noise').map(p => ({id: p.id, type: p.type as PointType}));
      if (noises.length > 0) clusterRecords.push({ clusterId: 'Noise', color: '#ef4444', members: noises });

      setPoints(clusteredPoints); setStep('converged'); setIteration(2); setClusterCounter(currentCId);
      const newLogIdx = logs.length;
      setLogs(prev => [...prev, { 
        type: 'cluster', title: "Tahap 2: Pembentukan Kelompok (Clustering)", 
        desc: `Semua titik Core yang saling terhubung (DC) digabung.\nTitik Border dimasukkan ke kelompok Core terdekat.\n\nTerbentuk ${currentCId} Kelompok utama. Titik Noise diabaikan.`,
        tableData: { type: 'cluster', records: clusterRecords, title: `Hasil Clustering DBSCAN` }
      }]);
      setExpandedLogs(prev => [...prev, newLogIdx]);
    }
  };

  const handleNumChange = (valStr: string, setter: (val: string) => void, limitMin: number, limitMax: number, callback?: (val: number) => void) => { 
    setter(valStr); const val = parseFloat(valStr); if (!isNaN(val) && val >= limitMin && val <= limitMax && callback) callback(val); 
  };
  const toggleLog = (index: number) => setExpandedLogs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  const getLogIcon = (type: string) => { switch(type) { case 'init': return <Target size={14} className="text-amber-400" />; case 'scan': return <Radar size={14} className="text-indigo-400" />; case 'cluster': return <Network size={14} className="text-emerald-400" />; case 'converged': return <CheckCircle2 size={14} className="text-emerald-400" />; default: return <ArrowRight size={14} />; } };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (CANVAS_SIZE / rect.width); const mouseY = (e.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    let foundPId = null; let minD = 15; 
    for (const p of points) { const dist = Math.hypot(toCanvasX(p.x) - mouseX, toCanvasY(p.y) - mouseY); if (dist < minD) { minD = dist; foundPId = p.id; } }
    setHoveredPointId(foundPId);
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= GRID_MAX; i++) {
      ctx.beginPath(); ctx.moveTo(toCanvasX(i), 0); ctx.lineTo(toCanvasX(i), CANVAS_SIZE); ctx.stroke();
      if (i % 2 === 0 && i !== 0) ctx.fillText(i.toString(), toCanvasX(i), CANVAS_SIZE - 10);
      ctx.beginPath(); ctx.moveTo(0, toCanvasY(i)); ctx.lineTo(CANVAS_SIZE, toCanvasY(i)); ctx.stroke();
      if (i % 2 === 0 && i !== 0) ctx.fillText(i.toString(), 15, toCanvasY(i));
    }
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), toCanvasY(0)); ctx.lineTo(toCanvasX(GRID_MAX), toCanvasY(0)); ctx.stroke(); 
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), toCanvasY(0)); ctx.lineTo(toCanvasX(0), toCanvasY(GRID_MAX)); ctx.stroke(); 
    ctx.fillText("0", 12, toCanvasY(0) - 10);

    if (step === 'scan' || step === 'converged') {
      points.forEach(p => {
        if (p.type === 'core') {
          ctx.beginPath(); ctx.arc(toCanvasX(p.x), toCanvasY(p.y), eps * UNIT, 0, Math.PI * 2);
          ctx.fillStyle = step === 'scan' ? 'rgba(16, 185, 129, 0.08)' : p.cluster !== undefined ? `${CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]}1A` : 'rgba(16, 185, 129, 0.05)';
          ctx.fill(); ctx.strokeStyle = step === 'scan' ? 'rgba(16, 185, 129, 0.3)' : p.cluster !== undefined ? `${CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]}4D` : 'rgba(16, 185, 129, 0.1)'; ctx.lineWidth = 1; ctx.stroke();
        }
      });
    }

    if (hoveredPointId) {
      const hp = points.find(p => p.id === hoveredPointId);
      if (hp) {
        if (hp.neighbors.length > 0 && step !== 'idle') {
           ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
           hp.neighbors.forEach(nId => { const np = points.find(p => p.id === nId); if (np && np.id !== hp.id) { ctx.beginPath(); ctx.moveTo(toCanvasX(hp.x), toCanvasY(hp.y)); ctx.lineTo(toCanvasX(np.x), toCanvasY(np.y)); ctx.stroke(); } });
           ctx.setLineDash([]);
        }
        if (step === 'idle') {
           ctx.beginPath(); ctx.arc(toCanvasX(hp.x), toCanvasY(hp.y), eps * UNIT, 0, Math.PI * 2);
           ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.stroke();
        }
      }
    }

    points.forEach((p) => {
      const isHovered = p.id === hoveredPointId;
      const cx = toCanvasX(p.x); const cy = toCanvasY(p.y);
      let fillCol = '#94a3b8'; let strokeCol = '#0f172a';
      
      if (step === 'scan') { fillCol = p.type === 'core' ? '#10b981' : p.type === 'border' ? '#eab308' : '#ef4444'; strokeCol = '#fff'; } 
      else if (step === 'converged') { fillCol = p.type === 'noise' ? '#ef4444' : p.cluster !== undefined ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] : '#94a3b8'; strokeCol = '#fff'; }

      if (isHovered) { ctx.shadowBlur = 15; ctx.shadowColor = fillCol; }
      ctx.beginPath(); ctx.arc(cx, cy, p.type === 'core' || isHovered ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = fillCol; ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = strokeCol; ctx.lineWidth = isHovered ? 2 : 1; ctx.stroke();
      
      if (showCoords || isHovered) {
        ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1'; ctx.font = isHovered ? 'bold 11px monospace' : '10px monospace';
        ctx.textAlign = 'left'; ctx.fillText(`P${p.id}(${p.x},${p.y})`, cx + 8, cy - 8);
      }
    });
  }, [points, step, eps, showCoords, hoveredPointId, toCanvasX, toCanvasY]);

  const patternOptions = [ { value: "random", label: "Pola: Acak" }, { value: "clusters", label: "Pola: Terkelompok" }, { value: "donut", label: "Pola: Donat" }, { value: "smiley", label: "Pola: Smiley" } ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Fingerprint size={18} className="text-indigo-400"/> Bidang Koordinat DBSCAN (0-20)
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setShowCoords(!showCoords)} className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors border ${showCoords ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
              {showCoords ? <><Eye size={12}/> Label ON</> : <><EyeOff size={12}/> Label OFF</>}
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center p-2 relative">
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredPointId(null)} className="max-h-full max-w-full object-contain cursor-crosshair transition-all" style={{ aspectRatio: '1/1' }} />
          
          {step === 'scan' && !activeTable && (
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-[10px] flex flex-col gap-2 shadow-xl animate-in fade-in">
              <span className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1">Status Titik</span>
              <div className="flex items-center gap-2 text-slate-200"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white"></div> Core (Inti) &ge; {minPts}</div>
              <div className="flex items-center gap-2 text-slate-200"><div className="w-2.5 h-2.5 rounded-full bg-[#eab308] border border-white"></div> Border (Tepi) &lt; {minPts}</div>
              <div className="flex items-center gap-2 text-slate-200"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] border border-white"></div> Noise (Pencilan)</div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-2/5 h-[500px] lg:h-full bg-[#090c15] rounded-xl border border-slate-700 shadow-2xl flex flex-col font-mono text-sm overflow-hidden relative">
        <div className="bg-slate-800/80 p-2 flex items-center justify-between border-b border-slate-700 shrink-0 pr-4">
          <div className="flex gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400 text-xs ml-3 flex items-center gap-2"><TerminalSquare size={14}/> kalkulasi_ujian.sh</span>
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
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Pola Data</label>
                  <div className="w-full [&>div]:!w-full [&>div]:!min-w-0"><CustomDropdown options={patternOptions} value={pattern} onChange={(val) => { setPattern(val as DataPattern); }} disabled={step !== 'idle'}/></div>
                </div>
                <div className="flex-1 flex flex-col gap-2 justify-center mt-1 sm:mt-0">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">Banyak Data <button onClick={() => generateData()} disabled={step !== 'idle'} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50" title="Acak Pola Baru"><Shuffle size={12}/></button></label>
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><input type="number" min="3" max="25" value={numPointsStr} disabled={step !== 'idle'} onChange={(e) => handleNumChange(e.target.value, setNumPointsStr, 3, 25, generateData)} className="w-8 bg-transparent text-emerald-400 font-bold text-right outline-none disabled:opacity-50"/><span className="text-[10px] text-emerald-500/70 font-bold">titik</span></div>
                  </div>
                  <input type="range" min="3" max="25" step="1" value={numPoints} onChange={(e) => handleNumChange(e.target.value, setNumPointsStr, 3, 25, generateData)} disabled={step !== 'idle'} className="accent-emerald-500"/>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Radius (ε)</label>
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><input type="number" step="0.5" min="1" max="15" value={epsStr} disabled={step !== 'idle'} onChange={(e) => handleNumChange(e.target.value, setEpsStr, 1, 15, () => resetState(points))} className="w-10 bg-transparent text-indigo-400 font-bold text-right outline-none disabled:opacity-50"/><span className="text-[10px] text-indigo-500/70 font-bold">px</span></div>
                  </div>
                  <input type="range" min="1" max="15" step="0.5" value={eps} onChange={(e) => handleNumChange(e.target.value, setEpsStr, 1, 15, () => resetState(points))} disabled={step !== 'idle'} className="accent-indigo-500"/>
                </div>

                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Min_Pts</label>
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><input type="number" min="2" max="6" value={minPtsStr} disabled={step !== 'idle'} onChange={(e) => handleNumChange(e.target.value, setMinPtsStr, 2, 6, () => resetState(points))} className="w-8 bg-transparent text-amber-400 font-bold text-right outline-none disabled:opacity-50"/><span className="text-[10px] text-amber-500/70 font-bold">titik</span></div>
                  </div>
                  <input type="range" min="2" max="6" step="1" value={minPts} onChange={(e) => handleNumChange(e.target.value, setMinPtsStr, 2, 6, () => resetState(points))} disabled={step !== 'idle'} className="accent-amber-500"/>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => resetState(points)} disabled={step === 'idle'} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl border border-slate-600 transition-colors" title="Ulangi Animasi dari Awal"><RotateCcw size={18} /></button>
                <button onClick={handlePrevStep} disabled={history.length === 0} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-500/50">
                  <ArrowLeft size={18} /> <span className="hidden sm:inline">KEMBALI</span>
                </button>
                <button onClick={handleNextStep} disabled={step === 'converged'} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-400/50">
                  {step === 'converged' ? 'SELESAI' : step === 'idle' ? 'SCAN STATUS' : 'BENTUK KELOMPOK'} 
                  {step !== 'converged' && <ArrowRight size={18} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex flex-col gap-3 pb-4">
                {logs.length === 0 && <span className="text-slate-600 text-xs text-center py-4 border border-dashed border-slate-700 rounded-lg">Pilih pola lalu klik Scan Status. Coba hover titik untuk melihat cakupan jangkauan radius (ε) awal.</span>}
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
                            <button onClick={() => { setActiveTable(log.tableData!); setActiveTab(log.type === 'scan' ? 'matrix' : 'scan'); }} className="w-full mb-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-colors font-bold shadow-sm">
                              <Table2 size={14}/> Lihat Laporan Detail Ujian
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
                   <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Titik Data ({points.length}/25)</h4>
                   <button onClick={() => { if(points.length < 25) { const newId = points.length > 0 ? Math.max(...points.map(p=>p.id)) + 1 : 1; setPoints([...points, {id: newId, x: 5, y: 5, type: 'unclassified', neighbors: []}]); } }} disabled={points.length >= 25} className="flex items-center gap-1 text-[10px] bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded text-slate-200 transition-colors">
                     <Plus size={12}/> Tambah Titik
                   </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {points.map((p, idx) => (
                     <div key={p.id} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                       <span className="text-[10px] font-bold text-slate-400 w-5">P{p.id}</span>
                       <div className="flex flex-1 gap-1">
                          <input type="number" step="0.5" value={p.x} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newPts = [...points]; newPts[idx].x = Math.max(0, Math.min(20, val)); setPoints(newPts); } }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-200 outline-none focus:border-indigo-500" placeholder="X"/>
                          <input type="number" step="0.5" value={p.y} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newPts = [...points]; newPts[idx].y = Math.max(0, Math.min(20, val)); setPoints(newPts); } }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-200 outline-none focus:border-indigo-500" placeholder="Y"/>
                       </div>
                       <button onClick={() => setPoints(points.filter(pt => pt.id !== p.id))} className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"><Trash2 size={12}/></button>
                     </div>
                   ))}
                 </div>
               </section>
            </div>
          </div>
        )}

        {/* --- Multi-Tab Tabel Detail --- */}
        {activeTable && !showEditor && (
          <div className="flex-1 flex flex-col bg-[#0f172a] animate-in slide-in-from-right-4 duration-200 absolute inset-0 z-20">
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shadow-md shrink-0">
              <button onClick={() => setActiveTable(null)} className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-bold shrink-0">
                <ArrowLeft size={14}/> Kembali
              </button>
              <span className="font-bold text-indigo-400 text-[10px] sm:text-xs uppercase tracking-widest truncate ml-2 text-right">{activeTable.title}</span>
            </div>
            
            {activeTable.type === 'scan' && (
              <div className="flex bg-slate-900 border-b border-slate-700 shrink-0 p-2 gap-2 overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab('matrix')} className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'matrix' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>1. Matriks Jarak</button>
                <button onClick={() => setActiveTab('scan')} className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'scan' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>2. Pindai Status</button>
                <button onClick={() => setActiveTab('relations')} className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'relations' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>3. Analisis DDR/DR/DC</button>
              </div>
            )}

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {activeTable.type === 'scan' && activeTab === 'matrix' && (
                <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-lg w-full overflow-x-auto">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead><tr>{activeTable.matrix.headers.map((h, i) => (<th key={i} className={`border-b border-r border-slate-700 p-3 text-slate-300 bg-slate-800/80 ${i===0 ? 'sticky left-0 z-10' : ''}`}>{h}</th>))}</tr></thead>
                    <tbody>
                      {activeTable.matrix.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="border-b border-r border-slate-700 p-3 font-bold text-slate-300 bg-slate-800/80 sticky left-0 z-10">{row.label}</td>
                          {row.values.map((val, cIdx) => {
                            const isHighlight = val <= eps && val !== 0; const isZero = val === 0;
                            return ( <td key={cIdx} className={`border-b border-slate-700 p-3 ${isHighlight ? 'bg-emerald-600/20 font-bold text-emerald-300' : isZero ? 'text-slate-600' : 'text-slate-400'}`}>{val}</td> );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTable.type === 'scan' && activeTab === 'scan' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead><tr><th className="border-b-2 border-slate-600 p-2 text-slate-300 whitespace-nowrap">Titik (X,Y)</th><th className="border-b-2 border-slate-600 p-2 text-slate-300">Tetangga Terjangkau (d &le; {eps})</th><th className="border-b-2 border-slate-600 p-2 text-slate-300 text-center">n</th><th className="border-b-2 border-slate-600 p-2 text-emerald-400 text-right">Status</th></tr></thead>
                  <tbody>
                    {activeTable.scanRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="border-b border-slate-800 p-2 font-bold text-slate-300 whitespace-nowrap">P{r.point.id} <span className="font-normal text-slate-500">({r.point.x}, {r.point.y})</span></td>
                        <td className="border-b border-slate-800 p-2 text-slate-400 text-[10px]">{r.neighborIds.map(id => `P${id}`).join(', ')}</td>
                        <td className="border-b border-slate-800 p-2 text-center font-bold text-slate-300">{r.count}</td>
                        <td className={`border-b border-slate-800 p-2 text-right font-bold ${r.type === 'core' ? 'text-emerald-400' : r.type === 'border' ? 'text-amber-400' : 'text-rose-400'}`}>{r.type.toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTable.type === 'scan' && activeTab === 'relations' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead><tr><th className="border-b-2 border-slate-600 p-2 text-slate-300">Titik Awal</th><th className="border-b-2 border-slate-600 p-2 text-indigo-300">DDR (Direct Reach)</th><th className="border-b-2 border-slate-600 p-2 text-blue-300">DR (Reach Chain)</th><th className="border-b-2 border-slate-600 p-2 text-emerald-400">DC (Connected)</th></tr></thead>
                  <tbody>
                    {activeTable.relationRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="border-b border-slate-800 p-2 font-bold text-slate-300">P{r.point.id} <span className="text-[10px] font-normal text-slate-500">({r.point.type})</span></td>
                        <td className="border-b border-slate-800 p-2 text-indigo-400 text-[10px]">{r.ddr.length > 0 ? r.ddr.map(id => `P${id}`).join(', ') : '-'}</td>
                        <td className="border-b border-slate-800 p-2 text-blue-400 text-[10px]">{r.dr.length > 0 ? r.dr.map(id => `P${id}`).join(', ') : '-'}</td>
                        <td className="border-b border-slate-800 p-2 text-emerald-400 font-bold text-[10px]">{r.dc.length > 0 ? r.dc.map(id => `P${id}`).join(', ') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTable.type === 'cluster' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead><tr><th className="border-b-2 border-slate-600 p-2 text-slate-300">ID Kelompok</th><th className="border-b-2 border-slate-600 p-2 text-slate-300 text-center">Total n</th><th className="border-b-2 border-slate-600 p-2 text-emerald-400">Daftar Anggota</th></tr></thead>
                  <tbody>
                    {activeTable.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="border-b border-slate-800 p-3 font-bold text-sm" style={{color: r.color}}>{r.clusterId === 'Noise' ? 'NOISE' : `C${(r.clusterId as number) + 1}`}</td>
                        <td className="border-b border-slate-800 p-3 text-center font-bold text-slate-300">{r.members.length}</td>
                        <td className="border-b border-slate-800 p-3">
                          <div className="flex flex-wrap gap-1.5">
                             {r.members.map(m => ( <span key={m.id} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${m.type === 'core' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : m.type === 'border' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>P{m.id} ({m.type.substring(0,1).toUpperCase()})</span> ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}