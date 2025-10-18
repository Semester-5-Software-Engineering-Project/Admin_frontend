 'use client';

import React from 'react';
import Image from 'next/image';
import Protected from '@/components/auth/Protected';
import reportsAPI from '@/API/reports';
import type { GetReportDto } from '@/types';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard,
  TrendingUp,
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
  
  // Pending payments state
  const [pendingPayments, setPendingPayments] = React.useState<number | null>(null);
  const [pendingPaymentsError, setPendingPaymentsError] = React.useState<string | null>(null);

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
      
      // Fetch pending payments amount
      try {
        const pending = await paymentsAPI.getTotalPending();
        if (!cancelled) setPendingPayments(pending);
      } catch {
        if (!cancelled) setPendingPaymentsError('Failed to load');
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
      value: pendingPaymentsError ? '—' : (pendingPayments !== null ? formatCurrency(pendingPayments) : 'Loading…'),
      change: pendingPaymentsError ? '—' : (pendingPayments !== null ? 'Awaiting approval' : 'Loading…'),
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  // Reports state
  const [reports, setReports] = React.useState<GetReportDto[] | null>(null);
  const [reportsLoading, setReportsLoading] = React.useState<boolean>(false);
  const [reportsError, setReportsError] = React.useState<string | null>(null);

  // Import reportsAPI
  // ...existing code...

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setReportsLoading(true);
        const data = await reportsAPI.list();
        if (!cancelled) setReports(data);
      } catch {
        if (!cancelled) setReportsError('Failed to load reports');
      } finally {
        if (!cancelled) setReportsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
                  <Image
                    src={adminImageUrl}
                    alt="Admin"
                    width={96}
                    height={96}
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
                      {<span className="text-4xl font-bold text-yellow-400">LKR {totalRevenue}</span>}
                    </h3>
                  ) : (
                    <div className="mb-3">
                      <Skeleton className="h-12 w-48 bg-gray-700" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {/* <DollarSign size={20} className="text-yellow-400" /> */}

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
          {/* Reports Section */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-100">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              )}
              {!reportsLoading && reportsError && (
                <EmptyState
                  title="Couldn’t load reports"
                  description="There was a problem fetching the latest reports."
                />
              )}
              {!reportsLoading && !reportsError && (
                <>
                  {(!reports || reports.length === 0) ? (
                    <EmptyState
                      title="No recent reports"
                      description="Reports will appear here when available."
                    />
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-200 transition-all duration-200 hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-black group-hover:text-yellow-700 transition-colors">{report.moduleName}</h4>
                            <Badge variant={report.status === 'Resolved' ? 'success' : 'warning'} size="sm">{report.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1 break-words overflow-hidden">{report.reason}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-semibold">{report.reportDate}</span>
                            <span className="text-xs text-gray-500 font-semibold">by {report.reportedBy}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
                              disabled={report.status === 'Reviewed' || report.status === 'Resolved'}
                              onClick={async () => {
                                await reportsAPI.reviewReport(report.id);
                                setReportsLoading(true);
                                const data = await reportsAPI.list();
                                setReports(data);
                                setReportsLoading(false);
                              }}
                            >Review</button>
                            <button
                              className="px-3 py-1 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
                              disabled={report.status === 'Resolved'}
                              onClick={async () => {
                                await reportsAPI.resolveReport(report.id);
                                setReportsLoading(true);
                                const data = await reportsAPI.list();
                                setReports(data);
                                setReportsLoading(false);
                              }}
                            >Resolve</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
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

        
      </motion.div>
    </DashboardLayout>
    </Protected>
  );
}
