'use client';

import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Send, Sparkles, Languages, PenTool, CheckCircle, Copy, LogOut, ClipboardPaste, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, signup } from '@/app/login/actions';

export default function ChatArea({ userId, userEmail, isAdmin }: { userId: string, userEmail?: string, isAdmin?: boolean }) {
  const [selectedModes, setSelectedModes] = useState<string[]>(['translate']);
  const [translateLang, setTranslateLang] = useState('English');
  const [toneType, setToneType] = useState('Casual');
  const [textInput, setTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Admin Create User Modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const getMessageText = (m: any) => {
    return (m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')).replace(/---BEGIN USER INPUT---|---END USER INPUT---/g, '').trim();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(prev => prev + text);
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingUser(true);
    setAddUserError(null);
    setAddUserSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      setAddUserError(result.error);
    } else {
      setAddUserSuccess(true);
      setTimeout(() => {
        setShowAddUser(false);
        setAddUserSuccess(false);
      }, 2000);
    }
    setIsAddingUser(false);
  };

  const { messages, sendMessage, status } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';
  const pendingQueue = useRef<{ content: string; modes: string[]; lang: string; tone: string }[]>([]);
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modes = [
    { name: 'translate', label: 'Translate', icon: Languages, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'grammar', label: 'Grammar Fix', icon: CheckCircle, color: 'text-amber-700', bg: 'bg-amber-100/80' },
    { name: 'tone', label: 'Tone Changer', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-100' },
  ];

  const languages = ['English', 'Indonesian', 'Japanese', 'Korean', 'Spanish'];
  const tones = ['Professional', 'Chill', 'Casual', 'Last Chance'];

  const doSend = (content: string, modes: string[], lang: string, tone: string) => {
    sendMessage({ role: 'user', content } as any, {
      body: {
        user_id: userId,
        selected_option: modes.join(', '),
        target_language: modes.includes('translate') ? lang : '',
        tone_type: modes.includes('tone') ? tone : ''
      }
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!textInput || !textInput.trim() || textInput.length > 500) return;
    const content = textInput.trim();
    setTextInput('');
    
    if (isLoadingRef.current) {
      // Queue it — will be sent when AI finishes
      pendingQueue.current.push({ content, modes: selectedModes, lang: translateLang, tone: toneType });
    } else {
      doSend(content, selectedModes, translateLang, toneType);
    }
  };

  useEffect(() => {
    // When AI finishes, send next queued message if any
    if (!isLoading && pendingQueue.current.length > 0) {
      const next = pendingQueue.current.shift()!;
      doSend(next.content, next.modes, next.lang, next.tone);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isLoading, messages]);

  return (
    <div className="flex flex-col h-full bg-[#fffaf5] relative">
      {/* Top Bar Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {isAdmin && (
          <button 
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-blue-50 text-gray-500 hover:text-blue-500 rounded-xl text-xs font-medium transition-colors shadow-sm backdrop-blur-sm border border-white/20"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        )}
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl text-xs font-medium transition-colors shadow-sm backdrop-blur-sm border border-white/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                Create New User
              </h3>
              <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-4 space-y-4">
              {addUserError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{addUserError}</div>}
              {addUserSuccess && <div className="text-xs text-green-500 bg-green-50 p-2 rounded-lg">User created successfully!</div>}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input name="email" type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="user@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <input name="password" type="password" required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isAddingUser} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm transition-colors flex justify-center items-center">
                {isAddingUser ? <Sparkles className="w-4 h-4 animate-spin" /> : 'Create User'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Image src="/pretzel.png" alt="Pretzel" width={110} height={110} className="drop-shadow-md mb-2" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-[#b56e3b]">
              Hi there! How can I help?
            </h1>
            <p className="text-gray-500 max-w-md">
              I can translate languages, fix your grammar, make your text sound professional, or change the tone.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id} 
              className={cn(
                "flex w-full",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm",
                m.role === 'user' 
                  ? "bg-gradient-to-r from-[#de9b5e] to-[#c77e40] text-white rounded-br-none" 
                  : "bg-white border border-amber-100 text-gray-800 rounded-bl-none"
              )}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/pretzel.png" alt="Pretzel" width={18} height={18} />
                    <span className="text-xs font-semibold text-[#a55f30]">Pretzel AI</span>
                  </div>
                )}
                <div className={cn("whitespace-pre-wrap leading-relaxed", m.role === 'user' ? "text-sm md:text-base" : "text-sm md:text-base")}>
                  {getMessageText(m)}
                </div>
                {m.role === 'assistant' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCopy(m.id, getMessageText(m))}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium"
                    >
                      {copiedId === m.id ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-amber-100/50">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1 pt-1">
            {modes.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => {
                  setSelectedModes(prev => 
                    prev.includes(m.name)
                      ? prev.filter(mode => mode !== m.name) // Remove if already selected
                      : [...prev, m.name] // Add if not selected
                  );
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  selectedModes.includes(m.name)
                    ? `${m.bg} ${m.color} ring-2 ring-offset-2 ring-${m.color.split('-')[1]}-400` 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Sub-options for Translate */}
          {selectedModes.includes('translate') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <span className="text-xs font-semibold text-gray-400 flex items-center mr-1">To:</span>
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setTranslateLang(lang)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                    translateLang === lang
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"
                  )}
                >
                  {lang}
                </button>
              ))}
            </motion.div>
          )}

          {/* Sub-options for Tone Changer */}
          {selectedModes.includes('tone') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <span className="text-xs font-semibold text-gray-400 flex items-center mr-1">Tone:</span>
              {tones.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setToneType(tone)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                    toneType === tone
                      ? "bg-orange-400 text-white shadow-sm"
                      : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-50"
                  )}
                >
                  {tone}
                </button>
              ))}
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              maxLength={500}
              placeholder={selectedModes.includes('translate') ? `Type your text to translate to ${translateLang}...` : "Type your text here..."}
              className="w-full bg-[#fffcf8] border border-amber-200/60 rounded-2xl px-4 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all resize-none h-24 md:h-32 text-gray-700 text-sm md:text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
              }}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">
                {textInput.length}/500
              </span>
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!textInput || !textInput.trim()}
                className="relative bg-gradient-to-r from-[#d98b48] to-[#b56e3b] text-white p-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                {pendingQueue.current.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingQueue.current.length}
                  </span>
                )}
                <motion.div
                  animate={isLoading ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
