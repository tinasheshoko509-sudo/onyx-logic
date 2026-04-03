import React, { useState, useEffect } from 'react';
import { generateNodeRoadmap } from '../../services/gemini';
import { Loader2, Map, Milestone, Calendar, Zap, Layers } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const NodeRoadmap: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const location = useLocation();
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (location.state?.extractedInput) {
      setDescription(location.state.extractedInput);
      // Optional: Try to extract a short goal from the description
      const words = location.state.extractedInput.split(' ');
      if (words.length > 0) {
        setGoal(words.slice(0, 5).join(' ') + '...');
      }
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!goal || !description) return;
    setLoading(true);
    try {
      const data = await generateNodeRoadmap(goal, description);
      setResult(data);
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Zap size={16} className="text-[#0070FF] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Node-by-Node Generator</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Workflow <span className="text-[#0070FF]">Roadmap</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Generate a node-by-node roadmap based on a simple English description of your workflow.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-lg mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 px-1">Workflow Type / Goal</label>
            <input 
              className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:outline-none focus:border-[#0070FF] transition-all"
              placeholder="e.g. Lead Generation, Data Sync, E-commerce Logic..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 px-1">How it should function (Simple English)</label>
            <textarea 
              className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:outline-none focus:border-[#0070FF] transition-all resize-y"
              placeholder="e.g. When a new lead is added in Salesforce, check if they exist in Mailchimp. If not, add them to the 'New Leads' list and send a welcome email..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleGenerate}
              disabled={loading || !goal || !description}
              className="px-6 neon-bg text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#005ACC] transition-all text-[10px] uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Generate Roadmap'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-lg font-black uppercase tracking-tight">Node Sequence</h3>
               <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono uppercase font-black">
                 <Calendar size={12} /> Est. {result.estimatedTimeline}
               </div>
            </div>
            <div className="space-y-6 relative pl-6 border-l-2 border-zinc-200">
              {result.nodes.map((node: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full neon-bg shadow-[0_0_10px_#0070FF]"></div>
                  <h4 className="text-sm font-black mb-1 uppercase text-[#0070FF] tracking-widest">{node.nodeName}</h4>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{node.nodeType}</p>
                  <div className="space-y-2">
                    <div className="bg-black/5 p-4 rounded-xl border border-zinc-100 text-sm text-zinc-700 font-medium leading-relaxed">
                      {node.description}
                    </div>
                    <div className="bg-black/5 p-3 rounded-xl border border-zinc-100 text-xs text-zinc-600 font-mono leading-relaxed">
                      <span className="font-bold text-zinc-800 uppercase tracking-widest text-[9px] block mb-1">Configuration:</span>
                      {node.configuration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 h-fit sticky top-6">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
                <Milestone size={16} /> Roadmap Summary
              </h4>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-black/5 border border-zinc-100">
                   <p className="text-[12px] text-zinc-600 leading-relaxed italic font-medium">
                     "{result.summary}"
                   </p>
                 </div>
                 <button 
                   onClick={() => {
                     const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = 'workflow-roadmap.json';
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
        </div>
      )}
    </div>
  );
};

export default NodeRoadmap;
