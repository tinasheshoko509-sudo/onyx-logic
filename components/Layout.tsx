
import React, { useState, useEffect, useRef } from 'react';
// Fixed: Use namespace import from react-router-dom to resolve "no exported member" errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

import { TOOLS } from '../constants';
import { 
  ChevronRight, 
  Menu, 
  X, 
  Bell, 
  User, 
  Search, 
  Settings, 
  HelpCircle, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Zap,
  Clock,
  Trash2,
  LogOut,
  Mic,
  MicOff
} from 'lucide-react';
import { useProtocol } from '../context/ProtocolContext';
import { processVoiceCommand } from '../services/gemini';

interface LayoutProps {
  children: React.ReactNode;
  user: { username: string | null; isPremium: boolean };
  onLogout: () => void;
}

interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'success' | 'info' | 'alert';
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Header Actions State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    { id: '1', title: 'Neural Link Synced', desc: 'Uplink with Global Node V3 successful.', time: '2m ago', type: 'success' },
    { id: '2', title: 'Intelligence Update', desc: 'New specialist protocols detected in registry.', time: '15m ago', type: 'info' },
    { id: '3', title: 'Logic Warning', desc: 'Bifurcation detected in Architect draft #04.', time: '1h ago', type: 'alert' },
  ]);

  const handleVoiceClick = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      // Explicitly request microphone permission to trigger the browser prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed to trigger the permission prompt
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setVoiceFeedback('Microphone permission denied.');
      setTimeout(() => setVoiceFeedback(''), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening...');
    };
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceFeedback(`Processing: "${text}"`);
      try {
        const result = await processVoiceCommand(text);
        setVoiceFeedback(result.feedback);
        setTimeout(() => setVoiceFeedback(''), 4000);
        
        if (result.path) {
          navigate(result.path, { state: { extractedInput: result.extractedInput } });
        }
      } catch (err) {
        console.error(err);
        setVoiceFeedback('Error processing command.');
        setTimeout(() => setVoiceFeedback(''), 3000);
      } finally {
        setIsListening(false);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setVoiceFeedback(`Microphone error: ${event.error}`);
      setTimeout(() => setVoiceFeedback(''), 3000);
    };
    
    recognition.onend = () => {
      if (voiceFeedback === 'Listening...') {
        setIsListening(false);
        setVoiceFeedback('');
      }
    };
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  const { triggerDryRun, triggerCommit, status, message } = useProtocol();

  const currentTool = TOOLS.find(t => t.path === location.pathname) || TOOLS[0];

  const handleNavClick = (toolId: string) => {
    if (toolId === 'logout') {
      onLogout();
    }
    setIsSidebarOpen(false);
  };

  const filteredTools = TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) && t.id !== 'logout'
  );

  const clearNotifications = () => {
    setNotifications([]);
  };

  const isFixedTool = false;

  return (
    <div className="flex h-full w-full bg-transparent overflow-hidden text-zinc-900 font-sans relative">
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-3 left-3 z-50 p-2 glass rounded-md border border-zinc-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-8 right-8 text-zinc-600 hover:text-[#0070FF] transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-2xl space-y-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#0070FF] transition-colors" size={24} />
              <input 
                autoFocus
                type="text"
                placeholder="SEARCH PROTOCOLS..."
                className="w-full bg-transparent border-b-2 border-zinc-100 py-6 pl-16 pr-6 text-2xl font-black uppercase tracking-widest focus:outline-none focus:border-[#0070FF] transition-all text-zinc-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <Link 
                    key={tool.id}
                    to={tool.path}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-4 glass border border-black/5 rounded-xl hover:border-[#0070FF]/50 transition-all group"
                  >
                    <div className="p-3 glass rounded-lg text-zinc-600 group-hover:text-[#0070FF] transition-colors">
                      {React.cloneElement(tool.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">{tool.name}</h5>
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">Protocol Active</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center opacity-20">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em]">No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] bg-black/5 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl neon-bg flex items-center justify-center text-black shadow-xl">
                  <HelpCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">System Support</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">Knowledge Base</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-600 hover:text-[#0070FF] transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0070FF]">Quick Start</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { q: 'How do I audit a workflow?', a: 'Navigate to Efficiency Auditor and paste your JSON topology.' },
                    { q: 'Can I export to n8n?', a: 'Yes, use the Node-by-Node Roadmap and click "Export n8n".' },
                    { q: 'What is Onyx IQ?', a: 'Our strategic engine that analyzes your usage and provides tips.' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 glass border border-zinc-100 rounded-xl">
                      <p className="text-[11px] font-black text-zinc-900 mb-1 uppercase tracking-widest">{item.q}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Version: 4.0.2-Stable</span>
                <button className="text-[10px] font-black text-[#0070FF] uppercase tracking-widest hover:underline">Documentation <ExternalLink size={12} className="inline ml-1" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Narrowed from 80 to 64 */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-40 w-64 h-full 
        glass border-r border-black/5 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
      `}>
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 neon-bg rounded-xl flex items-center justify-center font-black text-black text-xl transition-all group-hover:rotate-12 select-none">
              O
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 font-display">Onyx <span className="text-[#0070FF]">Logic</span></h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {TOOLS.map((tool) => {
            const isActive = location.pathname === tool.path;
            const isLogout = tool.id === 'logout';

            if (isLogout) {
              return (
                <button
                  key={tool.id}
                  onClick={() => handleNavClick(tool.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative text-zinc-500 hover:text-red-500 hover:bg-red-500/5 mt-4"
                >
                  <span className="text-zinc-600 group-hover:text-red-500 transition-colors">
                    {React.cloneElement(tool.icon as React.ReactElement<{ size?: number }>, { size: 18 })}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{tool.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={tool.id}
                to={tool.path}
                onClick={() => handleNavClick(tool.id)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative
                  ${isActive ? 'bg-zinc-100 text-[#0070FF] font-bold' : 'text-zinc-500 hover:text-[#0070FF] hover:bg-zinc-50'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 neon-bg rounded-r-full"></div>
                )}
                <span className={`${isActive ? 'text-[#0070FF]' : 'text-zinc-600 group-hover:text-[#0070FF]'} transition-colors`}>
                  {React.cloneElement(tool.icon as React.ReactElement<{ size?: number }>, { size: 18 })}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">{tool.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5 space-y-4">
          <div className="flex items-center gap-3 p-3 glass-blue rounded-xl border border-black/5">
            <div className="w-10 h-10 rounded-lg glass border border-[#0070FF]/30 flex items-center justify-center text-base font-black text-zinc-900 shadow-inner">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate text-zinc-900">{user.username}</p>
              <p className="text-[9px] text-[#0070FF] font-black uppercase tracking-widest">{user.isPremium ? 'Prime' : 'Std'}</p>
            </div>
            <button 
              onClick={onLogout} 
              className="text-zinc-600 hover:text-red-500 transition-colors p-2"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Framework */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header - Reduced height from 20 to 14 */}
        <header className="h-14 glass border-b border-black/5 px-6 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-4 text-sm">
            <Activity size={16} className={`transition-colors ${status === 'processing' ? 'text-blue-500 animate-spin' : status === 'success' ? 'text-emerald-500' : status === 'error' ? 'text-red-500' : 'text-[#0070FF]'}`} />
            <div className="flex flex-col">
              <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-black">Link Active</span>
              {message && (
                <span className={`text-[8px] font-mono uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300 ${
                  status === 'success' ? 'text-emerald-500' : 
                  status === 'error' ? 'text-red-500' : 
                  'text-[#0070FF]'
                }`}>
                  {message}
                </span>
              )}
            </div>
            <ChevronRight size={14} className="text-zinc-800" />
            <span className="text-zinc-900 uppercase tracking-widest text-[10px] font-black font-display">{currentTool.name}</span>
            {voiceFeedback && (
              <span className="ml-4 text-[10px] font-bold text-[#0070FF] uppercase tracking-widest animate-pulse bg-[#0070FF]/10 px-3 py-1 rounded-full">
                {voiceFeedback}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 border-r border-black/5 pr-4">
              <button 
                onClick={handleVoiceClick} 
                className={`transition-colors ${isListening ? 'text-[#0070FF] animate-pulse' : 'text-zinc-600 hover:text-[#0070FF]'}`}
                title="Voice Command"
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button onClick={() => setIsSearchOpen(true)} className="text-zinc-600 hover:text-[#0070FF]"><Search size={18} /></button>
              <div className="relative">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2 rounded-lg transition-all ${isNotificationsOpen ? 'bg-zinc-100 text-[#0070FF]' : 'text-zinc-600 hover:text-[#0070FF] hover:bg-zinc-50'}`}>
                  <Bell size={18} />
                  {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#0070FF] rounded-full border border-black shadow-[0_0_5px_#0070FF]"></span>}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 glass border border-black/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                    <div className="p-4 border-b border-black/5 flex justify-between items-center bg-zinc-50">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Notifications</h4>
                      <button onClick={clearNotifications} className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#0070FF] transition-colors">Clear All</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-black/5 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="text-[11px] font-black text-zinc-900 group-hover:text-[#0070FF] transition-colors">{n.title}</h5>
                              <span className="text-[8px] font-black text-zinc-700 uppercase">{n.time}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">{n.desc}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center opacity-20">
                          <Bell size={24} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setIsHelpOpen(true)} className="text-zinc-600 hover:text-[#0070FF]"><HelpCircle size={18} /></button>
            </div>
            
            <div className="flex items-center gap-3">
               <button onClick={triggerDryRun} disabled={status === 'processing'} className="px-4 py-1.5 glass border border-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0070FF] transition-all">Dry Run</button>
               <button onClick={triggerCommit} disabled={status === 'processing'} className="px-5 py-1.5 neon-bg text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0070FF]/10">Commit</button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 p-5 md:p-8 custom-scrollbar relative overflow-x-hidden flex flex-col ${!isFixedTool ? 'overflow-y-auto' : ''}`}>
          <div className={`max-w-7xl mx-auto w-full page-transition ${isFixedTool ? 'h-full flex-1' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
