'use client';

import React from 'react';
import { TrendingUp, DollarSign, BookOpen, Calendar, Users as UsersIcon, ShieldCheck, Star, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CustomLineChart } from '@/components/charts/LineChart';
import Protected from '@/components/auth/Protected';
import { CustomBarChart } from '@/components/charts/BarChart';
import { CustomPieChart } from '@/components/charts/PieChart';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { analyticsAPI } from '@/API/analytics';
import type { AnalyticsOverviewDto } from '@/types';

export default function ManagePage() {
  const [data, setData] = React.useState<AnalyticsOverviewDto | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await analyticsAPI.getAdminAnalyticsOverview();
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError('Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ElementType; accent?: string }>=({ title, value, icon: Icon, accent = 'bg-yellow-50 text-yellow-700' }) => (
    <Card hoverable>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1 font-semibold">{title}</p>
            <h3 className="text-3xl font-bold text-black">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${accent}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Protected>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-text">Manage Analytics</h1>
            <p className="text-text-light">Insights powered by admin analytics overview</p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && error && (
            <EmptyState title="Couldn’t load analytics" description="Please try again later." />
          )}

          {!loading && data && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={data.users.total.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Admins" value={data.admins.toLocaleString()} icon={ShieldCheck} />
                <StatCard title="Tutors" value={data.tutors.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Students" value={data.students.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Active Students" value={data.activeStudents.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Inactive Students" value={data.inactiveStudents.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Active Modules" value={data.activeModules.toLocaleString()} icon={BookOpen} />
                <StatCard title="Enrollments" value={data.enrollments.toLocaleString()} icon={BookOpen} />
                <StatCard title="Users with 2FA" value={data.usersWith2FA.toLocaleString()} icon={ShieldCheck} />
                {/* <StatCard title="Avg Rating" value={data.averageRating.toFixed(2)} icon={Star} /> */}
                {/* <StatCard title="Upcoming Schedules" value={data.upcomingSchedules.toLocaleString()} icon={CalendarClock} /> */}
                <StatCard title="Revenue (30d)" value={`$${data.revenueLast30Days.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={DollarSign} />
              </div>

              {/* Revenue trend and Tutor statuses */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Revenue Last 6 Months</CardTitle>
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp size={20} />
                        <span className="text-sm font-medium">Total: ${data.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CustomLineChart
                      data={data.revenueLast6Months.map(p => ({ month: p.month, revenue: p.amount }))}
                      xAxisKey="month"
                      dataKeys={[{ key: 'revenue', color: '#F59E0B', name: 'Revenue' }]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tutor Statuses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomPieChart
                      data={[
                        { name: 'Approved', value: data.tutorStatuses.approved },
                        { name: 'Pending', value: data.tutorStatuses.pending },
                        { name: 'Banned', value: data.tutorStatuses.banned },
                      ]}
                      colors={["#10B981", "#F59E0B", "#EF4444"]}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Users & Modules snapshots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Signups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart
                      data={[
                        { label: 'Total', count: data.users.total },
                        { label: 'Last 30d', count: data.users.last30Days },
                        { label: 'Last 7d', count: data.users.last7Days },
                      ]}
                      xAxisKey="label"
                      dataKeys={[{ key: 'count', color: '#F59E0B', name: 'Users' }]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Modules Added</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart
                      data={[
                        { label: 'Total', count: data.modules.total },
                        { label: 'Last 30d', count: data.modules.last30Days },
                        { label: 'Last 7d', count: data.modules.last7Days },
                      ]}
                      xAxisKey="label"
                      dataKeys={[{ key: 'count', color: '#3B82F6', name: 'Modules' }]}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Tutor vs Student ratio */}
              <Card>
                <CardHeader>
                  <CardTitle>Tutor-Student Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomPieChart data={[
                    { name: 'Tutors', value: data.tutors },
                    { name: 'Students', value: data.students },
                  ]} />
                </CardContent>
              </Card>

              {/* Top modules by revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Modules by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {(!data.topModulesByRevenue || data.topModulesByRevenue.length === 0) ? (
                    <EmptyState title="No data" description="No revenue data available for modules." />
                  ) : (
                    <CustomBarChart
                      data={data.topModulesByRevenue.map(m => ({ name: m.name, revenue: m.value }))}
                      xAxisKey="name"
                      dataKeys={[{ key: 'revenue', color: '#8B5CF6', name: 'Revenue' }]}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Calendar size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-light">Upcoming Schedules</p>
                        <p className="text-lg font-bold text-text">{data.upcomingSchedules.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
                {/* <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-xl">
                        <TrendingUp size={24} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-light">Revenue (30d)</p>
                        <p className="text-lg font-bold text-text">${data.revenueLast30Days.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
                {/* <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-xl">
                        <Star size={24} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-light">Average Rating</p>
                        <p className="text-lg font-bold text-text">{data.averageRating.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
                {/* <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 rounded-xl">
                        <DollarSign size={24} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-light">Total Revenue</p>
                        <p className="text-lg font-bold text-text">${data.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </Protected>
  );
}
