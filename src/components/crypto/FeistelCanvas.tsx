"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { SimStatus, CryptoMode, FeistelLog } from './FeistelTypes';
import FeistelControls from './FeistelControls';
import FeistelCircuit from './FeistelCircuit';
import FeistelLogs from './FeistelLogs';

const pseudoF = (rVal: number, kVal: number) => ((rVal * 7) + kVal) % 65536; 
const toHex = (num: number) => num.toString(16).padStart(4, '0').toUpperCase();
const textToBlocks = (text: string) => {
  const padded = (text + "XXXX").substring(0, 4).toUpperCase();
  const L = (padded.charCodeAt(0) << 8) | padded.charCodeAt(1);
  const R = (padded.charCodeAt(2) << 8) | padded.charCodeAt(3);
  return { L, R, padded };
};

export default function FeistelCanvas() {
  const [inputText, setInputText] = useState("HALO");
  const [masterKey, setMasterKey] = useState("1337"); 
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<CryptoMode>("encrypt");
  const [totalRounds] = useState(4); 
  
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [animStep, setAnimStep] = useState(0); 
  
  const [currentL, setCurrentL] = useState(0);
  const [currentR, setCurrentR] = useState(0);
  const [fOutput, setFOutput] = useState(0);
  
  const [logs, setLogs] = useState<FeistelLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const subKeys = useMemo(() => {
    const baseK = parseInt(masterKey, 16) || 0x1337;
    const keys = [];
    for(let i = 1; i <= totalRounds; i++) {
      keys.push((baseK + (i * 0xABCD)) % 65536);
    }
    return keys;
  }, [masterKey, totalRounds]);

  const getRoundKey = (roundNum: number) => {
    if (mode === 'encrypt') return subKeys[roundNum - 1];
    return subKeys[totalRounds - roundNum]; 
  };

  useEffect(() => {
    if (!isEditing) resetSimulation();
  }, [inputText, mode, masterKey, totalRounds, isEditing]);

  const advanceStep = () => {
    if (simStatus === 'completed') return;
    let step = animStep + 1;
    let round = currentRound;
    
    if (step === 2) {
      setFOutput(pseudoF(currentR, getRoundKey(round)));
    } 
    else if (step === 5) {
      const K = getRoundKey(round);
      const F = pseudoF(currentR, K); 
      setFOutput(F);
      const nextR = (currentL ^ F) >>> 0;
      const nextL = currentR;
      
      setLogs(curr => {
        // Pemotongan ini HANYA terjadi jika user menimpa masa lalu dengan aksi baru
        const slicedLogs = curr.slice(0, round - 1); 
        return [...slicedLogs, {
          round, L_in: toHex(currentL), R_in: toHex(currentR), K: toHex(K), F: toHex(F),
          L_out: toHex(nextL), R_out: toHex(nextR)
        }];
      });
    } 
    else if (step === 6) {
      const F = pseudoF(currentR, getRoundKey(round));
      const nextR = (currentL ^ F) >>> 0;
      const nextL = currentR;

      if (round >= totalRounds) {
        setSimStatus('completed');
        setAnimStep(6);
        return;
      } else {
        step = 0;
        round++;
        setCurrentRound(round);
        setCurrentL(nextL);
        setCurrentR(nextR);
      }
    }
    setAnimStep(step);
  };

  const reverseStep = () => {
    if (simStatus === 'running') setSimStatus('idle'); 
    if (animStep === 0 && currentRound === 1) return;
    
    let step = animStep;
    let round = currentRound;

    if (step === 0 || (step === 6 && simStatus === 'completed')) {
      if (simStatus === 'completed') {
         setSimStatus('idle');
         setAnimStep(5);
         return;
      } else {
         round--;
         setCurrentRound(round);
         setAnimStep(5);
         setLogs(curr => {
           const newLogs = [...curr];
           const lastLog = newLogs.pop();
           if (lastLog) {
             setCurrentL(parseInt(lastLog.L_in, 16));
             setCurrentR(parseInt(lastLog.R_in, 16));
             setFOutput(parseInt(lastLog.F, 16));
           }
           return newLogs;
         });
         return;
      }
    }
    
    if (step === 5) {
      setLogs(curr => {
         const newLogs = [...curr];
         const lastLog = newLogs.pop(); 
         if (lastLog) {
           setCurrentL(parseInt(lastLog.L_in, 16));
           setCurrentR(parseInt(lastLog.R_in, 16));
         }
         return newLogs;
      });
    }

    step--;
    setAnimStep(step);
  };

  // PERBAIKAN 3: Fungsi Time-Travel onClick Log tanpa menghapus sisa array
  const jumpToLog = (roundNum: number) => {
    setSimStatus('idle');
    const targetLog = logs[roundNum - 1];
    if (!targetLog) return;
    
    // Tidak ada lagi log pemotongan (slice) di sini
    setCurrentRound(roundNum);
    setAnimStep(5); 
    setCurrentL(parseInt(targetLog.L_in, 16));
    setCurrentR(parseInt(targetLog.R_in, 16));
    setFOutput(parseInt(targetLog.F, 16));
  };

  useEffect(() => {
    if (simStatus === 'running') {
      const timer = setTimeout(() => advanceStep(), 800);
      return () => clearTimeout(timer);
    }
  }, [simStatus, animStep, currentRound]);

  const resetSimulation = () => {
    setSimStatus('idle');
    const { L, R } = textToBlocks(inputText);
    setCurrentL(L);
    setCurrentR(R);
    setCurrentRound(1);
    setAnimStep(0);
    setFOutput(0);
    setLogs([]);
  };

  const skipSimulation = () => {
    setSimStatus('completed');
    const { L: origL, R: origR } = textToBlocks(inputText);
    let tempL = origL;
    let tempR = origR;
    const fullLogs = [];
    
    for(let r = 1; r <= totalRounds; r++) {
      const K = getRoundKey(r);
      const F = pseudoF(tempR, K);
      const nextR = (tempL ^ F) >>> 0;
      const nextL = tempR;
      
      fullLogs.push({
        round: r, L_in: toHex(tempL), R_in: toHex(tempR), K: toHex(K), F: toHex(F),
        L_out: toHex(nextL), R_out: toHex(nextR)
      });
      tempL = nextL;
      tempR = nextR;
    }
    
    const lastLog = fullLogs[fullLogs.length - 1];
    setCurrentL(parseInt(lastLog.L_in, 16));
    setCurrentR(parseInt(lastLog.R_in, 16));
    setFOutput(parseInt(lastLog.F, 16));
    setLogs(fullLogs);
    setCurrentRound(totalRounds);
    setAnimStep(6);
  };

  return (
    <div className="w-full h-full flex flex-col xl:flex-row gap-6 text-slate-200 overflow-y-auto xl:overflow-hidden pb-10 xl:pb-0 pr-1">
      
      <div className="flex-1 min-w-0 flex flex-col gap-6 xl:h-full overflow-y-auto beautiful-scrollbar xl:pr-2 shrink-0">
        <FeistelControls 
          inputText={inputText} setInputText={setInputText}
          masterKey={masterKey} setMasterKey={setMasterKey}
          mode={mode} setMode={setMode}
          isEditing={isEditing} setIsEditing={setIsEditing}
          simStatus={simStatus} setSimStatus={setSimStatus}
          animStep={animStep} currentRound={currentRound}
          L0Hex={toHex(textToBlocks(inputText).L)} R0Hex={toHex(textToBlocks(inputText).R)}
          handleProcess={() => setSimStatus('running')} skipSimulation={skipSimulation}
          resetSimulation={resetSimulation} advanceStep={advanceStep} reverseStep={reverseStep}
        />
        
        <FeistelCircuit 
          currentRound={currentRound} totalRounds={totalRounds} animStep={animStep}
          currentLHex={toHex(currentL)} currentRHex={toHex(currentR)}
          roundKeyHex={toHex(getRoundKey(currentRound <= totalRounds ? currentRound : totalRounds))}
          fOutputHex={toHex(fOutput)} nextRHex={toHex((currentL ^ fOutput) >>> 0)}
        />
      </div>

      <div className="flex-1 min-w-0 xl:max-w-[45%] flex flex-col xl:h-full min-h-[500px] xl:min-h-0 shrink-0">
        <FeistelLogs 
          logs={logs} simStatus={simStatus} currentRound={currentRound} totalRounds={totalRounds}
          currentLHex={toHex(currentL)} currentRHex={toHex(currentR)} logEndRef={logEndRef}
          jumpToLog={jumpToLog}
        />
      </div>

    </div>
  );
}