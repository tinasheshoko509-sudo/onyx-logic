
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, UserPlus, LogIn, ShieldCheck, AlertCircle, Eye, EyeOff, Activity, Loader2, Cpu, Check } from 'lucide-react';

interface AuthGatewayProps {
  onLogin: (email: string) => void;
}

const AuthGateway: React.FC<AuthGatewayProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(() => localStorage.getItem('onyx_last_email') || '');
  const [password, setPassword] = useState(() => {
    const remember = localStorage.getItem('onyx_remember_me') === 'true';
    if (remember) {
      const saved = localStorage.getItem('onyx_last_password');
      if (saved) {
        try {
          return atob(saved);
        } catch (e) {
          return '';
        }
      }
    }
    return '';
  });
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('onyx_remember_me') === 'true');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simple Base64 obfuscation for simulated security in prototype
  const secureObfuscate = (str: string) => btoa(str);
  const secureDeobfuscate = (str: string) => atob(str);

  const toggleMode = (login: boolean) => {
    setIsLogin(login);
    setError('');
    if (!rememberMe) {
      setPassword('');
    }
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('INPUT_ERROR: Required fields missing.');
      return;
    }

    // Security: Basic length check
    if (cleanPassword.length > 128 || cleanEmail.length > 128) {
      setError('BUFFER_OVERFLOW: Input exceeded character limit.');
      return;
    }

    setLoading(true);

    const finalizeAuth = () => {
      localStorage.setItem('onyx_last_email', cleanEmail);
      if (rememberMe) {
        localStorage.setItem('onyx_remember_me', 'true');
        localStorage.setItem('onyx_last_password', secureObfuscate(cleanPassword));
      } else {
        localStorage.removeItem('onyx_remember_me');
        localStorage.removeItem('onyx_last_password');
      }
      onLogin(cleanEmail);
    };

    setTimeout(() => {
      if (cleanEmail === 'demo@onyx.ai' && cleanPassword === 'password') {
        finalizeAuth();
        return;
      }

      let registry: Record<string, string> = {};
      try {
        const storedRegistry = localStorage.getItem('onyx_registry');
        registry = storedRegistry ? JSON.parse(storedRegistry) : {};
      } catch (err) {
        registry = {};
      }

      if (isLogin) {
        const encryptedPass = registry[cleanEmail];
        if (!encryptedPass) {
          setError('REGISTRY_MISSING: Specialist not found.');
          setLoading(false);
        } else if (secureDeobfuscate(encryptedPass) !== cleanPassword) {
          setError('PASSWORD_MISMATCH: Authentication failed.');
          setLoading(false);
        } else {
          finalizeAuth();
        }
      } else {
        if (cleanPassword !== confirmPassword) {
          setError('LOGIC_ERROR: Verification passwords do not match.');
          setLoading(false);
        } else if (registry[cleanEmail] || cleanEmail === 'demo@onyx.ai') {
          setError('REGISTRY_CONFLICT: Specialist already active.');
          setLoading(false);
        } else if (cleanPassword.length < 6) {
          setError('PASSWORD_WEAKNESS: Minimum 6 chars required.');
          setLoading(false);
        } else {
          registry[cleanEmail] = secureObfuscate(cleanPassword);
          localStorage.setItem('onyx_registry', JSON.stringify(registry));
          finalizeAuth();
        }
      }
    }, 1200);
  };

  return (
    <div className="h-screen w-full bg-white overflow-y-auto custom-scrollbar relative flex items-center justify-center p-6 text-zinc-900">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#0070FF]/2 rounded-full blur-[160px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm z-10 space-y-8 py-6">
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
             {/* Unified 'O' Logo - Curvy Squircle Style */}
             <div className="relative w-20 h-20 neon-bg rounded-[1.8rem] flex items-center justify-center font-black text-black text-4xl mx-auto shadow-2xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-105 select-none">
                O
             </div>
             
             <div className="absolute top-0 right-0 bg-white p-1.5 rounded-xl border border-zinc-100 shadow-xl z-20">
                <ShieldCheck className="text-[#0070FF]" size={12} />
             </div>
          </div>

          <div className="space-y-0.5">
             <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 leading-none font-display">Onyx <span className="text-[#0070FF]">Logic</span></h2>
          </div>
        </div>

        <div className="glass p-5 md:p-6 rounded-[2.5rem] border border-black/5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-black/10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5">
            <div className={`h-full neon-bg transition-all duration-1000 ease-in-out ${isLogin ? 'w-1/2' : 'w-full'}`}></div>
          </div>

          <div className="flex gap-4 mb-6 border-b border-black/5 pb-3">
            <button 
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isLogin ? 'text-zinc-900 scale-105' : 'text-zinc-600 hover:text-zinc-600'}`}
            >
              <LogIn size={12} /> Login
            </button>
            <button 
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${!isLogin ? 'text-zinc-900 scale-105' : 'text-zinc-600 hover:text-zinc-600'}`}
            >
              <UserPlus size={12} /> Register
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 glass border border-red-500/20 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1 duration-500">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 px-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#0070FF] transition-all duration-500" size={16} />
                <input 
                  type="email" 
                  required
                  placeholder="demo@onyx.ai"
                  className="w-full glass border border-zinc-100 rounded-xl py-3 pl-11 pr-4 text-[13px] text-zinc-900 focus:border-[#0070FF]/50 transition-all duration-500 outline-none focus:ring-2 focus:ring-[#0070FF]/5 placeholder:text-zinc-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 px-2">Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full glass border border-zinc-100 rounded-xl py-3 px-11 text-[13px] text-zinc-900 focus:border-[#0070FF]/50 transition-all duration-500 outline-none focus:ring-2 focus:ring-[#0070FF]/5 placeholder:text-zinc-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#0070FF] transition-all duration-500" size={16} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1 fade-in duration-500">
                <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 px-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#0070FF] transition-all duration-500" size={16} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    className="w-full glass border border-zinc-100 rounded-xl py-3 pl-11 pr-4 text-[13px] text-zinc-900 focus:border-[#0070FF]/50 transition-all duration-500 outline-none focus:ring-2 focus:ring-[#0070FF]/5 placeholder:text-zinc-700"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-4 h-4 glass border border-black/10 rounded peer-checked:bg-[#0070FF] peer-checked:border-[#0070FF] transition-all duration-300"></div>
                  <Check className="absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-300" size={10} strokeWidth={4} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover/check:text-zinc-600 transition-colors">Remember Me</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full neon-bg text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-500 text-[10px] uppercase tracking-[0.3em] mt-2 btn-futuristic group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Syncing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? 'Login' : 'Activate Account'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
