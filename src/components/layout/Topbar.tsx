'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Menu } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/context/authStore';
import { adminAPI } from '@/API/admin';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);

  useEffect(() => {
    adminAPI.getAdminImageUrl()
      .then(setAdminImageUrl)
      .catch(() => setAdminImageUrl(null));
  }, []);

  // Mock notifications
  const notifications = [
    { id: 1, message: 'New payment request from John Doe', time: '5m ago' },
    { id: 2, message: 'Tutor Sarah approved successfully', time: '1h ago' },
    { id: 3, message: 'Student Alice enrolled in Math 101', time: '2h ago' },
  ];

  return (
    <header className="h-20 bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 group"
          >
            <Menu size={24} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* <div className="hidden md:flex items-center gap-2 bg-gray-50 border-2 border-gray-200 px-4 py-2.5 rounded-xl flex-1 max-w-md hover:border-yellow-400 focus-within:border-yellow-400 focus-within:ring-4 focus-within:ring-yellow-100 transition-all duration-200">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none flex-1 text-black placeholder:text-gray-400 font-medium"
            />
          </div> */}
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-yellow-50 transition-all duration-200 group"
            >
              <Bell size={24} className="text-gray-700 group-hover:text-yellow-600 group-hover:scale-110 transition-all" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shadow-lg" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl p-4 z-50 border-2 border-gray-100"
                  >
                    <h3 className="font-bold text-black mb-3 text-lg">Notifications</h3>
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-yellow-200"
                        >
                          <p className="text-sm text-black font-medium">{notif.message}</p>
                          <span className="text-xs text-gray-500 font-medium">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              {adminImageUrl ? (
                <Image
                  src={adminImageUrl}
                  alt="Admin"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <Avatar
                  src={user?.profilePicture}
                  name={user?.name || 'Admin'}
                  size="md"
                />
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-text">{user?.name || 'Admin'}</p>
                <p className="text-xs text-text-light">{user?.role || 'Administrator'}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-strong p-2 z-50"
                  >
                    <a
                      href="/settings"
                      className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-text"
                    >
                      Settings
                    </a>
                    <button
                      onClick={() => {
                        useAuthStore.getState().logout();
                        window.location.href = '/login';
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
