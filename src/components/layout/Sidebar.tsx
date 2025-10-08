'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAuthStore } from '@/context/authStore';

const baseNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Tutors', href: '/tutors', icon: GraduationCap },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Analytics', href: '/manage', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, hasRole } = useAuthStore();
  // Hydration guard: ensure the first client render matches SSR markup (which never has admin link)
  // This avoids a hydration mismatch when persisted auth state (admin role) appears only on the client.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const navItems = React.useMemo(() => {
    if (!hydrated) return [];
    // Only show if user has either ADMIN or SUPER_ADMIN
    if (!hasRole(['ADMIN','SUPER_ADMIN'])) return [];
    const items = [...baseNavItems];
    items.splice(1, 0, { name: 'Admin', href: '/admin', icon: ShieldCheck });
    return items;
  }, [hasRole, hydrated]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden lg:flex flex-col h-screen bg-gradient-to-b from-white to-gray-50 border-r-2 border-gray-200 sticky top-0 shadow-lg"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b-2 border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-black">TV</span>
              </div>
              <h1 className="text-xl font-display font-bold text-black">
                Tutor<span className="text-yellow-500">Verse</span>
              </h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 group"
          >
            {isCollapsed ? <Menu size={20} className="group-hover:scale-110 transition-transform" /> : <X size={20} className="group-hover:rotate-90 transition-transform" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black hover:scale-105'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={20} className="flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="relative z-10">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t-2 border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-semibold group'
            )}
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const { logout, hasRole } = useAuthStore();
  // Use same hydration guard to keep SSR/CSR output stable
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const navItems = React.useMemo(() => {
    if (!hydrated) return [];
    if (!hasRole(['ADMIN','SUPER_ADMIN'])) return [];
    const items = [...baseNavItems];
    items.splice(1, 0, { name: 'Admin', href: '/admin', icon: ShieldCheck });
    return items;
  }, [hasRole, hydrated]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-white to-gray-50 z-50 lg:hidden shadow-2xl"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-black">TV</span>
            </div>
            <h1 className="text-xl font-display font-bold text-black">
              Tutor<span className="text-yellow-500">Verse</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group',
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                )}
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
