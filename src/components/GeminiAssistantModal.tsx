import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Database,
  X,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  toolCallsExecuted?: string[];
  timestamp: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  businessName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Hello! I am your BiasharaOS AI Business Assistant. I am directly connected to your Cloud SQL PostgreSQL database for **${
        businessName || 'your business'
      }**.\n\nYou can ask me about net profits, top-selling products, outstanding customer debts, recent operating expenses, or low-stock alerts. I query the live database records to provide accurate figures without hallucinating.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'What was my net profit and margin this month?',
    'Which products generated the highest revenue?',
    'Which customers have outstanding balances?',
    'What were my largest expenses?',
    'Which products require urgent restocking?',
  ];

  const handleSend = async (questionText?: string) => {
    const query = questionText || prompt;
    if (!query.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to query assistant');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: data.text,
        toolCallsExecuted: data.toolCallsExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Error executing database query: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">BiasharaOS Business Advisor</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Database Grounded Intelligence · Cloud SQL PostgreSQL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-1.5 max-w-[85%]">
                {/* Tool Calling Execution Badge */}
                {msg.toolCallsExecuted && msg.toolCallsExecuted.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded w-fit">
                    <Database className="w-3 h-3" />
                    <span>Executed: {msg.toolCallsExecuted.join(', ')}</span>
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                <div
                  className={`text-[10px] text-slate-500 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Querying PostgreSQL database records & calculating insights...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Quick Queries:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isAsking}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white whitespace-nowrap text-[11px] transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            placeholder="Ask about revenue, profits, debt balances, expenses, or stock..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isAsking}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
