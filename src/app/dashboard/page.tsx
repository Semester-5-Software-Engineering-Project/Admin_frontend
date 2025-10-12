 'use client';

import React from 'react';
import Protected from '@/components/auth/Protected';
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
import { useEffect, useState } from 'react';
import { adminAPI } from '@/API/admin';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import announcementsAPI from '@/API/announcements';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { fetchStudentCount, fetchStudentGrowthPercentLastMonth } from '@/API/student';
import { fetchModuleCount, fetchModuleGrowthPercentLastMonth } from '@/API/modules';
import { fetchTutorTotalCount, fetchTutorGrowthPercentLastMonth } from '@/API/tutor';
import { paymentsAPI } from '@/API/payments';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  useEffect(() => {
    adminAPI.getAdminImageUrl()
      .then(setAdminImageUrl)
      .catch(() => setAdminImageUrl(null));
  }, []);
  const [studentCount, setStudentCount] = React.useState<number | null>(null);
  const [studentCountError, setStudentCountError] = React.useState<string | null>(null);
  const [moduleCount, setModuleCount] = React.useState<number | null>(null);
  const [moduleCountError, setModuleCountError] = React.useState<string | null>(null);
  const [moduleGrowthPercent, setModuleGrowthPercent] = React.useState<number | null>(null);
  const [moduleGrowthError, setModuleGrowthError] = React.useState<string | null>(null);
  const [tutorCount, setTutorCount] = React.useState<number | null>(null);
  const [tutorCountError, setTutorCountError] = React.useState<string | null>(null);
  const [tutorGrowthPercent, setTutorGrowthPercent] = React.useState<number | null>(null);
  const [tutorGrowthError, setTutorGrowthError] = React.useState<string | null>(null);
  const [studentGrowthPercent, setStudentGrowthPercent] = React.useState<number | null>(null);
  const [studentGrowthError, setStudentGrowthError] = React.useState<string | null>(null);
  const [announcements, setAnnouncements] = React.useState<import('@/types').AnnouncementGetDto[] | null>(null);
  const [announcementsLoading, setAnnouncementsLoading] = React.useState<boolean>(false);
  const [announcementsError, setAnnouncementsError] = React.useState<string | null>(null);
  
  // Revenue state
  const [totalRevenue, setTotalRevenue] = React.useState<number | null>(null);
  const [revenueError, setRevenueError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const count = await fetchStudentCount();
        if (!cancelled) setStudentCount(count);
      } catch {
        if (!cancelled) setStudentCountError('Failed to load');
      }
      try {
        const mCount = await fetchModuleCount();
        if (!cancelled) setModuleCount(mCount);
      } catch {
        if (!cancelled) setModuleCountError('Failed to load');
      }
      try {
        const mGrowth = await fetchModuleGrowthPercentLastMonth();
        if (!cancelled) setModuleGrowthPercent(mGrowth);
      } catch {
        if (!cancelled) setModuleGrowthError('Failed to load');
      }
      try {
        const tCount = await fetchTutorTotalCount();
        if (!cancelled) setTutorCount(tCount);
      } catch {
        if (!cancelled) setTutorCountError('Failed to load');
      }
      try {
        const tGrowth = await fetchTutorGrowthPercentLastMonth();
        if (!cancelled) setTutorGrowthPercent(tGrowth);
      } catch {
        if (!cancelled) setTutorGrowthError('Failed to load');
      }
      try {
        const growth = await fetchStudentGrowthPercentLastMonth();
        if (!cancelled) setStudentGrowthPercent(growth);
      } catch {
        if (!cancelled) setStudentGrowthError('Failed to load');
      }
      
      // Fetch total revenue
      try {
        const revenue = await paymentsAPI.getTotalRevenue();
        if (!cancelled) setTotalRevenue(revenue);
      } catch {
        if (!cancelled) setRevenueError('Failed to load');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load active announcements
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setAnnouncementsLoading(true);
        const data = await announcementsAPI.list(true);
        console.log(data);
        if (!cancelled) {
          // Rely on backend to return only active announcements
          setAnnouncements(data);
        }
      } catch {
        if (!cancelled) setAnnouncementsError('Failed to load announcements');
      } finally {
        if (!cancelled) setAnnouncementsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Stats data (student count live, others currently mocked)
  const stats = [
    {
      title: 'Total Students',
      value: studentCountError ? '—' : (studentCount !== null ? studentCount.toLocaleString() : 'Loading…'),
      change: studentGrowthError ? '—' : (studentGrowthPercent !== null ? `${studentGrowthPercent.toFixed(1)}%` : 'Loading…'),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Tutors',
      value: tutorCountError ? '—' : (tutorCount !== null ? tutorCount.toLocaleString() : 'Loading…'),
      change: tutorGrowthError ? '—' : (tutorGrowthPercent !== null ? `${tutorGrowthPercent.toFixed(1)}%` : 'Loading…'),
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Modules',
      value: moduleCountError ? '—' : (moduleCount !== null ? moduleCount.toLocaleString() : 'Loading…'),
      change: moduleGrowthError ? '—' : (moduleGrowthPercent !== null ? `${moduleGrowthPercent.toFixed(1)}%` : 'Loading…'),
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

  // Announcements now loaded from API

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
    <Protected>
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
                {adminImageUrl ? (
                  <img
                    src={adminImageUrl}
                    alt="Admin"
                    className="hidden md:block w-24 h-24 rounded-full ring-4 ring-white shadow-xxl object-cover"
                  />
                ) : (
                  <Avatar
                    src={user?.profilePicture}
                    name={user?.name}
                    size="xxl"
                    className="hidden md:block ring-4 ring-white shadow-xxl"
                  />
                )}
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
                        <span className="text-sm font-semibold text-gray-700">
                          {stat.change}
                        </span>
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
              {announcementsLoading && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {!announcementsLoading && announcementsError && (
                <EmptyState
                  title="Couldn’t load announcements"
                  description="There was a problem fetching the latest announcements."
                />
              )}

              {!announcementsLoading && !announcementsError && (
                <>
                  {(!announcements || announcements.length === 0) ? (
                    <EmptyState
                      title="No active announcements"
                      description="Announcements marked active will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-400 transition-all duration-200 hover:shadow-md group cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-black group-hover:text-yellow-700 transition-colors">{a.title}</h4>
                            <Badge variant="success" size="sm">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-2 break-words overflow-hidden">{a.content}</p>
                          <span className="text-xs text-gray-500 font-semibold">
                            {formatDate(a.createdAt, 'short')} • by {a.author}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Revenue Stats */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white border-2 border-gray-700 shadow-2xl hover:shadow-yellow-400/20 transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1 font-semibold">Total Revenue</p>
                  {revenueError ? (
                    <h3 className="text-5xl font-bold mb-3 text-red-400">Error</h3>
                  ) : totalRevenue !== null ? (
                    <h3 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                      {formatCurrency(totalRevenue)}
                    </h3>
                  ) : (
                    <div className="mb-3">
                      <Skeleton className="h-12 w-48 bg-gray-700" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">
                      {revenueError ? 'Failed to load' : totalRevenue !== null ? 'Total platform revenue' : 'Loading...'}
                    </span>
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
    </Protected>
  );
}
