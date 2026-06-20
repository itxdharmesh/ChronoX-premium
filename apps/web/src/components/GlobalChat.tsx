'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Message {
  displayName: string;
  message: string;
  timestamp: string;
}

export function GlobalChat() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Listen to real-time chat broadcasts from the server gateway
    socket.on('receive_global_chat', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_global_chat');
    };
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to the latest message payload
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    const messagePayload: Message = {
      displayName: user.displayName,
      message: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Emit event directly to the operational websocket channel
    socket.emit('send_global_chat', messagePayload);
    setInput('');
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col h-[450px] shadow-2xl overflow-hidden">
      {/* Chat Header Status Bar */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-200 text-sm tracking-wide uppercase">Global Arena Chat</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs text-neutral-400 font-mono">{connected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Messages Scrolling Grid */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-neutral-900/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-500 uppercase tracking-wider">
            No active transmission signals in lobby.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col bg-neutral-950/60 border border-neutral-800/40 p-2.5 rounded-lg max-w-[85%] self-start transition-all">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400 font-mono">{msg.displayName}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-neutral-300 break-words leading-relaxed">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Action Bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? "Broadcast encrypted transmission..." : "Reconnecting to matrix node..."}
          disabled={!connected}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 font-mono transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !input.trim()}
          className="bg-neutral-200 text-neutral-950 hover:bg-neutral-300 disabled:bg-neutral-800 disabled:text-neutral-600 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase"
        >
          Send
        </button>
      </form>
    </div>
  );
}
