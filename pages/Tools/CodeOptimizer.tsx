
import React, { useState, useEffect } from 'react';
import { refactorCode, generateCode } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { CodeRefactorResult } from '../../types';
import { 
  Loader2, 
  Code2, 
  CornerDownLeft, 
  Copy, 
  Check, 
  Terminal, 
  AlertTriangle, 
  Sparkles, 
  Download,
  Info,
  Wand2,
  RefreshCw,
  Cpu,
  Zap
} from 'lucide-react';

const CodeOptimizer: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [mode, setMode] = useState<'refactor' | 'generate'>('refactor');
  const [inputCode, setInputCode] = useState('');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeRefactorResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (mode === 'refactor' && !inputCode) throw new Error('NO_SOURCE: JavaScript input required for refactor.');
        if (mode === 'generate' && !objective) throw new Error('NO_DIRECTIVE: Objective required for synthesis.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_SYNTHESIS: Completed code output required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [mode, inputCode, objective, result, onAction, registerActions]);

  const handleExecute = async () => {
    if (mode === 'refactor' && (!inputCode || !objective)) return;
    if (mode === 'generate' && !objective) return;
    if (loading) return;

    setLoading(true);
    setResult(null);
    try {
      let data: CodeRefactorResult;
      if (mode === 'refactor') {
        data = await refactorCode(inputCode, objective);
      } else {
        data = await generateCode(objective);
      }
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.refactoredCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Zap size={16} className="text-[#0070FF] animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Logic Synthesis</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
            Neural JS <span className="text-[#0070FF]">{mode === 'refactor' ? 'Refactor' : 'Synthesis'}</span>
          </h2>
          <p className="text-zinc-600 text-xl max-w-3xl leading-relaxed">Inject raw JavaScript for multi-layer logic optimization or synthesize high-performance clusters from English directives.</p>
        </div>
        <div className="flex glass p-1 rounded-xl border border-black/5 shrink-0">
          <button onClick={() => setMode('refactor')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'refactor' ? 'neon-bg text-black shadow-lg' : 'text-zinc-500 hover:text-black'}`}>Refactor</button>
          <button onClick={() => setMode('generate')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'neon-bg text-black shadow-lg' : 'text-zinc-500 hover:text-black'}`}>Synthesis</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-zinc-200 shadow-xl relative overflow-hidden">
            {mode === 'refactor' && (
              <div className="mb-6">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-3 block px-1">Raw Source Input</label>
                <textarea 
                  className="w-full h-48 bg-white border border-zinc-200 rounded-xl p-5 text-zinc-700 text-xs font-mono focus:border-[#0070FF] outline-none resize-none transition-all placeholder:text-zinc-900"
                  placeholder="paste(javascript_code_here) => refactor();"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block px-1">{mode === 'refactor' ? 'Optimization Objective' : 'Neural Directive'}</label>
              <div className="relative">
                <textarea 
                  className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-5 text-black text-sm focus:border-[#0070FF] outline-none transition-all placeholder:text-zinc-900 resize-none"
                  placeholder="e.g. Optimize for O(n) time..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
                <button onClick={handleExecute} disabled={loading} className="absolute bottom-4 right-4 p-2 bg-zinc-100/80 border border-zinc-200 rounded-lg text-zinc-500 hover:text-[#0070FF] transition-all">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CornerDownLeft size={16} />}
                </button>
              </div>
            </div>
            <button 
              onClick={handleExecute} 
              disabled={loading}
              className="mt-6 w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.01] shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Execute Protocol</>}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[900px] pr-1">
          {result ? (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#0070FF]/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h3 className="text-xl font-black uppercase tracking-tighter">Neural <span className="neon-accent">Output</span></h3>
                <button onClick={copyCode} className={`p-2 rounded-lg border ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'glass border-black/10 text-zinc-500'}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
              </div>
              <div className="space-y-3">
                <h4 className="text-[#0070FF] font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"><Terminal size={16} /> Protocol Source</h4>
                <div className="bg-white border border-zinc-200 p-5 rounded-xl font-mono text-[11px] text-emerald-400/90 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                   <pre className="whitespace-pre-wrap">{result.refactoredCode}</pre>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-red-500 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"><AlertTriangle size={16} /> Diagnostics</h4>
                <div className="space-y-2">
                  {result.analysis.map((item, i) => (
                    <div key={i} className="text-[11px] text-zinc-600 pl-3 border-l-2 border-red-900/50 py-2 bg-black/5 rounded-r-lg">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-12 text-center glass min-h-[500px]">
              <Cpu size={48} className="opacity-10 text-[#0070FF] mb-6" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-black">Neural Buffer Idle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeOptimizer;
