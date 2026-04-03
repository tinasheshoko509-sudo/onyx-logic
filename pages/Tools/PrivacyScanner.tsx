
import React, { useState, useEffect } from 'react';
import { scanPrivacy } from '../../services/gemini';
import { useProtocol } from '../../context/ProtocolContext';
import { Loader2, Lock, ShieldAlert, Code, Zap } from 'lucide-react';

const PrivacyScanner: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [dataStr, setDataStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { registerActions } = useProtocol();

  useEffect(() => {
    registerActions({
      dryRun: async () => {
        if (!dataStr) throw new Error('NO_PAYLOAD: Data structure required for privacy scan.');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      },
      commit: async () => {
        if (!result) throw new Error('NO_AUDIT: Completed privacy audit required for commit.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAction();
      }
    });
  }, [dataStr, result, onAction, registerActions]);

  const handleScan = async () => {
    if (!dataStr) return;
    setLoading(true);
    try {
      const data = await scanPrivacy(dataStr);
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
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Payload Data Security</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight leading-none mb-4">
          Privacy <span className="text-[#0070FF]">Scanner</span>
        </h2>
        <p className="text-zinc-600 text-xl max-w-3xl">Detect and sanitize PII or sensitive keys in automation payloads and JSON structures.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-zinc-200 space-y-6 shadow-xl">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Payload Data (JSON / Text)</label>
          <textarea 
            className="w-full h-64 bg-white border border-zinc-200 rounded-xl p-4 text-black font-mono text-xs focus:border-[#0070FF] outline-none resize-none transition-all"
            placeholder='{ "user": "John Doe", "email": "john@example.com", "apiKey": "sk-..." }'
            value={dataStr}
            onChange={(e) => setDataStr(e.target.value)}
          />
          <button 
            onClick={handleScan}
            disabled={loading || !dataStr}
            className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E04E15] transition-all text-[10px] uppercase tracking-widest shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Run Privacy Audit'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#0070FF]/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight">Audit Results</h3>
                <div className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${result.riskScore > 50 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
                   Risk: {result.riskScore}%
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} /> Detected Leaks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.leaks.map((leak: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-red-500/20 rounded-lg text-[9px] text-zinc-600 font-mono font-black uppercase tracking-tighter">
                       {leak}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-[#0070FF] uppercase tracking-widest flex items-center gap-2">
                  <Code size={16} /> Sanitization Logic
                </h4>
                <div className="bg-white border border-zinc-200 p-4 rounded-xl font-mono text-[10px] text-zinc-500 leading-relaxed overflow-x-auto shadow-inner">
                   {result.sanitizationCode}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-700 p-8 text-center glass min-h-[400px]">
              <Lock size={48} className="mb-4 opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black">Scanner Standby</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyScanner;
