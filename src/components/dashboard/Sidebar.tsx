'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Stethoscope
} from 'lucide-react';
import type { User } from 'next-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user?: User;
}

const navItems = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 md:hidden text-white">
        <span className="text-xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Consultorio
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:inset-auto"
        )}
      >
        {/* Logo (Desktop) */}
        <div className="hidden h-20 items-center px-6 border-b border-slate-800 md:flex">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary" />
             </div>
             <span className="text-xl font-bold text-white tracking-tight">Consultorio</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium group",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon
                        className={cn(
                            "mr-4 h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-slate-500 group-hover:text-white"
                        )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-800 p-6">
          <div className="flex items-center mb-6 px-2">
             <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-slate-400" />
                )}
             </div>
             <div className="ml-3 overflow-hidden">
               <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
               <p className="text-xs text-slate-500 truncate">{user?.email}</p>
             </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full justify-start pl-4"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
