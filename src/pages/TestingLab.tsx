import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Save, Trash2, ChevronDown, Braces, Clock, Database, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function TestingLab() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  \n}');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/integrations')
      .then(res => res.json())
      .then(setIntegrations);
  }, []);

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/test-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegrationId || null,
          method,
          path,
          headers,
          body
        })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedIntegration = integrations.find(i => i.id === selectedIntegrationId);

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Request Builder */}
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-white/5">
          <div className="flex bg-white/5 rounded-lg p-1 border border-border">
            {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  method === m ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              {selectedIntegration && (
                <span className="text-xs font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded">
                  {JSON.parse(selectedIntegration.config).baseUrl}
                </span>
              )}
            </div>
            <input 
              type="text" 
              placeholder="/users/v1"
              value={path}
              onChange={e => setPath(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg pl-32 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>

          <button 
            disabled={isLoading}
            onClick={handleSend}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-brand-primary/20"
          >
            {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Send
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
          {/* Headers Editor */}
          <div className="border-r border-border flex flex-col">
            <div className="p-3 border-b border-border bg-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3" />
                Integration Context
              </span>
              <select 
                value={selectedIntegrationId}
                onChange={e => setSelectedIntegrationId(e.target.value)}
                className="bg-transparent text-xs text-brand-primary font-semibold outline-none"
              >
                <option value="">No Integration (Direct Call)</option>
                {integrations.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 p-4 bg-surface/50">
               <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Headers (JSON)</label>
               <textarea 
                value={headers}
                onChange={e => setHeaders(e.target.value)}
                className="w-full h-32 bg-transparent text-sm font-mono focus:outline-none resize-none scrollbar-hide text-brand-secondary"
               />
               <div className="h-px bg-border my-4" />
               <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Body (JSON)</label>
               <textarea 
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full h-48 bg-transparent text-sm font-mono focus:outline-none resize-none scrollbar-hide text-gray-300"
               />
            </div>
          </div>

          {/* Response Viewer */}
          <div className="flex flex-col min-h-[400px]">
            <div className="p-3 border-b border-border bg-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                <Braces className="w-3 h-3" />
                Response
              </span>
              {response && (
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${response.status < 400 ? 'text-brand-success' : 'text-brand-error'}`}>
                    {response.status} {response.status < 400 ? 'OK' : 'ERROR'}
                  </span>
                  <div className="w-px h-3 bg-border" />
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {response.latency}ms
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 bg-bg-navy/50 overflow-auto scrollbar-hide">
              {response ? (
                <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-4">
                    <Play className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">Click Send to test your API</p>
                  <p className="text-xs text-gray-600 mt-1">Logs will be recorded if an integration is selected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
