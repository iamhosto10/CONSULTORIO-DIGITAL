import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50 print:block print:h-auto print:bg-white">
      <div className="print:hidden ">
        <Sidebar user={session.user} />
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
        {children}
      </main>
    </div>
  );
}
