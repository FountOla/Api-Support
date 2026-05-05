import React, { useState, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  _count: { requests: number, logs: number };
}

export default function Overview() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    fetch('/api/integrations')
      .then(res => res.json())
      .then(setIntegrations);
  }, []);

  const stats = [
    { label: 'Total Requests', value: '1,284', change: '+12%', icon: Activity, color: 'text-brand-secondary' },
    { label: 'Success Rate', value: '98.2%', change: '+0.5%', icon: CheckCircle2, color: 'text-brand-success' },
    { label: 'Avg Latency', value: '245ms', change: '-14ms', icon: Clock, color: 'text-brand-warning' },
    { label: 'Active Connectors', value: integrations.length, change: '+1', icon: Zap, color: 'text-brand-primary' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">System Health</h3>
            <button className="text-xs text-brand-primary font-medium hover:underline">View detailed logs</button>
          </div>
          <div className="space-y-4">
            {integrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No integrations found. Add one to see monitoring data.
              </div>
            ) : integrations.map((it) => (
              <div key={it.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-border transition-all">
                <div className={`w-2 h-2 rounded-full ${it.status === 'ACTIVE' ? 'bg-brand-success' : 'bg-brand-warning'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{it.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{it._count.requests} reqs</p>
                  <p className="text-xs text-gray-500">99.1% uptime</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`h-4 w-1 rounded-full ${i === 8 ? 'bg-brand-warning' : 'bg-brand-success'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-6">Active Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-error/10 border border-brand-error/20 flex gap-4">
              <AlertTriangle className="w-5 h-5 text-brand-error shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Stripe: High Latency</p>
                <p className="text-xs text-gray-400 mt-1">Average response time increased by 400ms in the last 15 mins.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-brand-warning/10 border border-brand-warning/20 flex gap-4">
              <Clock className="w-5 h-5 text-brand-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Meta API: Rate Limit</p>
                <p className="text-xs text-gray-400 mt-1">Approaching 80% of your current tier quota.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
