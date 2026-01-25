import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
