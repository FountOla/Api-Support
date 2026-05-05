import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Search, MessageCircle, Clock, User, CheckCircle2, ChevronRight, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'MEDIUM' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(setTickets);
  };

  const selectTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    const res = await fetch(`/api/tickets/${ticket.id}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        senderId: 'user-1',
        senderName: 'Lead Dev'
      })
    });
    
    setNewMessage('');
    const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`);
    setMessages(await res.json());
    fetchTickets(); // Update list
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTicket,
        workspaceId: 'default-ws'
      })
    });
    setShowCreate(false);
    setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
    fetchTickets();
  };

  return (
    <div className="h-full flex gap-8">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold">Support Tickets</h1>
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search tickets..."
            className="w-full bg-white/5 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTicket(t)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedTicket?.id === t.id 
                  ? 'bg-brand-primary/10 border-brand-primary/40' 
                  : 'bg-white/5 border-border hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                   t.priority === 'HIGH' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-warning/10 text-brand-warning'
                }`}>
                  {t.priority}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(t.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">{t.title}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
              <div className="flex items-center gap-3 mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {t._count.messages}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.status}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Area */}
      <div className="flex-1 glass-card flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div 
              key={selectedTicket.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-lg font-bold">{selectedTicket.title}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> Created by Support Agent
                    </span>
                    <span className="text-xs text-brand-primary flex items-center gap-1 font-bold underline">
                      Ref: {selectedTicket.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-success text-white text-xs font-bold hover:bg-brand-success/90 transition-all">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolve Ticket
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-border text-sm text-gray-300">
                  <p className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-widest">Initial Issue</p>
                  {selectedTicket.description}
                </div>

                <div className="h-px bg-border my-8 flex items-center justify-center">
                  <span className="bg-bg-navy px-4 text-[10px] uppercase font-bold text-gray-600 tracking-widest">Conversation</span>
                </div>

                {messages.map((m) => (
                  <div key={m.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold">{m.senderName}</span>
                        <span className="text-[10px] text-gray-600">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-300 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white/5 border-t border-border">
                <div className="relative">
                  <textarea 
                    rows={1}
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all resize-none overflow-hidden"
                  />
                  <button 
                    onClick={sendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-all shadow-lg shadow-brand-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Ticket className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold">Select a ticket to view conversation</h3>
              <p className="text-gray-500 max-w-sm mt-2">All escalated API issues will appear here for human support engineers.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="absolute inset-0 bg-bg-navy/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg glass-card bg-surface p-8 shadow-2xl">
              <h2 className="text-2xl font-display font-bold mb-6">Open New Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
                  <input required placeholder="Stripe production keys failing" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                  <textarea required rows={4} placeholder="Describe the issue in detail..." value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 rounded-lg border border-border font-bold">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-lg bg-brand-primary text-white font-bold">Create Ticket</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
