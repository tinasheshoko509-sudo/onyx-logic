
import React, { useState, useEffect } from 'react';
import { troubleshootLogic } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { Loader2, Bug, Lightbulb, CheckSquare, Zap } from 'lucide-react';

const Troubleshooter: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!problem) throw new Error('NO_DELTA: Failed logic branch required for resolution.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_RESOLUTION: Completed logic fix required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [problem, result, onAction, registerActions]);

  const handleTroubleshoot = async () => {
    if (!problem) return;
    setLoading(true);
    try {
      const data = await troubleshootLogic(problem);
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Logic Debug Node</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Logic <span className="text-[#0070FF]">Troubleshooter</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Identify and resolve structural failures and logical bifurcations in complex automation chains.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 space-y-6 shadow-xl">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Failed Logic Branch / Error Log</label>
          <textarea 
            className="w-full h-48 bg-white border border-zinc-200 rounded-xl p-4 text-black font-mono text-xs focus:border-[#0070FF] outline-none resize-none transition-all"
            placeholder="e.g. Iteration fails on the 5th item when the array contains a null value..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
          <button 
            onClick={handleTroubleshoot}
            disabled={loading || !problem}
            className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E04E15] transition-all text-[10px] uppercase tracking-widest shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Resolve Logic Delta'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#0070FF]/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Bug size={16} /> Root Cause Detected
                </h4>
                <p className="text-[13px] text-zinc-600 italic bg-black/5 p-4 rounded-xl border border-black/5 font-medium leading-relaxed">"{result.rootCause}"</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-[#0070FF] uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={16} /> Logic Fix Directive
                </h4>
                <div className="bg-white border border-zinc-200 p-5 rounded-xl font-mono text-[11px] text-emerald-500 leading-relaxed shadow-inner">
                  {result.logicFix}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckSquare size={16} /> Prevention Protocol
                </h4>
                <p className="text-[12px] text-zinc-500 italic bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 font-bold uppercase tracking-tight">{result.preventionTip}</p>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-12 text-center glass min-h-[400px]">
              <Bug size={48} className="mb-4 opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black">Debugger IDLE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Troubleshooter;
