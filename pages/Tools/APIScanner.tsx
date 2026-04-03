
import React, { useState, useEffect } from 'react';
import { scanApiDocumentation } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { 
  Loader2, 
  Link as LinkIcon, 
  Zap, 
  Search, 
  ExternalLink, 
  Copy, 
  Check,
  Globe,
  FileText,
  Terminal,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';

const APIScanner: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [url, setUrl] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, links: any[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!url) throw new Error('NO_ENDPOINT: API documentation URL required.');
        if (!useCase) throw new Error('NO_DIRECTIVE: Extraction directive required.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_EXTRACTION: Completed logic extraction required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [url, useCase, result, onAction, registerActions]);

  const handleScan = async () => {
    if (!url || !useCase || loading) return;
    setLoading(true);
    try {
      const data = await scanApiDocumentation(url, useCase);
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Selective Logic Extraction Core</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Onyx Docu-<span className="text-[#0070FF]">Scanner</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Isolate specific technical protocols from dense documentation environments using neural retrieval grounding.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="glass p-6 rounded-2xl border border-black/5 space-y-6 relative overflow-hidden h-fit shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] block px-1">Endpoint (URL)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-800" size={16} />
                <input className="w-full glass border border-black/10 rounded-xl py-3 pl-12 pr-4 text-black text-sm focus:border-[#0070FF]/50 outline-none transition-all placeholder:text-zinc-900" placeholder="https://docs.stripe.com/..." value={url} onChange={(e) => setUrl(e.target.value)}/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] block px-1">Directive</label>
              <div className="relative">
                <Terminal className="absolute left-4 top-4 text-zinc-800" size={16} />
                <textarea className="w-full h-32 glass border border-black/10 rounded-xl py-3 pl-12 pr-4 text-black text-sm focus:border-[#0070FF]/50 outline-none transition-all placeholder:text-zinc-900 resize-none" placeholder="Extract auth headers..." value={useCase} onChange={(e) => setUseCase(e.target.value)}/>
              </div>
            </div>
          </div>
          <button onClick={handleScan} disabled={loading || !url || !useCase} className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] shadow-lg transition-all hover:scale-[1.01]">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Zap size={18} /> Synchronize Extraction</>}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[900px] pr-1">
          {result ? (
            <div className="glass p-8 rounded-2xl border border-[#0070FF]/20 shadow-xl space-y-8 animate-in zoom-in-95 duration-500 min-h-[500px]">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter">Extracted Logic</h3>
                <button onClick={() => { navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`p-2 rounded-lg border ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'glass border-black/10 text-zinc-500 hover:text-black transition-all'}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
              </div>
              <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap font-sans italic italic">"{result.text}"</div>
              {result.links.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] px-1 flex items-center gap-2"><Search size={14} className="neon-accent"/> Source Grounding</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {result.links.map((link, i) => (
                      <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 glass border border-black/5 rounded-xl hover:border-[#0070FF]/30 transition-all group">
                        <span className="text-[11px] font-black text-zinc-600 group-hover:text-black truncate uppercase tracking-widest">{link.title}</span>
                        <ChevronRight size={14} className="text-zinc-800 group-hover:text-[#0070FF] transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-black/5 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-12 text-center glass min-h-[500px]">
              <LinkIcon size={40} className="opacity-10 text-[#0070FF] mb-6" />
              <p className="text-[10px] uppercase tracking-[0.5em] font-black">Neural Buffer Idle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIScanner;
