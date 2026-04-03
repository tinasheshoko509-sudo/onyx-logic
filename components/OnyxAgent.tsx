
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { askOnyx } from '../services/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const OnyxAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Proactive welcome after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowProactive(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowProactive(false);

    try {
      const response = await askOnyx(input, messages);
      const onyxMsg: Message = { role: 'model', text: response || "Protocol timeout. Please re-initialize." };
      setMessages(prev => [...prev, onyxMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Neural link interrupted. Registry offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Proactive Bubble */}
      {showProactive && !isOpen && (
        <div className="mb-4 mr-2 bg-white border border-[#0070FF]/30 p-3 rounded-xl shadow-2xl max-w-[220px] animate-in slide-in-from-bottom-2 fade-in duration-500 relative">
          <button 
            onClick={() => setShowProactive(false)}
            className="absolute -top-2 -right-2 bg-white border border-zinc-200 rounded-full p-1 text-zinc-500 hover:text-black"
          >
            <X size={10} />
          </button>
          <p className="text-[10px] text-zinc-700 leading-relaxed">
            Welcome. I am <span className="text-black font-bold">Onyx</span>. Assistance required?
          </p>
          <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-r border-b border-[#0070FF]/30 rotate-45"></div>
        </div>
      )}

      {/* Chat Window - Reduced size to 300x420 */}
      {isOpen && (
        <div className="w-[300px] h-[420px] bg-white border border-zinc-200 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden mb-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          <div className="bg-black/5 p-4 border-b border-zinc-200 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0070FF]/20 flex items-center justify-center text-[#0070FF]">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Onyx</h3>
                <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Concierge</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="text-center py-8 opacity-20">
                <Sparkles size={32} className="mx-auto mb-3" />
                <p className="text-[9px] uppercase font-bold tracking-widest">Secure Uplink</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-xl text-[11px] leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-white text-black font-medium rounded-tr-none' 
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 p-3 rounded-xl rounded-tl-none border border-zinc-200">
                  <Loader2 className="animate-spin text-[#0070FF]" size={12} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-zinc-200 bg-white/30">
            <div className="relative group">
              <input 
                className="w-full bg-white border border-zinc-200 rounded-lg py-3 pl-3 pr-10 text-[11px] text-black focus:outline-none focus:border-[#0070FF] transition-all"
                placeholder="Ask Onyx..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-black disabled:opacity-20 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[7px] text-center text-zinc-800 uppercase font-bold tracking-[0.2em] mt-2">
              Encrypted transmission
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button - Reduced size */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowProactive(false);
        }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
          isOpen 
          ? 'bg-zinc-100 border border-zinc-200 text-zinc-500' 
          : 'neon-bg text-black shadow-[#0070FF]/40'
        }`}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
};

export default OnyxAgent;
