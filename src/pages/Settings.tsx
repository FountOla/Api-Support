import React from 'react';
import { Github, Shield, Bell, CreditCard, Users, Link2, ExternalLink, GitBranch } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <Github className="w-6 h-6 text-white" />
          GitHub Integration
        </h2>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Github className="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold">Connect your repositories</h3>
                <p className="text-sm text-gray-500 mt-1">Sync your API connectors with GitHub to auto-detect endpoints and manage versions.</p>
              </div>
            </div>
            <button className="bg-white text-bg-navy px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-all flex items-center gap-2">
              Connect Account
              <Link2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-8 border-t border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border border-dashed flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <GitBranch className="w-5 h-5 text-gray-600" />
                 <span className="text-sm font-medium text-gray-500 italic">No repo connected</span>
               </div>
               <button className="text-[10px] uppercase font-bold text-brand-primary">Browse Repos</button>
            </div>
             <div className="p-4 rounded-xl border border-border border-dashed flex items-center justify-center text-xs text-gray-600">
               Developer Mode: Enabled
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-white" />
          Workspace & Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-2">Team Members</h3>
            <p className="text-sm text-gray-500 mb-6">Manage who has access to your API integrations.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-bold">LD</div>
                  <div>
                    <p className="text-sm font-bold">Lead Dev</p>
                    <p className="text-[10px] text-gray-500">OWNER</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 bg-white/5 border border-border rounded-lg text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Invite Member
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="font-bold mb-2">API Keys</h3>
             <p className="text-sm text-gray-500 mb-6">Your personal Hub tokens for external CLI access.</p>
             <div className="flex items-center gap-2">
               <input readOnly value="hub_live_283749283749283..." className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2 text-xs font-mono text-gray-500" />
               <button className="p-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-all">
                 <ExternalLink className="w-4 h-4 text-gray-500" />
               </button>
             </div>
          </div>
        </div>
      </section>

      <section>
        <div className="glass-card p-6 border-brand-primary/20 bg-brand-primary/5">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="font-bold flex items-center gap-2 text-brand-primary">
                 <CreditCard className="w-5 h-5" />
                 Pro Plan
               </h3>
               <p className="text-sm text-gray-400 mt-1">Unlock unlimited workflows, custom connectors and priority human support.</p>
             </div>
             <button className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">Upgrade Now</button>
           </div>
        </div>
      </section>
    </div>
  );
}
