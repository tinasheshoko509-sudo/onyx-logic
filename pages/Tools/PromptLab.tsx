
import React, { useState, useEffect } from 'react';
import { refinePrompt, reinforcePrompt } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { useLocation } from 'react-router-dom';
import { 
  Loader2, 
  Beaker, 
  Copy, 
  Check,
  Terminal, 
  AlertCircle, 
  Lightbulb, 
  CheckCircle2,
  CornerDownLeft,
  Target,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2
} from 'lucide-react';

const PromptLab: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const location = useLocation();
  const [rawPrompt, setRawPrompt] = useState('');
  const [desiredOutput, setDesiredOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reinforcing, setReinforcing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedPointers, setSelectedPointers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const { registerActions } = useProtocol();

  useEffect(() => {
    if (location.state?.extractedInput) {
      setRawPrompt(location.state.extractedInput);
    }
  }, [location.state]);

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!rawPrompt) throw new Error('NO_INPUT: Experimental prompt required.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_RESULT: Refined protocol required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        onAction();
      }
    });
  }, [rawPrompt, result, onAction, registerActions]);

  const handleRefine = async () => {
    if (!rawPrompt || loading) return;
    setLoading(true);
    try {
      const data = await refinePrompt(rawPrompt, desiredOutput || "Optimal clarity");
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReinforce = async () => {
    if (!result || selectedPointers.length === 0 || reinforcing) return;
    setReinforcing(true);
    try {
      const data = await reinforcePrompt(result.refinedPrompt, selectedPointers);
      setResult({ ...result, refinedPrompt: data.refinedPrompt, explanation: data.explanation });
      setSelectedPointers([]);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setReinforcing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Prompt Laboratory</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Prompt Engineering <span className="text-[#0070FF]">Lab</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Neural diagnostic and structural refinement for high-precision automation directives.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 space-y-6 shadow-xl transition-all duration-500">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block px-1">Experimental Prompt</label>
              <textarea 
                className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-5 text-black text-sm focus:border-[#0070FF] outline-none resize-none transition-all placeholder:text-zinc-900"
                placeholder="Extract names and addresses..."
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block px-1">Objective</label>
              <div className="relative">
                <input 
                  className="w-full bg-white border border-zinc-200 rounded-xl py-4 pl-12 pr-6 text-black text-sm focus:border-[#0070FF] outline-none transition-all placeholder:text-zinc-900"
                  placeholder="Integration use case..."
                  value={desiredOutput}
                  onChange={(e) => setDesiredOutput(e.target.value)}
                />
                <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
              </div>
            </div>
          </div>
          <button onClick={handleRefine} disabled={loading || !rawPrompt} className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] shadow-lg">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <><Beaker size={16} /> Initiate Refinement</>}
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-[#0A0A0A] p-5 rounded-xl border border-red-500/20 space-y-3 shadow-lg">
                <h4 className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-2 px-1"><AlertCircle size={16} /> Diagnostics</h4>
                <ul className="space-y-2">
                  {result.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-600 pl-3 border-l-2 border-red-900/50 py-1 font-medium">{w}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#0070FF]/20 space-y-4 shadow-lg">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[9px] font-black text-[#0070FF] uppercase tracking-[0.4em] flex items-center gap-2"><CheckCircle2 size={16} /> Optimized Protocol</h4>
                  <button onClick={() => { navigator.clipboard.writeText(result.refinedPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[9px] font-black uppercase text-zinc-600 hover:text-black transition-colors">{copied ? 'Synced' : 'Clone'}</button>
                </div>
                <div className="bg-black/5 border border-zinc-200 p-5 rounded-xl text-[13px] text-zinc-800 leading-relaxed italic shadow-inner">
                  {result.refinedPrompt}
                </div>
                {result.improvementPointers.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                      {result.improvementPointers.map((p: string, i: number) => (
                        <button key={i} onClick={() => setSelectedPointers(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${selectedPointers.includes(p) ? 'bg-blue-500 text-black border-blue-500' : 'glass border-black/5 text-zinc-500 hover:text-zinc-700'}`}>{p}</button>
                      ))}
                   </div>
                )}
                {selectedPointers.length > 0 && (
                  <button onClick={handleReinforce} className="w-full py-3 bg-blue-500 text-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Reinforce Logic</button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-black/5 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-12 text-center min-h-[400px] glass">
              <Beaker size={40} className="mb-4 opacity-10 text-[#0070FF]" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-black">Ready for directive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptLab;
