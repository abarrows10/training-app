"use client";

import { StoreProvider } from '@/store';
import './global.css';
import { useState, useEffect } from 'react';

const PASSWORD = 'Griffey2410';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Start true to prevent flicker
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check localStorage on client side
    const auth = localStorage.getItem('bbTrainingAuth');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem('bbTrainingAuth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          {!isAuthenticated ? (
            <div className="min-h-screen bg-[#18191A] flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#242526] rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-white text-center mb-6">
                  Blakely & Baylor's Training
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-[#00A3E0] text-white p-3 rounded-lg hover:bg-[#0077A3] transition-colors font-semibold"
                  >
                    Enter App
                  </button>
                </form>
              </div>
            </div>
          ) : (
            children
          )}
        </StoreProvider>
      </body>
    </html>
  );
}