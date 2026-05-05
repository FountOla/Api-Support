import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Zap, ArrowRight, Trash2, Play, Settings2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: 'STRIPE_PAYMENT', action: 'WHATSAPP_MESSAGE' });

  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(setWorkflows);
  }, []);

  const handleCreate = async () => {
    const definition = {
      trigger: newWorkflow.trigger,
      action: newWorkflow.action,
      steps: [
        { type: 'TRIGGER', provider: newWorkflow.trigger },
        { type: 'TRANSFORM', logic: 'MAP_EVENT' },
        { type: 'ACTION', provider: newWorkflow.action }
      ]
    };

    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWorkflow.name,
        definition,
        workspaceId: 'default-ws'
      })
    });

    setShowBuilder(false);
    setNewWorkflow({ name: '', trigger: 'STRIPE_PAYMENT', action: 'WHATSAPP_MESSAGE' });
    // Refetch
    fetch('/api/workflows').then(res => res.json()).then(setWorkflows);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Automation Workflows</h1>
          <p className="text-gray-500 text-sm mt-1">Chain API events together into powerful automated processes.</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-5 h-5" />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.length === 0 ? (
          <div className="glass-card p-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <GitBranch className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold">No workflows active</h3>
            <p className="text-gray-500 max-w-sm mt-2">Create your first automated flow to connect Stripe, Meta, and other APIs.</p>
            <button 
              onClick={() => setShowBuilder(true)}
              className="mt-6 text-brand-primary font-bold flex items-center gap-2 hover:underline"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : workflows.map((wf) => {
          const def = JSON.parse(wf.definition);
          return (
            <motion.div 
              layout
              key={wf.id}
              className="glass-card p-6 flex items-center gap-8 group"
            >
              <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
                <GitBranch className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg">{wf.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5">
                    <Zap className="w-3.5 h-3.5 text-brand-warning" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{def.trigger}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{def.action}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <Settings2 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-brand-error hover:bg-brand-error/10 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="w-32 flex flex-col items-end">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${wf.active ? 'bg-brand-success/10 text-brand-success' : 'bg-gray-500/10 text-gray-500'}`}>
                  {wf.active ? 'ACTIVE' : 'PAUSED'}
                </span>
                <p className="text-[10px] text-gray-500 mt-2 font-mono">Last run: 2m ago</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuilder(false)}
              className="absolute inset-0 bg-bg-navy/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl glass-card bg-surface shadow-2xl p-8"
            >
              <h2 className="text-2xl font-display font-bold mb-6">Workflow Builder</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Workflow Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sales to WhatsApp Admin"
                    value={newWorkflow.name}
                    onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">If this happens (Trigger)</label>
                    <select 
                      value={newWorkflow.trigger}
                      onChange={e => setNewWorkflow({...newWorkflow, trigger: e.target.value})}
                      className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary appearance-none"
                    >
                      <option value="STRIPE_PAYMENT">Stripe: Payment Success</option>
                      <option value="META_CONVERSION">Meta: Lead Generated</option>
                      <option value="HUBSPOT_CONTACT">HubSpot: New Contact</option>
                    </select>
                  </div>
                  
                  <div className="mt-6">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Then do this (Action)</label>
                    <select 
                      value={newWorkflow.action}
                      onChange={e => setNewWorkflow({...newWorkflow, action: e.target.value})}
                      className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary appearance-none"
                    >
                      <option value="WHATSAPP_MESSAGE">Send WhatsApp Message</option>
                      <option value="META_CONVERSION_API">Meta: Fire Conversion</option>
                      <option value="CUSTOM_WEBHOOK">Custom Webhook</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-dashed border-border mt-8 flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4">
                     <Plus className="w-5 h-5 text-brand-primary" />
                   </div>
                   <p className="text-sm font-medium">Add Logic Step (Optional)</p>
                   <p className="text-xs text-gray-500 mt-1">Filters, Delays, or Custom Scripts</p>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowBuilder(false)} className="flex-1 px-4 py-3 rounded-lg border border-border font-bold hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 px-4 py-3 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all">Enable Workflow</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
