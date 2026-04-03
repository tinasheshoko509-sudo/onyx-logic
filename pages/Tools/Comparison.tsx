
import React, { useState } from 'react';
import { compareTools } from '../../services/gemini';
import { Loader2, Zap, Scale, CornerDownLeft } from 'lucide-react';

const Comparison: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [toolA, setToolA] = useState('');
  const [toolB, setToolB] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCompare = async () => {
    if (!toolA || !toolB || loading) return;
    setLoading(true);
    try {
      const data = await compareTools(toolA, toolB, useCase);
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCompare();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Market Intelligence Core</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Tool <span className="text-[#0070FF]">Comparison</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Analyze the structural advantages and logical capabilities of competing automation stacks.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 space-y-6 shadow-2xl h-fit">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Platform A</label>
              <input 
                className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:border-[#0070FF] outline-none transition-all"
                placeholder="e.g. Make.com"
                value={toolA}
                onChange={(e) => setToolA(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Platform B</label>
              <input 
                className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:border-[#0070FF] outline-none transition-all"
                placeholder="e.g. Zapier"
                value={toolB}
                onChange={(e) => setToolB(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Specific Use Case</label>
            <div className="relative group">
              <textarea 
                className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:border-[#0070FF] outline-none h-32 resize-none transition-all"
                placeholder="e.g. Processing 10k leads/mo with complex logic branching..."
                value={useCase}
                onKeyDown={handleKeyDown}
                onChange={(e) => setUseCase(e.target.value)}
              />
              <button 
                onClick={handleCompare}
                disabled={loading || !toolA || !toolB}
                className="absolute bottom-3 right-3 p-2 bg-zinc-100/90 border border-zinc-200 rounded-lg text-zinc-500 hover:text-[#0070FF] transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CornerDownLeft size={16} />}
              </button>
            </div>
          </div>
          <button 
            onClick={handleCompare}
            disabled={loading || !toolA || !toolB}
            className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.01]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Run Comparison Engine'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#0070FF]/20 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center border-b border-zinc-200 pb-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 block mb-2 font-bold">Recommended Architecture</span>
                <h3 className="text-2xl font-bold text-[#0070FF] tracking-tighter">{result.winner}</h3>
              </div>
              <div className="space-y-3">
                {result.comparisonPoints.map((point: any, i: number) => (
                  <div key={i} className="bg-black/5 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all group">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">{point.feature}</p>
                    <div className="flex justify-between items-start text-xs gap-4">
                      <div className="flex-1">
                        <span className="text-[8px] text-zinc-700 block uppercase font-bold mb-1">{toolA}</span>
                        <span className="text-zinc-700 font-semibold">{point.toolAVal}</span>
                      </div>
                      <div className="w-[1px] h-8 bg-zinc-100 self-center"></div>
                      <div className="flex-1 text-right">
                        <span className="text-[8px] text-zinc-700 block uppercase font-bold mb-1">{toolB}</span>
                        <span className="text-zinc-700 font-semibold">{point.toolBVal}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#0070FF]/5 rounded-xl border border-[#0070FF]/10">
                <h4 className="text-[9px] font-bold text-[#0070FF] uppercase tracking-[0.3em] mb-2">Final Neural Verdict</h4>
                <p className="text-sm italic text-zinc-700">"{result.verdict}"</p>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-8 text-center bg-black/5 min-h-[400px]">
              <Scale size={48} className="opacity-10 text-[#0070FF] mb-6" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black">Awaiting Parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comparison;
