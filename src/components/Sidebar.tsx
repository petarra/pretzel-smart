'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PlusCircle, MessageSquare, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/login/actions';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen, setIsOpen, userId }: { isOpen: boolean; setIsOpen: (val: boolean) => void; userId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    
    // Fetch initial history
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data) setHistory(data);
    };

    fetchHistory();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('chat_history_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_history', filter: `user_id=eq.${userId}` }, (payload) => {
        setHistory((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 260 : 64 }}
      className="h-full bg-pink-50/80 backdrop-blur-md border-r border-pink-100 flex flex-col transition-all duration-300 shadow-sm z-20"
    >
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors text-pink-500"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="px-3 mt-4">
        <button className="flex items-center gap-3 w-full p-3 rounded-2xl bg-white shadow-sm border border-pink-100 hover:shadow-md hover:bg-pink-50 transition-all text-pink-600 font-medium overflow-hidden group">
          <PlusCircle className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-6 px-3 space-y-2 no-scrollbar">
        {history.map((chat) => (
          <div 
            key={chat.id} 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-100/70 transition-colors cursor-pointer text-gray-700 overflow-hidden"
            title={chat.input_text}
          >
            <MessageSquare className="w-5 h-5 text-pink-400 flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap truncate text-sm"
                >
                  {chat.input_text}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="p-3 mt-auto border-t border-pink-100">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors overflow-hidden"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-medium text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
