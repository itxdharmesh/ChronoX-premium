import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import './globals.css'; // Global styles sheet fallback path

export const metadata = {
  title: 'Chronox Engine',
  description: 'Real-time competitive universe fueled by Gemini AI inference',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-200 antialiased selection:bg-neutral-800">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
