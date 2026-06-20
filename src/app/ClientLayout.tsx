'use client';


import ChatArea from '@/components/ChatArea';

export default function ClientLayout({ userId, userEmail, isAdmin }: { userId: string, userEmail?: string, isAdmin?: boolean }) {
  return (
    <main className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <div className="flex-1 min-w-0 transition-all duration-300 relative">
        <ChatArea userId={userId} userEmail={userEmail} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
