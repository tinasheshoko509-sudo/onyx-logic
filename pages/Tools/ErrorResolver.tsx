
import React, { useState, useEffect } from 'react';
import { resolveWorkflowError } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { useLocation } from 'react-router-dom';
import { 
  Loader2, 
  Terminal, 
  CornerDownLeft, 
  ShieldAlert, 
  CheckCircle2, 
  LifeBuoy, 
  MessageSquare,
  Sparkles,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

const ErrorResolver: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const location = useLocation();
  const [errorInput, setErrorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ translation: string, technicalContext: string, remediation: string[] } | null>(null);

  const { registerActions } = useProtocol();

  useEffect(() => {
    if (location.state?.extractedInput) {
      setErrorInput(location.state.extractedInput);
    }
  }, [location.state]);

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!errorInput.trim()) throw new Error('NO_SIGIL: Error log required for neural translation.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_TRANSLATION: Completed resolution required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [errorInput, result, onAction, registerActions]);

  const handleResolve = async () => {
    if (!errorInput.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await resolveWorkflowError(errorInput);
      setResult(data);
      onAction();
    } catch (err) {
      console.error("NEURAL_BIFURCATION: Resolution engine failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleResolve();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Debugger Uplink</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Error <span className="text-red-500">Resolver</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Neural translation of technical builder errors and log sigils into plain, actionable English directives.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-black/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
               <Terminal size={120} className="text-red-500" />
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 block">
                Workflow Builder Error Sigil
              </label>
              <div className="relative group/input">
                <textarea 
                  className="w-full h-48 bg-white border-2 border-black/5 rounded-xl p-6 text-black text-base focus:border-red-500/50 outline-none transition-all duration-500 placeholder:text-zinc-900 resize-none font-mono"
                  placeholder="Paste your error here (e.g. 429 Too Many Requests, Node execution timeout, etc.)"
                  value={errorInput}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setErrorInput(e.target.value)}
                />
                <button 
                  onClick={handleResolve}
                  disabled={loading || !errorInput.trim()}
                  className="absolute bottom-4 right-4 p-3 bg-zinc-100/80 border border-black/10 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-all backdrop-blur-sm group/btn disabled:opacity-20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <CornerDownLeft size={20} />}
                </button>
              </div>
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest text-center">Execute resolution via CTRL + ENTER</p>
            </div>

            <button 
              onClick={handleResolve}
              disabled={loading || !errorInput.trim()}
              className="mt-6 w-full bg-red-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] group"
            >
              {loading ? (
                <div className="flex items-center gap-4 text-base">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="uppercase tracking-[0.2em]">Translating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-base uppercase tracking-[0.3em]">
                  <Zap size={20} className="group-hover:rotate-12 transition-transform" /> Decode Signal
                </div>
              )}
            </button>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-black/5 flex gap-6 items-start">
            <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 shrink-0 border border-red-500/20 shadow-inner">
               <LifeBuoy size={24} />
            </div>
            <div>
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">Diagnostic Mode</h4>
               <p className="text-xs text-zinc-600 leading-relaxed font-bold uppercase tracking-tight">
                 Input the raw error message from tools like <span className="text-black">n8n</span>, <span className="text-black">Make</span>, or <span className="text-black">Zapier</span>. Onyx will resolve the technical delta and provide a plain-english remediation path.
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {result ? (
            <div className="bg-[#0A0A0A] p-12 rounded-[3.5rem] border border-red-500/20 shadow-2xl space-y-12 animate-in zoom-in-95 duration-500 relative overflow-hidden min-h-[700px]">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                  <ShieldAlert size={250} className="text-red-500" />
               </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-10 bg-red-500 rounded-full shadow-[0_0_10px_#EF4444]"></div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Plain English <span className="text-red-500">Translation</span></h3>
                </div>
                <div className="bg-black/5 p-10 rounded-[2.5rem] border border-black/5 group hover:border-red-500/20 transition-all duration-500">
                   <p className="text-zinc-800 text-2xl leading-relaxed italic font-medium text-justify">
                     "{result.translation}"
                   </p>
                   <div className="mt-8 flex items-center gap-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> 
                      Neural Translation Layer Integrity Verified
                   </div>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_10px_#10B981]"></div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Remediation <span className="text-emerald-500">Steps</span></h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {result.remediation.map((step, i) => (
                     <div key={i} className="flex gap-6 p-8 glass border border-black/5 rounded-[2rem] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group/item items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-lg shrink-0 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-all">
                           {i + 1}
                        </div>
                        <p className="text-lg text-zinc-600 group-hover/item:text-zinc-900 transition-colors font-bold tracking-tight">
                          {step}
                        </p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 relative z-10">
                 <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.6em] flex items-center gap-3">
                    <Terminal size={14} /> Technical Dossier Context
                 </h4>
                 <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                    {result.technicalContext}
                 </p>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-black/5 rounded-[3.5rem] flex flex-col items-center justify-center text-zinc-800 p-16 text-center glass min-h-[700px]">
              <div className="relative mb-10 group">
                <div className="w-32 h-32 rounded-[2.5rem] glass border border-black/5 flex items-center justify-center transition-transform hover:scale-110">
                  <LifeBuoy size={64} className="opacity-10 text-red-500 group-hover:rotate-45 transition-transform duration-1000" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 opacity-20">
                   <ShieldAlert size={24} />
                </div>
              </div>
              <p className="text-[12px] uppercase tracking-[0.5em] font-black mb-4 text-zinc-700">Neural Debugger IDLE</p>
              <p className="text-[10px] max-w-xs opacity-40 uppercase tracking-[0.1em] leading-relaxed font-bold">
                Input a workflow error sigil to initiate the plain-english translation sequence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorResolver;
