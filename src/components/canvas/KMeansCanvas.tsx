"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ArrowRight, TerminalSquare, Calculator, Table2, ArrowLeft, Eye, EyeOff, Target, Crosshair, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, Edit3, Plus, Trash2, Save } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

type Point = { id: number; x: number; y: number; cluster?: number };
type Centroid = { id: number; x: number; y: number; color: string };
type Step = 'idle' | 'assign' | 'update' | 'converged';

type DistRecord = { point: Point; dists: number[]; cluster: number };
type UpdateRecord = { cId: number; old: {x:number,y:number}; new: {x:number,y:number}; count: number; sumX: number; sumY: number; color: string };
type TableData = 
  | { type: 'dist'; records: DistRecord[]; centroids: Centroid[]; title: string }
  | { type: 'update'; records: UpdateRecord[]; title: string };

type LogEntry = { type: 'init' | 'assign' | 'update' | 'converged'; title: string; desc: string; tableData?: TableData };

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const GRID_MAX = 20; 
const GRID_RENDER = 21; 
const CANVAS_SIZE = 504; 
const UNIT = CANVAS_SIZE / GRID_RENDER; 

export default function KMeansCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // States Utama
  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [step, setStep] = useState<Step>('idle');
  
  const [kStr, setKStr] = useState("3");
  const [numPointsStr, setNumPointsStr] = useState("10"); // Diubah ke string untuk handle input keyboard
  const k = parseInt(kStr) || 3;
  const numPoints = parseInt(numPointsStr) || 0;
  
  const [iteration, setIteration] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  
  // UI States
  const [showCoords, setShowCoords] = useState(false);
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);
  const [hoveredCentroidId, setHoveredCentroidId] = useState<number | null>(null);
  const [activeTable, setActiveTable] = useState<TableData | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const toCanvasX = useCallback((x: number) => x * UNIT, []);
  const toCanvasY = useCallback((y: number) => CANVAS_SIZE - (y * UNIT), []); 

  // Auto-scroll ke bawah saat ada log baru
  useEffect(() => {
    if (logContainerRef.current && !activeTable && !showEditor) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, activeTable, showEditor, expandedLogs]);

  // Generate Data Acak
  const generateData = useCallback((forcedNum?: number) => {
    const targetNum = forcedNum !== undefined ? forcedNum : numPoints;
    const newPoints: Point[] = [];
    for (let i = 0; i < targetNum; i++) {
      const rx = Math.round((Math.random() * 19 + 0.5) * 2) / 2; 
      const ry = Math.round((Math.random() * 19 + 0.5) * 2) / 2;
      newPoints.push({ id: i + 1, x: rx, y: ry });
    }
    setPoints(newPoints);
    resetState();
  }, [numPoints]);

  useEffect(() => { generateData(); }, []); // Run once on mount

  const resetState = () => { 
    // Centroid hanya direset jika tidak dalam mode manual yang diatur oleh user
    setCentroids([]); setStep('idle'); setIteration(0); setLogs([]); setActiveTable(null); setExpandedLogs([]);
    setPoints(prev => prev.map(p => ({ ...p, cluster: undefined }))); 
  };

  const handleNextStep = () => {
    if (step === 'idle' || step === 'converged') {
      let initCentroids = [...centroids];
      
      // Jika user tidak mengatur centroid manual di editor, buat acak dari titik
      if (initCentroids.length === 0) {
        if (points.length === 0) return; // Mencegah error jika data kosong
        const shuffled = [...points].sort(() => 0.5 - Math.random());
        initCentroids = shuffled.slice(0, Math.min(k, points.length)).map((p, i) => ({ id: i + 1, x: p.x, y: p.y, color: COLORS[i] }));
      } else {
        // Jika manual, pastikan warnanya terisi
        initCentroids = initCentroids.map((c, i) => ({...c, color: COLORS[i % COLORS.length]}));
        setKStr(initCentroids.length.toString()); // Sesuaikan K dengan jumlah centroid manual
      }

      setCentroids(initCentroids); setStep('assign'); setIteration(1);
      
      const initLogs = initCentroids.map((c, i) => `C${c.id}(${c.x}, ${c.y})`).join(" | ");
      const newLogIdx = logs.length;
      setLogs([{ type: 'init', title: "Tahap Awal: Inisialisasi", desc: `Menggunakan ${initCentroids.length} titik sebagai acuan centroid awal:\n${initLogs}` }]);
      setExpandedLogs([newLogIdx]); // Expand otomatis log baru
    
    } else if (step === 'assign') {
      const distRecords: DistRecord[] = [];
      const newPoints = points.map(p => {
        let minSqDist = Infinity; let cluster = 0; const dists: number[] = [];
        centroids.forEach((c, i) => {
          const sqDist = Math.round((Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2)) * 100) / 100;
          dists.push(sqDist);
          if (sqDist < minSqDist) { minSqDist = sqDist; cluster = i; }
        });
        distRecords.push({ point: p, dists, cluster });
        return { ...p, cluster };
      });
      setPoints(newPoints); setStep('update');
      
      const newLogIdx = logs.length;
      setLogs(prev => [...prev, { 
        type: 'assign', title: `Iterasi ${iteration} > Hitung Jarak Terdekat`, desc: `Mengelompokkan titik ke centroid terdekat (nilai d² terkecil).`,
        tableData: { type: 'dist', records: distRecords, centroids: [...centroids], title: `Tabel Jarak (Iterasi ${iteration})` }
      }]);
      setExpandedLogs(prev => [...prev, newLogIdx]);
    
    } else if (step === 'update') {
      let moved = false; const updateRecords: UpdateRecord[] = [];
      const newCentroids = centroids.map((c, i) => {
        const clusterPoints = points.filter(p => p.cluster === i);
        if (clusterPoints.length === 0) {
          updateRecords.push({ cId: c.id, old: {x: c.x, y: c.y}, new: {x: c.x, y: c.y}, count: 0, sumX: 0, sumY: 0, color: c.color });
          return c;
        }

        const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
        const newX = Math.round((sumX / clusterPoints.length) * 100) / 100;
        const newY = Math.round((sumY / clusterPoints.length) * 100) / 100;

        updateRecords.push({ cId: c.id, old: {x: c.x, y: c.y}, new: {x: newX, y: newY}, count: clusterPoints.length, sumX, sumY, color: c.color });
        if (Math.abs(newX - c.x) > 0.01 || Math.abs(newY - c.y) > 0.01) moved = true;
        
        return { ...c, x: newX, y: newY };
      });

      setCentroids(newCentroids);
      const newLogIdx = logs.length;
      setLogs(prev => [...prev, { 
        type: 'update', title: `Iterasi ${iteration} > Hitung Pusat Baru (Mean)`, desc: `Memindahkan posisi centroid ke titik rata-rata (mean) klaster.`,
        tableData: { type: 'update', records: updateRecords, title: `Tabel Pergeseran (Iterasi ${iteration})` }
      }]);
      setExpandedLogs(prev => [...prev, newLogIdx]);
      
      if (moved) { setIteration(prev => prev + 1); setStep('assign'); } 
      else { 
        setStep('converged'); 
        setLogs(prev => [...prev, { type: 'converged', title: "Konvergensi Tercapai", desc: "Tidak ada perubahan klaster & centroid. Algoritma K-Means Selesai." }]); 
        setExpandedLogs(prev => [...prev, newLogIdx + 1]);
      }
    }
  };

  const handleNumPointsChange = (valStr: string) => {
    setNumPointsStr(valStr);
    const val = parseInt(valStr);
    if (!isNaN(val) && val >= 0 && val <= 20) {
      generateData(val);
    }
  };

  const toggleLog = (index: number) => {
    setExpandedLogs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'init': return <Target size={14} className="text-amber-400" />;
      case 'assign': return <Crosshair size={14} className="text-blue-400" />;
      case 'update': return <TrendingUp size={14} className="text-indigo-400" />;
      case 'converged': return <CheckCircle2 size={14} className="text-emerald-400" />;
      default: return <ArrowRight size={14} className="text-slate-400" />;
    }
  };

  // Hover detection Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let foundPId = null; let foundCId = null;
    for (const c of centroids) { if (Math.hypot(toCanvasX(c.x) - mouseX, toCanvasY(c.y) - mouseY) < 15) { foundCId = c.id; break; } }
    if (!foundCId) { for (const p of points) { if (Math.hypot(toCanvasX(p.x) - mouseX, toCanvasY(p.y) - mouseY) < 10) { foundPId = p.id; break; } } }
    setHoveredCentroidId(foundCId); setHoveredPointId(foundPId);
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.fillStyle = '#64748b'; ctx.font = '10px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

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

    if (step === 'update' || step === 'converged') {
      ctx.lineWidth = 1;
      points.forEach(p => {
        if (p.cluster !== undefined && centroids[p.cluster]) {
          ctx.strokeStyle = centroids[p.cluster].color + '60';
          ctx.beginPath(); ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y)); ctx.lineTo(toCanvasX(centroids[p.cluster].x), toCanvasY(centroids[p.cluster].y)); ctx.stroke();
        }
      });
    }

    points.forEach((p) => {
      const cx = toCanvasX(p.x); const cy = toCanvasY(p.y);
      const isHovered = p.id === hoveredPointId;
      
      if (isHovered) { ctx.shadowBlur = 12; ctx.shadowColor = p.cluster !== undefined ? centroids[p.cluster]?.color : '#ffffff'; }
      ctx.beginPath(); ctx.arc(cx, cy, isHovered ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = p.cluster !== undefined && step !== 'idle' ? centroids[p.cluster]?.color : '#94a3b8';
      ctx.fill(); ctx.shadowBlur = 0; 
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.stroke();
      
      if (showCoords || isHovered) {
        ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1'; ctx.font = isHovered ? 'bold 11px monospace' : '10px monospace';
        ctx.textAlign = 'left'; ctx.fillText(`P${p.id}(${p.x},${p.y})`, cx + 8, cy - 8);
      }
    });

    centroids.forEach(c => {
      const cx = toCanvasX(c.x); const cy = toCanvasY(c.y);
      const isHovered = c.id === hoveredCentroidId;

      if (isHovered) { ctx.shadowBlur = 15; ctx.shadowColor = c.color || '#fff'; }
      ctx.fillStyle = c.color || '#fff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(cx - 4, cy - 4, 8, 8); 
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; 
      
      const labelText = (showCoords || isHovered) ? `C${c.id}(${c.x},${c.y})` : `C${c.id}`;
      ctx.fillStyle = '#ffffff'; ctx.font = isHovered ? 'bold 12px monospace' : 'bold 11px monospace'; ctx.textAlign = 'left';
      ctx.fillText(labelText, cx + 8, cy + 12);
    });
  }, [points, centroids, step, showCoords, hoveredPointId, hoveredCentroidId, toCanvasX, toCanvasY]);

  const kOptions = [ { value: "2", label: "K = 2" }, { value: "3", label: "K = 3" }, { value: "4", label: "K = 4" } ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      {/* KIRI: Visualisasi Grid Cartesian */}
      <div className="flex-1 lg:w-3/5 flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-700/50">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Calculator size={18} className="text-emerald-400"/> Bidang Koordinat (0-20)
          </h3>
          <button onClick={() => setShowCoords(!showCoords)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${showCoords ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
            {showCoords ? <><Eye size={14}/> Label ON</> : <><EyeOff size={14}/> Label OFF</>}
          </button>
        </div>
        
        <div className="flex-1 w-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center p-2 relative">
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseLeave={() => {setHoveredCentroidId(null); setHoveredPointId(null);}} className="max-h-full max-w-full object-contain cursor-crosshair transition-all" style={{ aspectRatio: '1/1' }} />
        </div>
      </div>

      {/* KANAN: Terminal / Panel Data */}
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

        {/* --- VIEW: MAIN CONTROL & LOGS --- */}
        {!activeTable && !showEditor && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-left-2 duration-200">
            <div className="shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col gap-4 z-10">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Jml. Centroid</label>
                  <div className="w-full [&>div]:!w-full [&>div]:!min-w-0">
                    <CustomDropdown options={kOptions} value={kStr} onChange={(val) => { setKStr(val); resetState(); }} disabled={step !== 'idle'}/>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2 justify-center mt-1 sm:mt-0">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Banyak Data</label>
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      <input 
                        type="number" min="0" max="20" value={numPointsStr} disabled={step !== 'idle'}
                        onChange={(e) => handleNumPointsChange(e.target.value)} 
                        className="w-8 bg-transparent text-emerald-400 font-bold text-right outline-none disabled:opacity-50"
                      />
                      <span className="text-[10px] text-emerald-500/70 font-bold">Titik</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="20" step="1" value={numPoints} onChange={(e) => handleNumPointsChange(e.target.value)} disabled={step !== 'idle'} className="accent-emerald-500"/>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => generateData()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-colors" title="Acak Data"><RotateCcw size={18} /></button>
                <button onClick={handleNextStep} disabled={step === 'converged'} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-400/50">
                  {step === 'converged' ? 'SELESAI' : step === 'idle' ? 'MULAI HITUNG' : 'LANGKAH BERIKUTNYA'} {!step.includes('converged') && <ArrowRight size={18} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex flex-col gap-3 pb-4">
                {logs.length === 0 && <span className="text-slate-600 text-xs text-center py-4 border border-dashed border-slate-700 rounded-lg">Menunggu eksekusi data...</span>}
                {logs.map((log, index) => {
                  const isExpanded = expandedLogs.includes(index);
                  return (
                    <div key={index} className="flex flex-col gap-1 text-xs animate-in fade-in duration-300">
                      <button onClick={() => toggleLog(index)} className="w-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors rounded-lg border border-slate-700/50 flex items-center justify-between px-3 py-2.5 shadow-sm group">
                        <div className="flex items-center gap-2">
                          {getLogIcon(log.type)}
                          <span className="font-bold text-[11px] md:text-xs uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors">{log.title}</span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
                      </button>
                      
                      {isExpanded && (
                        <div className="w-full pl-2 mt-1 border-l-2 border-slate-800/80 ml-2 animate-in slide-in-from-top-1 fade-in duration-200">
                          <div className="text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 mb-2 whitespace-pre-wrap">{log.desc}</div>
                          {log.tableData && (
                            <button onClick={() => setActiveTable(log.tableData!)} className="w-full mb-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-colors font-bold shadow-sm">
                              <Table2 size={14}/> Lihat Detail Tabel Kelompok
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

        {/* --- VIEW: EDITOR KOORDINAT MANUAL --- */}
        {showEditor && (
          <div className="flex-1 flex flex-col bg-[#0f172a] animate-in slide-in-from-bottom-4 duration-200 absolute inset-0 z-30">
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shadow-md shrink-0">
               <span className="font-bold text-slate-200 text-xs flex items-center gap-2"><Edit3 size={14} className="text-indigo-400"/> Editor Setelan UTS</span>
               <button onClick={() => {setShowEditor(false); setNumPointsStr(points.length.toString());}} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors">
                  <Save size={14}/> Simpan & Tutup
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
               {/* Bagian Titik Data */}
               <section>
                 <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                   <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Titik Data ({points.length}/20)</h4>
                   <button onClick={() => { if(points.length < 20) { const newId = points.length > 0 ? Math.max(...points.map(p=>p.id)) + 1 : 1; setPoints([...points, {id: newId, x: 5, y: 5}]); } }} disabled={points.length >= 20} className="flex items-center gap-1 text-[10px] bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded text-slate-200 transition-colors">
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
                   {points.length === 0 && <span className="text-[10px] text-slate-500 italic">Tidak ada titik data.</span>}
                 </div>
               </section>

               {/* Bagian Centroid Manual */}
               <section>
                 <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                   <div className="flex flex-col">
                     <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Centroid Awal</h4>
                     <span className="text-[9px] text-slate-500 leading-tight">Kosongkan jika ingin centroid dipilih otomatis. (Max 5)</span>
                   </div>
                   <button onClick={() => { if(centroids.length < 5) { const newId = centroids.length > 0 ? Math.max(...centroids.map(c=>c.id)) + 1 : 1; setCentroids([...centroids, {id: newId, x: 10, y: 10, color: COLORS[centroids.length]}]); } }} disabled={centroids.length >= 5} className="flex items-center gap-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-colors shadow-sm">
                     <Plus size={12}/> Centroid Baru
                   </button>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                   {centroids.map((c, idx) => (
                     <div key={c.id} className="flex items-center gap-2 bg-slate-800/80 p-2 rounded border border-slate-700 shadow-sm" style={{ borderLeftWidth: '4px', borderLeftColor: c.color }}>
                       <span className="text-[10px] font-bold w-5" style={{ color: c.color }}>C{c.id}</span>
                       <div className="flex flex-1 gap-2">
                          <div className="flex items-center flex-1 bg-slate-900 border border-slate-700 rounded overflow-hidden">
                            <span className="text-[10px] text-slate-500 px-1.5 bg-slate-800 border-r border-slate-700">X</span>
                            <input type="number" step="0.1" value={c.x} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newCen = [...centroids]; newCen[idx].x = Math.max(0, Math.min(20, val)); setCentroids(newCen); } }} className="w-full bg-transparent px-2 py-1 text-[10px] text-slate-200 outline-none" />
                          </div>
                          <div className="flex items-center flex-1 bg-slate-900 border border-slate-700 rounded overflow-hidden">
                            <span className="text-[10px] text-slate-500 px-1.5 bg-slate-800 border-r border-slate-700">Y</span>
                            <input type="number" step="0.1" value={c.y} onChange={(e) => { const val = parseFloat(e.target.value); if(!isNaN(val)) { const newCen = [...centroids]; newCen[idx].y = Math.max(0, Math.min(20, val)); setCentroids(newCen); } }} className="w-full bg-transparent px-2 py-1 text-[10px] text-slate-200 outline-none" />
                          </div>
                       </div>
                       <button onClick={() => setCentroids(centroids.filter(ct => ct.id !== c.id))} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"><Trash2 size={14}/></button>
                     </div>
                   ))}
                   {centroids.length === 0 && <span className="text-[10px] text-slate-500 italic bg-slate-900/50 p-2 rounded border border-slate-800">Centroid akan diinisialisasi otomatis saat eksekusi dimulai.</span>}
                 </div>
               </section>
            </div>
          </div>
        )}

        {/* --- VIEW: TABEL DETAIL --- */}
        {activeTable && !showEditor && (
          <div className="flex-1 flex flex-col bg-[#0f172a] animate-in slide-in-from-right-4 duration-200 absolute inset-0 z-20">
            <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shadow-md">
              <button onClick={() => setActiveTable(null)} className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-bold">
                <ArrowLeft size={14}/> Kembali
              </button>
              <span className="font-bold text-indigo-400 text-[10px] sm:text-xs uppercase tracking-widest truncate max-w-[150px] sm:max-w-none ml-2 text-right">{activeTable.title}</span>
            </div>
            
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {activeTable.type === 'dist' ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-slate-600 p-2 text-slate-300 whitespace-nowrap">Titik Data</th>
                      {activeTable.centroids.map(c => <th key={c.id} className="border-b-2 border-slate-600 p-2 whitespace-nowrap" style={{color: c.color}}>d² ke C{c.id}</th>)}
                      <th className="border-b-2 border-slate-600 p-2 text-emerald-400 text-right">Ditugaskan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTable.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="border-b border-slate-800 p-2 font-bold text-slate-300 whitespace-nowrap">P{r.point.id} <span className="font-normal text-slate-500">({r.point.x}, {r.point.y})</span></td>
                        {r.dists.map((d, j) => <td key={j} className={`border-b border-slate-800 p-2 ${j === r.cluster ? 'bg-slate-800/80 font-bold' : 'text-slate-400'}`}>{d.toFixed(2)}</td>)}
                        <td className="border-b border-slate-800 p-2 text-right font-bold" style={{color: activeTable.centroids[r.cluster].color}}>C{r.cluster + 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-slate-600 p-2 text-slate-300">Klaster</th>
                      <th className="border-b-2 border-slate-600 p-2 text-slate-300 text-center">n (Anggota)</th>
                      <th className="border-b-2 border-slate-600 p-2 text-slate-300 whitespace-nowrap">Σx / Σy</th>
                      <th className="border-b-2 border-slate-600 p-2 text-emerald-400">Pusat Baru (Mean)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTable.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="border-b border-slate-800 p-3 font-bold text-lg" style={{color: r.color}}>C{r.cId}</td>
                        <td className="border-b border-slate-800 p-3 text-center font-bold text-slate-300">{r.count}</td>
                        <td className="border-b border-slate-800 p-3 text-slate-400 whitespace-nowrap">{Math.round(r.sumX*10)/10} / {Math.round(r.sumY*10)/10}</td>
                        <td className="border-b border-slate-800 p-3">
                          <div className="font-bold text-slate-200">({r.new.x}, {r.new.y})</div>
                          {r.count > 0 && <div className="text-[10px] text-slate-500 mt-1">{Math.round(r.sumX*10)/10}/{r.count} , {Math.round(r.sumY*10)/10}/{r.count}</div>}
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