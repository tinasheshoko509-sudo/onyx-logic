
import React, { useState } from 'react';
import { generateRoadmap } from '../../services/gemini';
import { Loader2, Map, Milestone, Calendar, Zap } from 'lucide-react';

const Roadmap: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const data = await generateRoadmap(goal);
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
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Strategic Blueprint Gen</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Integration <span className="text-[#0070FF]">Roadmap</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Step-by-step technical blueprints for complex, multi-stack automation deployments.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-lg mb-8">
        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3 px-1">Core Integration Goal</label>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            className="flex-1 bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:outline-none focus:border-[#0070FF] transition-all"
            placeholder="e.g. Syncing Salesforce with Snowflake via custom n8n instance..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !goal}
            className="px-6 neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#005ACC] transition-all text-[10px] uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Synthesize Roadmap'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-lg font-black uppercase tracking-tight">Execution Plan</h3>
               <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono uppercase font-black">
                 <Calendar size={12} /> Est. {result.estimatedTimeline}
               </div>
            </div>
            <div className="space-y-6 relative pl-6 border-l-2 border-zinc-200">
              {result.phases.map((phase: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full neon-bg shadow-[0_0_10px_#0070FF]"></div>
                  <h4 className="text-sm font-black mb-3 uppercase text-[#0070FF] tracking-widest">{phase.name}</h4>
                  <div className="space-y-2">
                    {phase.tasks.map((task: string, j: number) => (
                      <div key={j} className="bg-black/5 p-3 rounded-xl border border-zinc-100 text-xs text-zinc-600 font-bold leading-relaxed">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 h-fit sticky top-6">
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
              <Milestone size={16} /> Roadmap Dynamics
            </h4>
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-black/5 border border-zinc-100">
                 <p className="text-[12px] text-zinc-600 leading-relaxed italic font-medium">
                   "This roadmap focuses on scalable connectivity protocols and stress testing. Phase 1 targets core handshake logic before proceeding to full-scale data migration."
                 </p>
               </div>
               <button 
                 onClick={() => {
                   const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = 'integration-roadmap.json';
                   a.click();
                   URL.revokeObjectURL(url);
                 }}
                 className="w-full py-4 border border-[#0070FF] text-[#0070FF] rounded-xl hover:bg-[#0070FF]/10 transition-all font-black text-[10px] uppercase tracking-widest"
               >
                 Export Protocol Blueprint
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
