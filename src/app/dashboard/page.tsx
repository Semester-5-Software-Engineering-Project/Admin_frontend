'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/context/authStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock stats data
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Tutors',
      value: '342',
      change: '+8.2%',
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Modules',
      value: '156',
      change: '+3.1%',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Payments',
      value: '$24,500',
      change: '+18.3%',
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'tutor_approval',
      message: 'John Smith approved as tutor',
      time: '5 minutes ago',
      user: 'John Smith',
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment of $500 processed for Sarah Johnson',
      time: '1 hour ago',
      user: 'Sarah Johnson',
    },
    {
      id: 3,
      type: 'enrollment',
      message: 'Alice Brown enrolled in Mathematics 101',
      time: '2 hours ago',
      user: 'Alice Brown',
    },
    {
      id: 4,
      type: 'ban',
      message: 'User Mike Davis temporarily banned',
      time: '3 hours ago',
      user: 'Mike Davis',
    },
  ];

  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday, 2 AM - 4 AM EST',
      priority: 'high' as const,
      date: '2025-10-10',
    },
    {
      id: 2,
      title: 'New Feature Released',
      message: 'Analytics dashboard now includes revenue forecasting',
      priority: 'medium' as const,
      date: '2025-10-05',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black border-2 border-yellow-300 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-display font-bold mb-2 drop-shadow-sm">
                    Welcome back, {user?.name || 'Admin'}! 👋
                  </h1>
                  <p className="text-black/80 text-lg font-semibold">
                    Here&apos;s what&apos;s happening with your platform today.
                  </p>
                </div>
                <Avatar
                  src={user?.profilePicture}
                  name={user?.name}
                  size="xl"
                  className="hidden md:block ring-4 ring-white shadow-xl"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} hoverable className="group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1 font-semibold">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors">{stat.value}</h3>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-sm font-bold text-green-600">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon size={24} className={stat.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Recent Activities & Announcements */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-yellow-50 transition-all duration-200 border border-transparent hover:border-yellow-200 group cursor-pointer"
                  >
                    <Avatar name={activity.user} size="md" className="group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="text-sm text-black font-semibold group-hover:text-yellow-700 transition-colors">{activity.message}</p>
                      <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-400 transition-all duration-200 hover:shadow-md group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-black group-hover:text-yellow-700 transition-colors">{announcement.title}</h4>
                      <Badge
                        variant={
                          announcement.priority === 'high'
                            ? 'danger'
                            : announcement.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-2">{announcement.message}</p>
                    <span className="text-xs text-gray-500 font-semibold">{announcement.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Revenue Stats */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white border-2 border-gray-700 shadow-2xl hover:shadow-yellow-400/20 transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1 font-semibold">Total Revenue This Month</p>
                  <h3 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">$142,850</h3>
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">+23.5% from last month</span>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-xl">
                  <TrendingUp size={48} className="text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
