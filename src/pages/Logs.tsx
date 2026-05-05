import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Clock, Hash, Globe, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/logs')
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time monitoring of all connector activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-white/5 transition-all text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-white/5 transition-all text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            <Clock className="w-3.5 h-3.5" />
            Real-time
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Event</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connector</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Path</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Latency</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {logs.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">
                   No activity recorded yet. Run a test in the Testing Lab.
                 </td>
               </tr>
            ) : logs.map((log, i) => (
              <motion.tr 
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${log.level === 'ERROR' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'}`}>
                      {log.level === 'ERROR' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-semibold">{log.message}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Hash className="w-3.5 h-3.5" />
                    {log.integration?.name || 'Manual'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded">
                    {log.context ? JSON.parse(log.context).path : '/api/v1'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    log.level === 'ERROR' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'
                  }`}>
                    {log.level === 'ERROR' ? '500' : '200'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-mono text-gray-500">142ms</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
