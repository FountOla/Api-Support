import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Terminal, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'payload' | 'error-fix';
}

export default function AiSupport() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your API Support Assistant. I can help you debug errors, generate payloads, and understand API documentation. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch latest logs as context
      const logRes = await fetch('/api/logs');
      const latestLogs = await logRes.json();
      const logsContext = latestLogs.slice(0, 5).map((l: any) => `${l.level}: ${l.message} (Context: ${l.context})`).join('\n');

      const chatRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, logsContext })
      });

      if (!chatRes.ok) throw new Error('Failed to get AI response');
      const data = await chatRes.json();
      
      const aiContent = data.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto gap-4">
      {/* Chat History */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">AI Support Agent</h3>
              <p className="text-[10px] text-brand-success flex items-center gap-1 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                ONLINE • ANALYZING LOGS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/5 rounded-md text-gray-500 transition-all">
              <Zap className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded-md text-gray-500 transition-all">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                  m.role === 'assistant' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-secondary/10 text-brand-secondary'
                }`}>
                  {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'assistant' ? 'bg-white/5 text-gray-200' : 'bg-brand-primary text-white font-medium'
                }`}>
                  {m.content.split('\n').map((line, j) => (
                    <p key={j} className={line.startsWith('```') ? 'font-mono bg-black/30 p-2 rounded mt-2 text-xs text-brand-secondary' : 'mb-2'}>
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white/5 border-t border-border">
          <div className="relative">
            <textarea 
              rows={1}
              placeholder="Explain why I'm getting a 401 on Stripe..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all resize-none overflow-hidden"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-3">
             <button className="text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-brand-primary flex items-center gap-1 transition-colors">
               <Sparkles className="w-3 h-3" />
               Generate Payload
             </button>
             <button className="text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-brand-primary flex items-center gap-1 transition-colors">
               <AlertCircle className="w-3 h-3" />
               Debug Logs
             </button>
             <button className="text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-brand-primary flex items-center gap-1 transition-colors">
               <Terminal className="w-3 h-3" />
               Get Example Code
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
