'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LandingLoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the authentication matrix detects an active user session, bypass entry gate
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
        Verifying secure authorization sequence...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 selection:bg-neutral-800 relative overflow-hidden">
      
      {/* Visual Background Aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Authentication Container Card */}
      <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-900 p-8 rounded-2xl shadow-2xl backdrop-blur-md text-center z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-xl font-bold tracking-tighter mb-4 shadow-inner">
            CX
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-100 font-mono">CHRONOX_ENGINE</h1>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wide mt-1.5">Next-Gen Real-time Trivia Arena</p>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8 px-2">
          Secure identity token validation required. Connect via Google synchronization node to access multiplayer arenas and real-time AI logic matrices.
        </p>

        {/* Interactive Interactive Call-to-Action Button */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-mono font-bold text-xs py-3.5 rounded-xl tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.99]"
        >
          {/* Simple Inline SVG Asset Container for Google Icon representation */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.64l2.44-2.44C17.43 1.69 14.97 1 12.24 1 6.59 1 2 5.59 2 11.24s4.59 10.24 10.24 10.24c5.9 0 9.81-4.14 9.81-10 0-.67-.06-1.32-.18-1.97H12.24z"/>
          </svg>
          Synchronize with Google
        </button>

        {/* Footer Meta Notes */}
        <div className="mt-8 pt-6 border-t border-neutral-900 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
          Node Connection: Encrypted (TLS 1.3)
        </div>
      </div>
    </div>
  );
}
