import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  HelpCircle,
  MapPin,
  Compass,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface SathiAiChatProps {
  currentPropertyId?: string;
  onSelectProperty?: (id: string) => void;
}

export const SathiAiChat: React.FC<SathiAiChatProps> = ({
  currentPropertyId,
  onSelectProperty,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      role: 'model',
      text: `Namaste ${user?.name ? user.name.split(' ')[0] : 'friend'}! 🙏 I am Sathi AI, your personal room and flat rental assistant for Nepal.\n\nAsk me about neighborhood rents, water/sub-meter checks, finding rooms in Kathmandu, Patan, Bhaktapur, or Pokhara, or tenant advice!`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedChips, setSuggestedChips] = useState<string[]>([
    'Rooms near Baneshwor under Rs. 15,000',
    'Tips before paying advance in Kathmandu',
    'How do sub-meters work in Nepal?',
    'Lalitpur vs Kathmandu rent comparison',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.chatWithAI({
        message: query,
        history,
        currentPropertyId,
        userRole: user?.role,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (res.suggestedQueries && res.suggestedQueries.length > 0) {
        setSuggestedChips(res.suggestedQueries);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Error connecting to Sathi AI: ${err.message || 'Please check your connection and try again.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs shadow-lg animate-bounce duration-1000">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Need rental advice? Ask Sathi AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:shadow-emerald-500/25 hover:scale-105'
          }`}
          title="RoomsNepal AI Rental Assistant"
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Close Sathi AI</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-none">Sathi AI</span>
                <span className="text-[10px] text-emerald-100 font-medium leading-none block mt-0.5">
                  Nepal Rental Guide
                </span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[540px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">Sathi AI (कोठा साथी)</h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-1.5 py-0.2 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nepal Rental Advisor & Smart Search
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Context Banner */}
          {currentPropertyId && (
            <div className="bg-emerald-50/80 px-3 py-1.5 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
              <span className="truncate">Viewing property details · Ask Sathi about this space!</span>
              <span className="font-semibold text-emerald-700 shrink-0 ml-1">Active Context</span>
            </div>
          )}

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                    RN
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="text-xs">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      m.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                  RN
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 rounded-bl-xs flex items-center gap-2 text-slate-500 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span className="text-[11px]">Sathi AI is analyzing Nepal rentals...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200/80 transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask about rooms, rates, water, or toles in Nepal..."
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
