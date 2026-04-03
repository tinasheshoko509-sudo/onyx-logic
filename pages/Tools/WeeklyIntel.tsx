
import React, { useState, useEffect } from 'react';
import { getWeeklyDiscovery, discoverTools } from '../../services/gemini';
import { WeeklyDiscovery, ProtocolBlueprint } from '../../types';
import { 
  Loader2, 
  BellRing, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  CheckCircle, 
  Globe, 
  Zap,
  Activity,
  ArrowRight,
  Database,
  Terminal,
  Shield,
  Wifi,
  BarChart3,
  Monitor,
  Fingerprint,
  Layers,
  Search,
  Workflow,
  RefreshCw,
  Clock,
  ChevronRight,
  Link as LinkIcon,
  Braces
} from 'lucide-react';

const WeeklyIntel: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [activeTab, setActiveTab] = useState<'digest' | 'discovery'>('digest');
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [discovery, setDiscovery] = useState<{ tools: WeeklyDiscovery[], links: any[] } | null>(null);

  const fetchDigest = async () => {
    setLoadingDigest(true);
    try {
      const data = await getWeeklyDiscovery();
      setDiscovery(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDigest(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'digest' && !discovery) fetchDigest();
  }, [activeTab]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Zap size={16} className="text-[#0070FF] animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Discovery Feed</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
            New <span className="text-[#0070FF]">Intelligence</span>
          </h2>
          <p className="text-zinc-600 text-xl max-w-3xl leading-relaxed">Grounded retrieval of emerging automation breakthroughs and technical stack releases.</p>
        </div>
        
        <div className="glass p-1 rounded-xl border border-black/5 flex w-full md:w-64 h-10 overflow-hidden shrink-0">
          <button onClick={() => setActiveTab('digest')} className={`flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'digest' ? 'neon-bg text-black shadow-lg' : 'text-zinc-500 hover:text-black'}`}>Digest</button>
          <button onClick={() => setActiveTab('discovery')} className={`flex-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'discovery' ? 'neon-bg text-black shadow-lg' : 'text-zinc-500 hover:text-black'}`}>Discovery</button>
        </div>
      </header>

      {activeTab === 'digest' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
          {loadingDigest ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center glass rounded-2xl border border-black/5"><Loader2 className="animate-spin text-[#0070FF]" size={32} /></div>
          ) : discovery && discovery.tools.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-[#050505] p-6 rounded-2xl border border-black/10 shadow-xl relative overflow-hidden group">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="px-3 py-1 bg-[#0070FF]/10 border border-[#0070FF]/20 text-[#0070FF] text-[9px] font-black uppercase tracking-widest rounded-lg">{discovery.tools[0].category}</span>
                    <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">{discovery.tools[0].releaseDate}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tighter text-black uppercase">{discovery.tools[0].toolName}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed mb-8 font-bold">{discovery.tools[0].description}</p>
                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {discovery.tools[0].protocolBlueprints.slice(0, 2).map((bp, i) => (
                      <div key={i} className="bg-black/5 border border-black/5 p-4 rounded-xl group/item hover:border-[#0070FF]/40 transition-all">
                         <div className="flex items-center gap-3 mb-3"><Terminal size={14} className="text-[#0070FF]/50"/><h5 className="text-[11px] font-black uppercase tracking-tight text-black">{bp.title}</h5></div>
                         <div className="bg-white border border-black/5 p-3 rounded-lg text-[9px] font-mono text-emerald-500/80 overflow-x-auto">{bp.logic}</div>
                      </div>
                    ))}
                  </div>
                  <a href={discovery.tools[0].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 neon-bg text-black font-black rounded-lg text-[10px] uppercase tracking-widest shadow-lg">Deploy Protocol <ArrowRight size={14}/></a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass p-6 rounded-xl border border-black/5 space-y-4">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><LinkIcon size={14} className="neon-accent" /> Registry</h4>
                  <div className="space-y-2">
                    {discovery.links.map((link, i) => (
                      <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-black/5 border border-black/5 rounded-lg hover:border-[#0070FF]/40 transition-all group">
                        <p className="text-[10px] font-black text-zinc-500 group-hover:text-black truncate uppercase">{link.title}</p>
                        <ExternalLink size={10} className="text-[#0070FF]/40 group-hover:text-[#0070FF] ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[400px] border-2 border-dashed border-black/5 rounded-2xl flex flex-col items-center justify-center text-zinc-800 bg-black/5"><button onClick={fetchDigest} className="px-8 py-3 neon-bg text-black font-black rounded-lg text-[10px] uppercase tracking-widest shadow-lg">Establish Uplink</button></div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
          <div className="bg-[#050505] p-6 rounded-xl border border-black/10 shadow-xl relative overflow-hidden group">
            <h3 className="text-black text-xl font-black uppercase tracking-tighter mb-6">Locate Specialist Protocols.</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              <input className="w-full bg-white border border-[#151515] rounded-xl py-4 pl-12 pr-24 text-black text-xs font-black outline-none focus:border-[#0070FF]/40 transition-all" placeholder="Pinecone alternatives..." />
              <button className="absolute right-2 top-2 bottom-2 px-5 neon-bg text-black font-black rounded-lg text-[9px] uppercase tracking-widest shadow-md">Execute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyIntel;
