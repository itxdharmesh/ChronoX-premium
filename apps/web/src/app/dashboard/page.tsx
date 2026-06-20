'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlobalChat } from '../../components/GlobalChat';
import { UserEntity } from '../../core/entities/User';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserEntity[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const result = await res.json();
        if (result.success) {
          setLeaderboard(result.data);
        }
      } catch (err) {
        console.error("Failed to sync leaderboard feed:", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
        Loading user matrix profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 font-sans selection:bg-neutral-800">
      {/* Top Navbar Action Space */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-neutral-900 pb-5 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100 font-mono">CHRONOX_CORE</h1>
          <p className="text-xs text-neutral-500 font-mono uppercase mt-0.5">Operational Control Panel</p>
        </div>
        <button
          onClick={logout}
          className="border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all"
        >
          Disconnect Session
        </button>
      </div>

      {/* Main Dashboard Interactive Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Player Profile Status Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest mb-4">User Identity Node</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg font-bold font-mono text-amber-400 uppercase">
                {user.displayName.slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-base text-neutral-100">{user.displayName}</div>
                <div className="text-xs font-mono text-neutral-500">{user.email}</div>
              </div>
            </div>

            {/* Level and XP Data Modules */}
            <div className="space-y-4 pt-4 border-t border-neutral-800/60">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono text-neutral-500 uppercase">Current Level</span>
                <span className="text-2xl font-black font-mono text-neutral-100">LVL {user.level}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono text-neutral-500 uppercase">Accumulated Metrics</span>
                <span className="text-sm font-bold font-mono text-amber-500">{user.xp} XP</span>
              </div>
            </div>
          </div>

          {/* Quick Play Matchmaking Action Block */}
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-48">
            <div>
              <h3 className="text-sm font-bold text-neutral-200">Arena Matchmaking</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Initialize connection loop to secure a real-time competitive lobby instance against an online opponent.</p>
            </div>
            <button className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-mono font-bold text-xs py-3 rounded-xl tracking-wider uppercase transition-all shadow-md">
              Launch Arena Interface
            </button>
          </div>
        </div>

        {/* Column 2: Live Leaderboard Module */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl shadow-xl flex flex-col h-[520px] lg:col-span-1 overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/40">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">Global Standings Matrix</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {loadingLeaderboard ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-600 uppercase">Syncing scoreboard nodes...</div>
            ) : leaderboard.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-600 uppercase">Database record matrix empty.</div>
            ) : (
              leaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    player.email === user.email 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-neutral-950/40 border-neutral-800/50 hover:border-neutral-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-mono font-bold text-neutral-500 text-center">{index + 1}</span>
                    <span className="text-sm font-medium text-neutral-300">{player.displayName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-neutral-500">Lvl {player.level}</span>
                    <span className="font-bold text-neutral-400">{player.xp} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Integrated Global Chat Box */}
        <div className="lg:col-span-1 flex justify-center lg:justify-end">
          <GlobalChat />
        </div>

      </div>
    </div>
  );
}
