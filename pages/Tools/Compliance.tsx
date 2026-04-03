
import React, { useState, useEffect } from 'react';
import { checkCompliance } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const Compliance: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [workflow, setWorkflow] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!workflow) throw new Error('NO_PROCESS: Process description required for compliance scan.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_SCAN: Completed compliance audit required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [workflow, result, onAction, registerActions]);

  const handleCheck = async () => {
    if (!workflow) return;
    setLoading(true);
    try {
      const data = await checkCompliance(workflow);
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
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Policy Scan Engine</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Compliance <span className="text-[#0070FF]">Checker</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Scan for GDPR, HIPAA, and SOC2 risks in your automated data flows and logic branches.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">Process Description</label>
            <textarea 
              className="w-full h-48 bg-white border border-zinc-200 rounded-xl p-4 text-black text-sm focus:border-[#0070FF] outline-none resize-none transition-all"
              placeholder="Describe how data moves, where it's stored, and who has access..."
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value)}
            />
          </div>
          <button 
            onClick={handleCheck}
            disabled={loading || !workflow}
            className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E04E15] transition-all text-[10px] uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Execute Compliance Scan'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#0070FF]/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight">Audit Status</h3>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${result.complianceLevel.toLowerCase().includes('high') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {result.complianceLevel}
                </span>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={16} /> Potential Risks
                </h4>
                <ul className="space-y-2">
                  {result.risks.map((risk: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-600 bg-black/5 p-3 rounded-xl border border-red-500/10 italic">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle size={16} /> Remediation Steps
                </h4>
                <div className="space-y-2">
                  {result.remediationSteps.map((step: string, i: number) => (
                    <div key={i} className="text-xs text-zinc-700 pl-4 border-l-2 border-emerald-500/30 py-2 bg-emerald-500/5 rounded-r-xl">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-8 text-center glass min-h-[400px]">
              <ShieldCheck size={48} className="mb-4 opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black">System Ready</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
