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
  User as UserIcon
} from 'lucide-react';
import type { User } from 'next-auth';

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
      <div className="flex items-center justify-between p-4 bg-white border-b md:hidden">
        <span className="text-xl font-bold text-blue-600">Consultorio Digital</span>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:inset-auto
        `}
      >
        {/* Logo (Desktop) */}
        <div className="hidden h-16 items-center px-6 border-b border-gray-200 md:flex">
          <span className="text-xl font-bold text-blue-600">Consultorio Digital</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`
                      flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium
                      ${isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-4 px-2">
             <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || 'User'} className="h-9 w-9 rounded-full" />
                ) : (
                  <UserIcon size={20} />
                )}
             </div>
             <div className="ml-3 overflow-hidden">
               <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'Usuario'}</p>
               <p className="text-xs text-gray-500 truncate">{user?.email}</p>
             </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
