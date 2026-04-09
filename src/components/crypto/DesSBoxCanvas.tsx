"use client";
import { useState, useRef, useEffect } from 'react';
import { SBOX_1_DATA, SimStatus, SBoxCoord } from './dessbox/DESTypes';
import DESControls from './dessbox/DESControls';
import DESBitSplitter from './dessbox/DESBitSplitter';
import DESSBoxTable from './dessbox/DESSBoxTable';

export default function DesSBoxCanvas() {
  const [inputBin, setInputBin] = useState("101100"); 
  const [isEditing, setIsEditing] = useState(false);
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');
  const [animStep, setAnimStep] = useState(0); 
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanInput = inputBin.replace(/[^01]/g, '').slice(0, 6);
  const isValid = cleanInput.length === 6;

  const rBin = isValid ? cleanInput[0] + cleanInput[5] : "00";
  const rDec = parseInt(rBin, 2);
  const cBin = isValid ? cleanInput.slice(1, 5) : "0000";
  const cDec = parseInt(cBin, 2);
  
  const outDec = isValid ? SBOX_1_DATA[rDec][cDec] : 0;
  const outBin = outDec.toString(2).padStart(4, '0');

  const coordMaster: SBoxCoord = { rDec, cDec, outDec, outBin };
  const MAX_STEP = 4;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); }
  }, []);

  const advanceStep = () => {
    if (simStatus === 'completed' || !isValid) return;
    setAnimStep(prev => {
      if (prev >= MAX_STEP) {
        setSimStatus('completed');
        return MAX_STEP;
      }
      return prev + 1;
    });
  };

  const reverseStep = () => {
    if (simStatus === 'running') setSimStatus('idle');
    setAnimStep(prev => (prev > 0 ? prev - 1 : 0));
    if (simStatus === 'completed') setSimStatus('idle');
  };

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('idle');
    setAnimStep(0);
  };

  const skipSimulation = () => {
    if (!isValid) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('completed');
    setAnimStep(MAX_STEP);
  };

  useEffect(() => {
    if (!isEditing) {
      if (cleanInput !== inputBin) setInputBin(cleanInput);
      resetSimulation(); 
    }
  }, [isEditing, inputBin]);

  useEffect(() => {
    if (simStatus === 'running') {
      intervalRef.current = setInterval(() => {
        advanceStep();
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [simStatus]);

  return (
    // PERBAIKAN: flex-row dengan 'flex-1 min-w-0' di anak-anaknya. Dijamin 50:50 presisi.
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 text-slate-200 overflow-y-auto lg:overflow-hidden pb-10 lg:pb-0 pr-1">
      
      {/* KOLOM KIRI (50% Mutlak) */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 lg:h-full overflow-y-auto beautiful-scrollbar lg:pr-2">
        <DESControls 
          inputBin={inputBin} setInputBin={setInputBin}
          isEditing={isEditing} setIsEditing={setIsEditing}
          simStatus={simStatus} setSimStatus={setSimStatus}
          animStep={animStep} isValid={isValid}
          handleProcess={() => { if(isValid) setSimStatus('running'); }} skipSimulation={skipSimulation}
          resetSimulation={resetSimulation} advanceStep={advanceStep} reverseStep={reverseStep}
        />
        
        <DESBitSplitter 
          inputBin={cleanInput} animStep={animStep} isValid={isValid}
          rowDec={rDec} colDec={cDec}
        />
      </div>

      {/* KOLOM KANAN (50% Mutlak) */}
      <div className="flex-1 min-w-0 flex flex-col lg:h-full min-h-[500px] lg:min-h-0">
        <DESSBoxTable 
          animStep={animStep} simStatus={simStatus}
          coord={coordMaster}
        />
      </div>

    </div>
  );
}