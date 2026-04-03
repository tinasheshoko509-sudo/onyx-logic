
import React, { useState, useEffect } from 'react';
import { designMultiAgent } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { Loader2, Users, Bot, Layers, PlayCircle, Zap } from 'lucide-react';

const Designer: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<any | null>(null);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!objective) throw new Error('NO_OBJECTIVE: Swarm directive required for architecture.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!design) throw new Error('NO_DESIGN: Synthesized swarm architecture required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [objective, design, onAction, registerActions]);

  const handleDesign = async () => {
    if (!objective) return;
    setLoading(true);
    try {
      const data = await designMultiAgent(objective);
      setDesign(data);
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
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Logic Swarm Architect</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Multi-Agent <span className="text-[#0070FF]">Designer</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Architect autonomous logic swarms and neural agent clusters for complex end-to-end automation.</p>
      </header>

      <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 shadow-lg">
        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">Swarm Objective Directive</label>
        <div className="flex flex-col md:flex-row gap-3">
          <input className="flex-1 bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:border-[#0070FF] outline-none" placeholder="e.g. End-to-end automated supply chain auditing swarm..." value={objective} onChange={(e) => setObjective(e.target.value)}/>
          <button onClick={handleDesign} disabled={loading || !objective} className="px-6 neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest">{loading ? <Loader2 className="animate-spin" size={16} /> : 'Deploy Architect'}</button>
        </div>
      </div>

      {design && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 px-1 flex items-center gap-2"><Bot size={16}/> Synthesized Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {design.agents.map((agent: any, i: number) => (
                <div key={i} className="bg-[#0A0A0A] p-5 rounded-xl border border-zinc-200 hover:border-[#0070FF]/50 transition-all">
                  <h4 className="text-sm font-black mb-2 uppercase text-[#0070FF]">{agent.role}</h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.capabilities.map((cap: string, j: number) => (
                      <span key={j} className="text-[8px] bg-white px-2 py-0.5 rounded border border-zinc-200 uppercase text-zinc-500 font-black tracking-widest">{cap}</span>
                    ))}
                  </div>
                  <div className="bg-black/5 p-4 rounded-lg border border-zinc-100 text-[11px] text-zinc-600 italic font-medium leading-relaxed">"{agent.promptSnippet}"</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 px-1 flex items-center gap-2"><Layers size={16}/> Orchestration Flow</h3>
            <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#0070FF]/10 space-y-6">
              <h4 className="text-[10px] font-black uppercase text-[#0070FF] tracking-[0.2em]">{design.architectureName}</h4>
              <div className="space-y-4">
                {design.workflowSteps.map((step: string, i: number) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="z-10 w-5 h-5 rounded-md bg-white border border-[#0070FF] flex items-center justify-center text-[9px] text-[#0070FF] font-black shrink-0">{i + 1}</div>
                    <p className="text-[12px] text-zinc-600 font-bold leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 neon-bg text-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Simulate Uplink</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designer;
