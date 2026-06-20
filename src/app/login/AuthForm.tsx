'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { login } from './actions';
import { Sparkles } from 'lucide-react';

export default function AuthForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-[#f4e2d1]">
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0, rotate: -10 }} 
            animate={{ scale: 1, rotate: 0 }} 
            className="w-20 h-20 rounded-full flex items-center justify-center drop-shadow-md"
          >
            <Image src="/pretzel.png" alt="Pretzel Logo" width={80} height={80} />
          </motion.div>
        </div>
        
        <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#c77e40] to-[#8a4e25] mb-8">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full bg-[#fffaf5] border border-amber-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-gray-700"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-[#fffaf5] border border-amber-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-gray-700"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-[#de9b5e] to-[#b56e3b] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center"
          >
            {isLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
