'use client';

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Award, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CustomLineChart } from '@/components/charts/LineChart';
import Protected from '@/components/auth/Protected';
import { CustomBarChart } from '@/components/charts/BarChart';
import { CustomPieChart } from '@/components/charts/PieChart';
import Badge from '@/components/ui/Badge';

export default function ManagePage() {
  const [dateRange, setDateRange] = useState('6months');

  // Mock data for enrollment growth
  const enrollmentData = [
    { month: 'Apr', students: 420, tutors: 28 },
    { month: 'May', students: 580, tutors: 35 },
    { month: 'Jun', students: 750, tutors: 42 },
    { month: 'Jul', students: 920, tutors: 48 },
    { month: 'Aug', students: 1150, tutors: 55 },
    { month: 'Sep', students: 1380, tutors: 62 },
  ];

  // Mock data for revenue
  const revenueData = [
    { month: 'Apr', revenue: 12500, expenses: 8200 },
    { month: 'May', revenue: 15800, expenses: 9100 },
    { month: 'Jun', revenue: 18900, expenses: 10500 },
    { month: 'Jul', revenue: 22400, expenses: 11200 },
    { month: 'Aug', revenue: 26700, expenses: 12800 },
    { month: 'Sep', revenue: 31200, expenses: 13500 },
  ];

  // Mock data for tutor vs students ratio
  const ratioData = [
    { name: 'Tutors', value: 342 },
    { name: 'Students', value: 2847 },
  ];

  // Mock data for top modules
  const topModulesData = [
    { name: 'Computer Science', enrollments: 458, revenue: 22900 },
    { name: 'Mathematics', enrollments: 392, revenue: 19600 },
    { name: 'Physics', enrollments: 325, revenue: 16250 },
    { name: 'English', enrollments: 298, revenue: 14900 },
    { name: 'Chemistry', enrollments: 267, revenue: 13350 },
  ];

  return (
    <Protected>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text">Analytics & Insights</h1>
            <p className="text-text-light">Track performance metrics and trends</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-base w-full md:w-48"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary to-primary-600 text-secondary">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-secondary/80 text-sm mb-1">Highest Earning Tutor</p>
                  <h3 className="text-2xl font-bold mb-1">Sarah Johnson</h3>
                  <p className="text-3xl font-bold">$28,450</p>
                  <Badge className="mt-2 bg-secondary text-primary">Top Performer</Badge>
                </div>
                <div className="p-3 bg-secondary/20 rounded-2xl backdrop-blur">
                  <Award size={32} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary to-secondary-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Most Enrolled Module</p>
                  <h3 className="text-2xl font-bold mb-1">Computer Science</h3>
                  <p className="text-3xl font-bold">458 Students</p>
                  <Badge className="mt-2 bg-primary text-secondary">Trending</Badge>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur">
                  <BookOpen size={32} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Enrollment Growth */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Enrollment Growth</CardTitle>
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp size={20} />
                <span className="text-sm font-medium">+32.5% increase</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomLineChart
              data={enrollmentData}
              xAxisKey="month"
              dataKeys={[
                { key: 'students', color: '#FFD700', name: 'Students' },
                { key: 'tutors', color: '#171717', name: 'Tutors' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue & Expenses</CardTitle>
              <div className="flex items-center gap-2 text-green-600">
                <DollarSign size={20} />
                <span className="text-sm font-medium">Net: $17,700</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomBarChart
              data={revenueData}
              xAxisKey="month"
              dataKeys={[
                { key: 'revenue', color: '#10B981', name: 'Revenue' },
                { key: 'expenses', color: '#EF4444', name: 'Expenses' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tutor vs Students Ratio */}
          <Card>
            <CardHeader>
              <CardTitle>Tutor-Student Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomPieChart data={ratioData} />
              <div className="mt-4 p-4 bg-background rounded-xl">
                <p className="text-sm text-text-light">
                  Current ratio: <span className="font-semibold text-text">1:8.3</span>
                </p>
                <p className="text-xs text-text-lighter mt-1">
                  Healthy ratio for quality education delivery
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Popular Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topModulesData.map((module, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-secondary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-text">{module.name}</p>
                        <span className="text-sm text-text-light">{module.enrollments} students</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(module.enrollments / 458) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-lighter mt-1">
                        Revenue: ${module.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Calendar size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-text-light">Avg. Session Time</p>
                  <p className="text-lg font-bold text-text">45 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl">
                  <TrendingUp size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-text-light">Growth Rate</p>
                  <p className="text-lg font-bold text-text">+32.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Award size={24} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-text-light">Completion Rate</p>
                  <p className="text-lg font-bold text-text">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-xl">
                  <DollarSign size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-text-light">Avg. Revenue/Tutor</p>
                  <p className="text-lg font-bold text-text">$4,180</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
    </Protected>
  );
}
