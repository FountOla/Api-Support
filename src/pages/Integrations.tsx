import React, { useState, useEffect } from 'react';
import { Plus, Search, ExternalLink, MoreVertical, Shield, Globe, Zap, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INTEGRATION_TYPES = [
  { id: 'STRIPE', name: 'Stripe', icon: Zap, color: 'text-[#635BFF]' },
  { id: 'META', name: 'Meta / Facebook', icon: Globe, color: 'text-[#0668E1]' },
  { id: 'WHATSAPP', name: 'WhatsApp Business', icon: Shield, color: 'text-[#25D366]' },
  { id: 'HUBSPOT', name: 'HubSpot CRM', icon: Zap, color: 'text-[#FF7A59]' },
  { id: 'CUSTOM', name: 'Custom REST API', icon: Settings2, color: 'text-gray-400' },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({ name: '', type: 'STRIPE', baseUrl: '', apiKey: '' });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = () => {
    fetch('/api/integrations')
      .then(res => res.json())
      .then(setIntegrations);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      baseUrl: newIntegration.baseUrl,
      headers: { 'Authorization': `Bearer ${newIntegration.apiKey}` }
    };

    await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newIntegration.name,
        type: newIntegration.type,
        config,
        workspaceId: 'default-ws'
      })
    });

    setShowAddModal(false);
    fetchIntegrations();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">API Connectors</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your external API integrations and authentication.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((it) => {
          const typeInfo = INTEGRATION_TYPES.find(t => t.id === it.type);
          return (
            <motion.div 
              layout
              key={it.id}
              className="glass-card hover:border-brand-primary/40 transition-all group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${typeInfo?.color}`}>
                    {typeInfo ? <typeInfo.icon className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                      it.status === 'ACTIVE' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
                    }`}>
                      {it.status}
                    </span>
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-display font-bold text-lg">{it.name}</h3>
                <p className="text-sm text-gray-500 mt-1 font-mono text-xs truncate">
                  {JSON.parse(it.config).baseUrl || 'No base URL provided'}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Requests</p>
                    <p className="text-lg font-display font-bold">{it._count.requests}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Errors</p>
                    <p className="text-lg font-display font-bold text-brand-error">{it._count.logs}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-white/5 flex items-center justify-between">
                <button className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                  <Settings2 className="w-3.5 h-3.5" />
                  Configure
                </button>
                <button className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 transition-colors">
                  Test API
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-bg-navy/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl glass-card border-brand-primary/20 bg-surface shadow-2xl p-8"
            >
              <h2 className="text-2xl font-display font-bold mb-6">Connect New API</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Stripe Production"
                    value={newIntegration.name}
                    onChange={e => setNewIntegration({...newIntegration, name: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Provider Type</label>
                  <select 
                    value={newIntegration.type}
                    onChange={e => setNewIntegration({...newIntegration, type: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all appearance-none"
                  >
                    {INTEGRATION_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://api.example.com/v1"
                    value={newIntegration.baseUrl}
                    onChange={e => setNewIntegration({...newIntegration, baseUrl: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">API Key / Secret</label>
                  <input 
                    type="password" 
                    placeholder="Enter key if required"
                    value={newIntegration.apiKey}
                    onChange={e => setNewIntegration({...newIntegration, apiKey: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all font-mono"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-brand-primary text-sm font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                  >
                    Create Connector
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
