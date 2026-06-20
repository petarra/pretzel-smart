import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import ClientLayout from './ClientLayout'; // We will create this

export default async function Home() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <ClientLayout userId={user.id} userEmail={user.email} isAdmin={isAdmin} />
  );
}
