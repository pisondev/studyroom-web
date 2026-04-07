"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { BarChart2, Info, Target, Circle, LayoutTemplate, MousePointer2, Calculator, Lock, Unlock } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

type DatasetType = 'blobs' | 'donut';
type AlgorithmType = 'kmeans' | 'dbscan';

type Point = { id: number; x: number; y: number; cluster: number };
type CalcRecord = { 
  point: Point; 
  a: number; 
  b: number; 
  nearestCluster: number; 
  s: number;
  aDetails: { sum: number, count: number };
  bDetails: { cId: number, avgDist: number }[];
};

const CLUSTER_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];
const CANVAS_SIZE = 500; 
const GRID_MAX = 20;
const UNIT = CANVAS_SIZE / GRID_MAX;

export default function SilhouetteEvaluator() {
  const scatterRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<HTMLCanvasElement>(null);

  const [dataset, setDataset] = useState<DatasetType>('donut');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('dbscan');
  
  const [points, setPoints] = useState<Point[]>([]);
  const [results, setResults] = useState<CalcRecord[]>([]);
  
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);
  const [lockedPointId, setLockedPointId] = useState<number | null>(null);

  // Titik yang sedang aktif (Prioritaskan yang dikunci, jika tidak ada, gunakan yang di-hover)
  const activePointId = lockedPointId || hoveredPointId;

  const toCanvasX = useCallback((x: number) => x * UNIT, []);
  const toCanvasY = useCallback((y: number) => CANVAS_SIZE - (y * UNIT), []);
  const getDist = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // 1. GENERATE DATA & SIMULASI CLUSTERING
  const generateData = useCallback(() => {
    const newPoints: Point[] = [];
    let idCounter = 1;

    if (dataset === 'blobs') {
      const centers = [{x: 5, y: 15}, {x: 15, y: 15}, {x: 10, y: 5}];
      centers.forEach((c, cIdx) => {
        for(let i=0; i<15; i++) {
          const x = c.x + (Math.random()-0.5)*5;
          const y = c.y + (Math.random()-0.5)*5;
          newPoints.push({ id: idCounter++, x, y, cluster: cIdx });
        }
      });
    } else if (dataset === 'donut') {
      const cx = 10; const cy = 10;
      for(let i=0; i<35; i++) {
        const angle = Math.random() * Math.PI * 2; const r = 7 + Math.random()*1.5;
        const x = cx + Math.cos(angle)*r; const y = cy + Math.sin(angle)*r;
        let cluster = 0;
        if (algorithm === 'dbscan') cluster = 1; 
        else cluster = x < 10 ? 0 : 1; 
        newPoints.push({ id: idCounter++, x, y, cluster });
      }
      for(let i=0; i<15; i++) {
        const angle = Math.random() * Math.PI * 2; const r = 2 + Math.random()*1;
        const x = cx + Math.cos(angle)*r; const y = cy + Math.sin(angle)*r;
        let cluster = 0;
        if (algorithm === 'dbscan') cluster = 0; 
        else cluster = x < 10 ? 0 : 1; 
        newPoints.push({ id: idCounter++, x, y, cluster });
      }
    }
    
    setPoints(newPoints.map(p => ({...p, x: Math.round(p.x*10)/10, y: Math.round(p.y*10)/10})));
    setLockedPointId(null);
  }, [dataset, algorithm]);

  useEffect(() => { generateData(); }, [generateData]);

  // 2. HITUNG SILHOUETTE SCORE SECARA REAL-TIME
  useEffect(() => {
    if (points.length === 0) return;
    
    const uniqueClusters = Array.from(new Set(points.map(p => p.cluster))).sort((a,b)=>a-b);
    const newResults: CalcRecord[] = points.map(p => {
      // Hitung Kohesi (a)
      const sameCluster = points.filter(o => o.cluster === p.cluster && o.id !== p.id);
      const aSum = sameCluster.reduce((sum, o) => sum + getDist(p, o), 0);
      const aCount = sameCluster.length;
      const a = aCount ? aSum / aCount : 0;

      // Hitung Separasi (b)
      let minB = Infinity; let nearestC = -1;
      const bDetails: {cId: number, avgDist: number}[] = [];
      
      uniqueClusters.forEach(cId => {
        if (cId !== p.cluster) {
          const otherPts = points.filter(o => o.cluster === cId);
          if (otherPts.length) {
            const avgDist = otherPts.reduce((sum, o) => sum + getDist(p, o), 0) / otherPts.length;
            bDetails.push({ cId, avgDist });
            if (avgDist < minB) { minB = avgDist; nearestC = cId; }
          }
        }
      });
      if (minB === Infinity) minB = 0;

      // Hitung S
      let s = 0;
      if (a !== 0 || minB !== 0) s = (minB - a) / Math.max(a, minB);

      return { point: p, a, b: minB, nearestCluster: nearestC, s, aDetails: {sum: aSum, count: aCount}, bDetails };
    });

    setResults(newResults);
  }, [points]);

  // 3. RENDER SCATTER PLOT (KIRI)
  useEffect(() => {
    const canvas = scatterRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_MAX; i+=2) {
      ctx.beginPath(); ctx.moveTo(toCanvasX(i), 0); ctx.lineTo(toCanvasX(i), CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, toCanvasY(i)); ctx.lineTo(CANVAS_SIZE, toCanvasY(i)); ctx.stroke();
    }

    if (activePointId) {
      const hp = points.find(p => p.id === activePointId);
      const res = results.find(r => r.point.id === activePointId);
      if (hp && res) {
        ctx.lineWidth = 1.2;
        points.forEach(op => {
          if (op.cluster === hp.cluster && op.id !== hp.id) {
             ctx.strokeStyle = `${CLUSTER_COLORS[hp.cluster % CLUSTER_COLORS.length]}90`; 
             ctx.beginPath(); ctx.moveTo(toCanvasX(hp.x), toCanvasY(hp.y)); ctx.lineTo(toCanvasX(op.x), toCanvasY(op.y)); ctx.stroke();
          }
        });

        if (res.nearestCluster !== -1) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; ctx.setLineDash([5, 5]);
          points.forEach(op => {
            if (op.cluster === res.nearestCluster) {
               ctx.beginPath(); ctx.moveTo(toCanvasX(hp.x), toCanvasY(hp.y)); ctx.lineTo(toCanvasX(op.x), toCanvasY(op.y)); ctx.stroke();
            }
          });
          ctx.setLineDash([]);
        }
      }
    }

    points.forEach((p) => {
      const isActive = p.id === activePointId;
      const isLocked = p.id === lockedPointId;
      const cx = toCanvasX(p.x); const cy = toCanvasY(p.y);
      const col = CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length];

      if (isActive) { ctx.shadowBlur = 20; ctx.shadowColor = col; }
      ctx.beginPath(); ctx.arc(cx, cy, isActive ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill(); ctx.shadowBlur = 0;
      
      // Jika dikunci, border jadi lebih tebal dan berwarna putih solid
      ctx.strokeStyle = isLocked ? '#ffffff' : isActive ? '#cbd5e1' : '#0f172a'; 
      ctx.lineWidth = isLocked ? 3 : isActive ? 2 : 1; 
      ctx.stroke();
    });
  }, [points, results, activePointId, lockedPointId, toCanvasX, toCanvasY]);

  // 4. RENDER SILHOUETTE PLOT (KANAN)
  useEffect(() => {
    const canvas = plotRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.length === 0) return;

    const sortedResults = [...results].sort((a, b) => {
      if (a.point.cluster !== b.point.cluster) return a.point.cluster - b.point.cluster;
      return b.s - a.s; 
    });

    const marginY = 50; const marginX = 80;
    const plotWidth = CANVAS_SIZE - marginX * 2; const plotHeight = CANVAS_SIZE - marginY * 2;
    const mapS = (val: number) => marginX + ((val + 1) / 2) * plotWidth;
    const zeroX = mapS(0);

    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(marginX - 10, CANVAS_SIZE - marginY); ctx.lineTo(CANVAS_SIZE - marginX + 10, CANVAS_SIZE - marginY); ctx.stroke();
    
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    [-1, -0.5, 0, 0.5, 1].forEach(val => {
      const x = mapS(val);
      ctx.beginPath(); ctx.moveTo(x, CANVAS_SIZE - marginY); ctx.lineTo(x, CANVAS_SIZE - marginY + 5); ctx.stroke();
      ctx.fillText(val.toString(), x, CANVAS_SIZE - marginY + 10);
    });

    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(zeroX, marginY - 10); ctx.lineTo(zeroX, CANVAS_SIZE - marginY); ctx.stroke();

    const barHeight = (plotHeight / sortedResults.length) * 0.8;
    const gap = (plotHeight / sortedResults.length) * 0.2;
    
    sortedResults.forEach((res, index) => {
      const y = marginY + index * (barHeight + gap);
      const barWidth = mapS(res.s) - zeroX;
      const isActive = res.point.id === activePointId;
      const isLocked = res.point.id === lockedPointId;
      
      ctx.fillStyle = CLUSTER_COLORS[res.point.cluster % CLUSTER_COLORS.length];
      
      if (isLocked) { 
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff'; 
      } else if (isActive) {
        ctx.fillStyle = '#cbd5e1'; 
      }
      
      ctx.fillRect(zeroX, y, barWidth, barHeight);
      ctx.shadowBlur = 0;

      if (isActive || isLocked) {
         ctx.fillStyle = isLocked ? '#ffffff' : '#cbd5e1'; ctx.font = isLocked ? 'bold 11px monospace' : '10px monospace';
         ctx.textAlign = res.s >= 0 ? 'right' : 'left';
         ctx.fillText(`P${res.point.id}`, zeroX + barWidth + (res.s >= 0 ? -5 : 5), y + barHeight/2 - 4);
      }
    });

    const globalS = sortedResults.reduce((sum, r) => sum + r.s, 0) / sortedResults.length;
    const globalX = mapS(globalS);
    
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(globalX, marginY - 20); ctx.lineTo(globalX, CANVAS_SIZE - marginY); ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px sans-serif'; 
    ctx.textAlign = globalX > CANVAS_SIZE / 2 ? 'right' : 'left';
    ctx.fillText(`Skor Rata-rata: ${globalS.toFixed(2)}`, globalX + (globalX > CANVAS_SIZE / 2 ? -8 : 8), marginY - 25);

  }, [results, activePointId, lockedPointId]);

  // Fungsi Helper: Mendapatkan ID Titik dari posisi Mouse
  const getPointIdFromMouse = (e: React.MouseEvent<HTMLCanvasElement>, isPlot: boolean): number | null => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / CANVAS_SIZE, rect.height / CANVAS_SIZE);
    const offsetX = (rect.width - CANVAS_SIZE * scale) / 2;
    const offsetY = (rect.height - CANVAS_SIZE * scale) / 2;
    const xPos = (e.clientX - rect.left - offsetX) / scale;
    const yPos = (e.clientY - rect.top - offsetY) / scale;

    if (!isPlot) {
      let foundPId = null; let minD = 15; 
      for (const p of points) { 
        const dist = Math.hypot(toCanvasX(p.x) - xPos, toCanvasY(p.y) - yPos); 
        if (dist < minD) { minD = dist; foundPId = p.id; } 
      }
      return foundPId;
    } else {
      const sortedResults = [...results].sort((a, b) => { if (a.point.cluster !== b.point.cluster) return a.point.cluster - b.point.cluster; return b.s - a.s; });
      const marginY = 50; const plotHeight = CANVAS_SIZE - marginY * 2;
      const barTotalHeight = plotHeight / sortedResults.length;
      if (yPos >= marginY && yPos <= CANVAS_SIZE - marginY) {
        const index = Math.floor((yPos - marginY) / barTotalHeight);
        if (index >= 0 && index < sortedResults.length) return sortedResults[index].point.id;
      }
      return null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, isPlot: boolean) => {
    const pid = getPointIdFromMouse(e, isPlot);
    setHoveredPointId(pid);
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>, isPlot: boolean) => {
    const pid = getPointIdFromMouse(e, isPlot);
    // Jika klik pada titik yang sama, lepaskan kunci. Jika tidak, kunci titik baru.
    if (pid === lockedPointId) {
      setLockedPointId(null);
    } else if (pid !== null) {
      setLockedPointId(pid);
    } else {
      // Klik di tempat kosong melepas kuncian
      setLockedPointId(null);
    }
  };

  const getInsight = () => {
    if (dataset === 'blobs' && algorithm === 'kmeans') return { title: "K-Means + Cembung (Sangat Valid)", desc: "K-Means bekerja sangat baik di sini. Kohesi (a) kecil karena titik mengumpul, Separasi (b) besar karena kelompok saling menjauh. Silhouette Score selaras dengan logika algoritma ini.", status: 'success' };
    if (dataset === 'blobs' && algorithm === 'dbscan') return { title: "DBSCAN + Cembung (Valid)", desc: "DBSCAN berhasil mendeteksi kepadatan kelompok secara akurat. Karena bentuk datanya kebetulan membulat, Silhouette Score juga sepakat dan memberikan nilai positif yang tinggi.", status: 'success' };
    if (dataset === 'donut' && algorithm === 'kmeans') return { title: "K-Means + Donat (Gagal Clustering)", desc: "Lihat plot kiri, K-Means terpaksa membelah cincin jadi dua karena ia hanya peduli jarak ke centroid (pusat). Ironisnya, Silhouette Score tidak sepenuhnya negatif. Ini membuktikan Silhouette bias dan bisa 'tertipu' oleh algoritma partisi.", status: 'warning' };
    if (dataset === 'donut' && algorithm === 'dbscan') return { title: "DBSCAN + Donat (Anomali Validasi!)", desc: "DBSCAN BERHASIL memisahkan cincin dalam dan luar secara sempurna! TAPI lihat plot kanan, banyak nilai negatif. Garis Kohesi (a) terpaksa membelah tengah cincin yang kosong, membuat a > b. Bukti bahwa metrik ini TIDAK BOLEH dipakai untuk bentuk arbitrer.", status: 'danger' };
    return { title: "", desc: "", status: 'default' };
  };
  const insight = getInsight();

  const activeRes = activePointId ? results.find(r => r.point.id === activePointId) : null;

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 pb-4">
      
      {/* HEADER & KONTROL */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700 shadow-lg">
         <div className="flex-1 flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Circle size={12}/> 1. Pola Dataset Ujian</label>
              <div className="[&>div]:!w-full"><CustomDropdown options={[{ value: "blobs", label: "Pola Memusat (Blobs)" }, { value: "donut", label: "Pola Cincin (Donut)" }]} value={dataset} onChange={(val) => setDataset(val as DatasetType)} /></div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Target size={12}/> 2. Algoritma Clustering</label>
              <div className="[&>div]:!w-full"><CustomDropdown options={[{ value: "kmeans", label: "K-Means" }, { value: "dbscan", label: "DBSCAN" }]} value={algorithm} onChange={(val) => setAlgorithm(val as AlgorithmType)} /></div>
            </div>
         </div>
         
         <div className={`flex-[2] p-3 rounded-xl border flex gap-3 items-start animate-in fade-in transition-colors duration-500 ${insight.status === 'success' ? 'bg-emerald-900/30 border-emerald-500/50' : insight.status === 'warning' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-rose-900/30 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.15)]'}`}>
            <Info size={24} className={`shrink-0 ${insight.status === 'success' ? 'text-emerald-400' : insight.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}/>
            <div>
               <h4 className={`font-bold text-sm mb-1 ${insight.status === 'success' ? 'text-emerald-300' : insight.status === 'warning' ? 'text-amber-300' : 'text-rose-300'}`}>{insight.title}</h4>
               <p className="text-slate-300 text-xs leading-relaxed">{insight.desc}</p>
            </div>
         </div>
      </div>

      {/* DUAL CANVAS AREA */}
      <div className="flex-1 shrink-0 flex flex-col md:flex-row gap-4 min-h-[350px]">
        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner relative p-2">
           <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
             <span className="text-xs font-bold text-slate-300 bg-slate-900/80 px-2 py-1 rounded inline-flex items-center gap-2"><LayoutTemplate size={14}/> Visualisasi Koordinat</span>
             <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded inline-flex items-center gap-1"><MousePointer2 size={10}/> Klik titik untuk kunci (lock) kalkulasi</span>
           </div>
           <canvas 
             ref={scatterRef} 
             onMouseMove={(e) => handleMouseMove(e, false)} 
             onMouseLeave={() => setHoveredPointId(null)} 
             onClick={(e) => handleMouseClick(e, false)}
             className="w-full h-full object-contain cursor-crosshair transition-all" 
           />
        </div>

        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner relative p-2">
           <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <span className="text-xs font-bold text-slate-300 bg-slate-900/80 px-2 py-1 rounded inline-flex items-center gap-2"><BarChart2 size={14}/> Grafik Plot Silhouette</span>
           </div>
           <canvas 
             ref={plotRef} 
             onMouseMove={(e) => handleMouseMove(e, true)} 
             onMouseLeave={() => setHoveredPointId(null)} 
             onClick={(e) => handleMouseClick(e, true)}
             className="w-full h-full object-contain cursor-crosshair transition-all" 
           />
        </div>
      </div>

      {/* PANEL BEDAH KALKULASI (Real-time / Locked State) */}
      <div className="shrink-0 bg-slate-900/90 border border-slate-700 rounded-xl p-4 min-h-[160px] flex flex-col justify-center transition-all duration-300">
         {activeRes ? (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
             
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col justify-center relative overflow-hidden">
               <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1 relative z-10">
                 {lockedPointId ? <Lock size={12} className="text-indigo-400"/> : <Unlock size={12} className="text-slate-500"/>} 
                 {lockedPointId ? 'Terkunci' : 'Preview Hover'}
               </div>
               <div className="text-2xl font-bold text-white flex items-center gap-2 relative z-10 mt-1">
                 <span className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: CLUSTER_COLORS[activeRes.point.cluster % CLUSTER_COLORS.length]}}></span>
                 P{activeRes.point.id} 
               </div>
               <div className="text-xs text-slate-400 mt-2 relative z-10 bg-slate-900/50 inline-block px-2 py-1 rounded">Posisi: ({activeRes.point.x}, {activeRes.point.y})</div>
             </div>

             <div className="bg-slate-800/50 p-3 rounded-lg border border-amber-500/30 flex flex-col">
               <div className="text-[10px] text-amber-400 uppercase font-bold mb-2 border-b border-amber-500/20 pb-1">Langkah 1: Kohesi (a)</div>
               <div className="text-[10px] text-slate-300 mb-1 leading-tight">Rata-rata jarak ke {activeRes.aDetails.count} teman sekelompok (C{activeRes.point.cluster+1}):</div>
               <div className="text-xs font-mono text-slate-400 mb-1 flex-1">Σd / n = {activeRes.aDetails.sum.toFixed(1)} / {activeRes.aDetails.count}</div>
               <div className="text-lg font-mono font-bold text-amber-300 mt-auto">a = {activeRes.a.toFixed(2)}</div>
             </div>

             <div className="bg-slate-800/50 p-3 rounded-lg border border-rose-500/30 flex flex-col">
               <div className="text-[10px] text-rose-400 uppercase font-bold mb-2 border-b border-rose-500/20 pb-1">Langkah 2: Separasi (b)</div>
               <div className="text-[10px] text-slate-300 mb-1 leading-tight">Rata-rata jarak ke kelompok luar:</div>
               <div className="text-[9px] font-mono text-slate-400 mb-2 flex-1 flex flex-col gap-0.5">
                  {activeRes.bDetails.map(d => (
                    <span key={d.cId} className={d.cId === activeRes.nearestCluster ? 'text-rose-300 font-bold bg-rose-500/10 px-1 rounded' : 'px-1'}>
                      Ke C{d.cId+1} = {d.avgDist.toFixed(2)} {d.cId === activeRes.nearestCluster ? '✓(Min)' : ''}
                    </span>
                  ))}
               </div>
               <div className="text-lg font-mono font-bold text-rose-300 mt-auto">b = {activeRes.b.toFixed(2)}</div>
             </div>

             <div className={`p-3 rounded-lg border flex flex-col ${activeRes.s > 0.5 ? 'bg-emerald-900/30 border-emerald-500/50' : activeRes.s > 0 ? 'bg-amber-900/30 border-amber-500/50' : 'bg-rose-900/30 border-rose-500/50'}`}>
               <div className={`text-[10px] uppercase font-bold mb-2 border-b pb-1 ${activeRes.s > 0.5 ? 'text-emerald-400 border-emerald-500/20' : activeRes.s > 0 ? 'text-amber-400 border-amber-500/20' : 'text-rose-400 border-rose-500/20'}`}>Langkah 3: Skor (S)</div>
               <div className="text-[10px] text-slate-300 mb-1 font-mono leading-tight">S = (b - a) / max(a, b)<br/>S = ({activeRes.b.toFixed(2)} - {activeRes.a.toFixed(2)}) / {Math.max(activeRes.a, activeRes.b).toFixed(2)}</div>
               <div className={`text-2xl font-mono font-bold mt-1 ${activeRes.s > 0.5 ? 'text-emerald-300' : activeRes.s > 0 ? 'text-amber-300' : 'text-rose-300'}`}>
                 S = {activeRes.s.toFixed(2)}
               </div>
               <div className={`text-[9px] font-bold mt-auto pt-2 border-t border-slate-700/50 ${activeRes.s > 0.5 ? 'text-emerald-400' : activeRes.s > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                 {activeRes.s > 0.5 ? '✓ SANGAT BAIK: Titik padat di tengah kelompoknya.' : 
                  activeRes.s > 0 ? '⚠ CUKUP/BORDERLINE: Titik berada di perbatasan tepi kelompok.' : 
                  '❌ SALAH KAMAR: Lebih dekat ke kelompok tetangga / Bias Algoritma.'}
               </div>
             </div>

           </div>
         ) : (
           <div className="flex flex-col items-center justify-center text-slate-500 gap-2 h-full animate-pulse">
             <Calculator size={32} className="opacity-50" />
             <span className="text-sm font-medium">Hover atau Klik salah satu titik untuk mengunci bedah kalkulasi di sini.</span>
           </div>
         )}
      </div>

    </div>
  );
}