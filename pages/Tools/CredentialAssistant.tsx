
import React, { useState } from 'react';
import { getCredentialAssistance } from '../../services/gemini';
import { 
  Loader2, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  ListTodo,
  Sparkles,
  Info,
  CornerDownLeft
} from 'lucide-react';

interface SetupStep {
  title: string;
  instruction: string;
}

interface CommonPitfall {
  issue: string;
  solution: string;
}

interface CredentialResult {
  credentialName: string;
  prerequisites: string[];
  setupSteps: SetupStep[];
  commonPitfalls: CommonPitfall[];
}

const CredentialAssistant: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CredentialResult | null>(null);

  const handleProcess = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getCredentialAssistance(description);
      setResult(data);
      onAction();
    } catch (err) {
      console.error("NEURAL_BIFURCATION: Credential resolution failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleProcess();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Access Protocol Architect</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Credential <span className="text-[#0070FF]">Assistant</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Neural guidance for complex authentication flows. Resolve prerequisites and implementation steps instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-[#050505] p-6 rounded-2xl border border-black/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
               <Key size={120} className="text-[#0070FF]" />
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] px-2 block">
                Describe Authentication Type
              </label>
              <div className="relative group/input">
                <textarea 
                  className="w-full h-48 bg-white border-2 border-black/5 rounded-xl p-6 text-black text-base focus:border-[#0070FF]/50 outline-none transition-all duration-500 placeholder:text-zinc-900 resize-none font-sans"
                  placeholder="e.g. I need to set up a Google Service Account for BigQuery access..."
                  value={description}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button 
                  onClick={handleProcess}
                  disabled={loading || !description.trim()}
                  className="absolute bottom-4 right-4 p-3 bg-zinc-100/80 border border-black/10 rounded-xl text-zinc-500 hover:text-[#0070FF] hover:border-[#0070FF]/50 transition-all backdrop-blur-sm group/btn disabled:opacity-20"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <CornerDownLeft size={20} />}
                </button>
              </div>
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest text-center">Resolve protocol via CTRL + ENTER</p>
            </div>

            <button 
              onClick={handleProcess}
              disabled={loading || !description.trim()}
              className="mt-6 w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-[0_0_40px_rgba(255,95,31,0.2)] group"
            >
              {loading ? (
                <div className="flex items-center gap-4 text-base">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="uppercase tracking-[0.2em]">Synthesizing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-base uppercase tracking-[0.3em]">
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> Generate Guide
                </div>
              )}
            </button>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-black/5 flex gap-6 items-start">
            <div className="p-4 bg-[#0070FF]/10 rounded-2xl text-[#0070FF] shrink-0 border border-[#0070FF]/20 shadow-inner">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">Protocol Validation</h4>
               <p className="text-xs text-zinc-600 leading-relaxed font-bold uppercase tracking-tight">
                 Credential Assistant provides grounded documentation for <span className="text-black">OAuth2</span>, <span className="text-black">API Keys</span>, <span className="text-black">JWT</span>, and <span className="text-black">M2M</span> authentications.
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-h-[1200px] overflow-y-auto custom-scrollbar pr-2">
          {result ? (
            <div className="bg-[#050505] p-12 rounded-[3.5rem] border border-[#0070FF]/20 shadow-2xl space-y-12 animate-in zoom-in-95 duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                  <Key size={250} className="text-[#0070FF]" />
               </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-10 neon-bg rounded-full shadow-[0_0_10px_#0070FF]"></div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter">{result.credentialName} <span className="text-zinc-600">Protocol</span></h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2 px-2">
                    <ListTodo size={14} className="text-blue-500" /> Prerequisites
                  </h4>
                  <div className="flex wrap gap-2">
                    {result.prerequisites.map((item, i) => (
                      <span key={i} className="px-4 py-2 glass border border-black/5 rounded-xl text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-10 bg-blue-500 rounded-full shadow-[0_0_10px_#3B82F6]"></div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Setup <span className="text-blue-500">Pipeline</span></h3>
                </div>
                <div className="space-y-6">
                   {result.setupSteps.map((step, i) => (
                     <div key={i} className="flex gap-6 p-8 glass border border-black/5 rounded-[2rem] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group/item items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-lg shrink-0 group-hover/item:bg-blue-500 group-hover/item:text-black transition-all">
                           {i + 1}
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-lg font-black text-black uppercase tracking-tight">{step.title}</h5>
                          <p className="text-sm text-zinc-600 group-hover/item:text-zinc-700 transition-colors font-medium leading-relaxed">
                            {step.instruction}
                          </p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-10 bg-red-500 rounded-full shadow-[0_0_10px_#EF4444]"></div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Common <span className="text-red-500">Pitfalls</span></h3>
                </div>
                <div className="space-y-6">
                   {result.commonPitfalls.map((pitfall, i) => (
                     <div key={i} className="p-8 bg-black/5 border border-red-500/10 rounded-[2rem] space-y-4 hover:border-red-500/30 transition-all">
                        <div className="flex items-start gap-3">
                           <AlertTriangle size={18} className="text-red-500 shrink-0 mt-1" />
                           <p className="text-sm font-black text-red-500 uppercase tracking-tight">{pitfall.issue}</p>
                        </div>
                        <div className="flex items-start gap-3 pl-8">
                           <Info size={16} className="text-zinc-700 shrink-0 mt-0.5" />
                           <p className="text-[13px] text-zinc-500 leading-relaxed font-medium italic">"{pitfall.solution}"</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-8 border-t border-black/5 flex gap-4">
                 <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-5 bg-zinc-50 text-zinc-600 rounded-2xl hover:text-black transition-all font-black text-[11px] uppercase tracking-[0.2em] border border-zinc-200"
                >
                  New Resolution Cycle
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-black/5 rounded-[3.5rem] flex flex-col items-center justify-center text-zinc-800 p-16 text-center glass min-h-[700px]">
              <div className="relative mb-10 group">
                <div className="w-32 h-32 rounded-[2.5rem] glass border border-black/5 flex items-center justify-center transition-transform hover:scale-110">
                  <Terminal size={64} className="opacity-10 text-[#0070FF]" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#0070FF]/10 rounded-2xl flex items-center justify-center text-[#0070FF] opacity-20">
                   <Zap size={24} />
                </div>
              </div>
              <p className="text-[12px] uppercase tracking-[0.5em] font-black mb-4 text-zinc-700">Protocol Architect IDLE</p>
              <p className="text-[10px] max-w-xs opacity-40 uppercase tracking-[0.1em] leading-relaxed font-bold">
                Enter an authentication setup directive to initiate the specialist-grade blueprint synthesis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialAssistant;
