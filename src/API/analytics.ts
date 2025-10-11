import apiClient from '@/lib/axios';
import {
  DashboardStats,
  RecentActivity,
  Announcement,
  AnalyticsData,
  AnalyticsOverviewDto,
  ApiResponse,
  UsersSummaryDto,
  StudentsSummaryDto,
  TutorsSummaryDto,
  ModulesSummaryDto,
  RevenueSummaryDto,
  RatingsSummaryDto,
  SchedulesSummaryDto,
  TopModulesDto,
} from '@/types';

// Helper to unwrap possible ApiResponse wrappers
const unwrap = <T>(res: { data: T | ApiResponse<T> }): T => {
  const body = res.data as ApiResponse<T>;
  return (body && typeof body === 'object' && 'data' in body ? body.data : (res.data as T));
};

export const analyticsAPI = {
  // Admin analytics overview composed from new endpoints (Spring: /api/admin/analytics/*)
  getAdminAnalyticsOverview: async (): Promise<AnalyticsOverviewDto> => {
    const [users, students, tutors, modules, enrollments, revenue, ratings, schedules, topModules] = await Promise.all([
      analyticsAPI.getUsersSummary(),
      analyticsAPI.getStudentsSummary(),
      analyticsAPI.getTutorsSummary(),
      analyticsAPI.getModulesSummary(),
      analyticsAPI.getEnrollmentsCount(),
      analyticsAPI.getRevenueSummary(),
      analyticsAPI.getRatingsSummary(),
      analyticsAPI.getSchedulesSummary(),
      analyticsAPI.getTopModulesByRevenue(5),
    ]);

    // Compose the legacy AnalyticsOverviewDto shape expected by the UI
    const overview: AnalyticsOverviewDto = {
      users: {
        total: users.totalUsers,
        // Backend doesn't provide these yet; default to 0 to avoid UI breakage
        last30Days: 0,
        last7Days: 0,
      },
      admins: users.admins,
      tutors: users.tutors,
      students: users.students,
      usersWith2FA: users.usersWith2FA,

      activeStudents: students.activeStudents,
      inactiveStudents: students.inactiveStudents,

      tutorStatuses: {
        approved: tutors.approved,
        pending: tutors.pending,
        banned: tutors.banned,
      },

      modules: {
        total: modules.total,
        last30Days: modules.last30Days,
        last7Days: modules.last7Days,
      },
      activeModules: modules.active,

      enrollments: enrollments,

      totalRevenue: revenue.totalRevenue,
      revenueLast30Days: revenue.revenueLast30Days,
      revenueLast6Months: (revenue.last6Months || []).map(p => ({ month: p.month, amount: p.amount })),

      averageRating: ratings.averageRating,
      upcomingSchedules: schedules.upcomingSchedules,

      topModulesByRevenue: (topModules.items || []).map((i: { id?: string | number; moduleId?: string | number; name?: string; title?: string; value?: number | string; revenue?: number | string }) => ({
        id: String(i.id ?? i.moduleId ?? i.name ?? 'unknown'),
        name: String(i.name ?? i.title ?? 'Unknown'),
        value: Number(i.value ?? i.revenue ?? 0),
      })),
    };

    return overview;
  },
  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
    return response.data.data;
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      '/analytics/activities',
      { params: { limit } }
    );
    return response.data.data;
  },

  // Get announcements
  getAnnouncements: async (limit?: number): Promise<Announcement[]> => {
    const response = await apiClient.get<ApiResponse<Announcement[]>>(
      '/analytics/announcements',
      { params: { limit } }
    );
    return response.data.data;
  },

  // Create announcement
  createAnnouncement: async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    const response = await apiClient.post<ApiResponse<Announcement>>(
      '/analytics/announcements',
      data
    );
    return response.data.data;
  },

  // Get full analytics data
  getAnalyticsData: async (dateRange?: { from: string; to: string }): Promise<AnalyticsData> => {
    const response = await apiClient.get<ApiResponse<AnalyticsData>>(
      '/analytics/data',
      { params: dateRange }
    );
    return response.data.data;
  },

  // Get enrollment growth
  getEnrollmentGrowth: async (months: number = 6) => {
    const response = await apiClient.get<ApiResponse<AnalyticsData['enrollmentGrowth']>>(
      '/analytics/enrollment-growth',
      { params: { months } }
    );
    return response.data.data;
  },

  // Get revenue over time
  getRevenueOverTime: async (months: number = 6) => {
    const response = await apiClient.get<ApiResponse<AnalyticsData['revenueOverTime']>>(
      '/analytics/revenue',
      { params: { months } }
    );
    return response.data.data;
  },

  // Get top modules
  getTopModules: async (limit: number = 5) => {
    const response = await apiClient.get<ApiResponse<AnalyticsData['topModules']>>(
      '/analytics/top-modules',
      { params: { limit } }
    );
    return response.data.data;
  },

  // New Admin Analytics Endpoints
  getUsersSummary: async (): Promise<UsersSummaryDto> => {
    const res = await apiClient.get<UsersSummaryDto | ApiResponse<UsersSummaryDto>>('/admin/analytics/users');
    return unwrap<UsersSummaryDto>(res);
  },

  getStudentsSummary: async (): Promise<StudentsSummaryDto> => {
    const res = await apiClient.get<StudentsSummaryDto | ApiResponse<StudentsSummaryDto>>('/admin/analytics/students');
    return unwrap<StudentsSummaryDto>(res);
  },

  getTutorsSummary: async (): Promise<TutorsSummaryDto> => {
    const res = await apiClient.get<TutorsSummaryDto | ApiResponse<TutorsSummaryDto>>('/admin/analytics/tutors');
    return unwrap<TutorsSummaryDto>(res);
  },

  getModulesSummary: async (): Promise<ModulesSummaryDto> => {
    const res = await apiClient.get<ModulesSummaryDto | ApiResponse<ModulesSummaryDto>>('/admin/analytics/modules');
    return unwrap<ModulesSummaryDto>(res);
  },

  getEnrollmentsCount: async (): Promise<number> => {
    const res = await apiClient.get<number | ApiResponse<number>>('/admin/analytics/enrollments');
    return unwrap<number>(res);
  },

  getRevenueSummary: async (): Promise<RevenueSummaryDto> => {
    const res = await apiClient.get<RevenueSummaryDto | ApiResponse<RevenueSummaryDto>>('/admin/analytics/revenue');
    return unwrap<RevenueSummaryDto>(res);
  },

  getRatingsSummary: async (): Promise<RatingsSummaryDto> => {
    const res = await apiClient.get<RatingsSummaryDto | ApiResponse<RatingsSummaryDto>>('/admin/analytics/ratings');
    return unwrap<RatingsSummaryDto>(res);
  },

  getSchedulesSummary: async (): Promise<SchedulesSummaryDto> => {
    const res = await apiClient.get<SchedulesSummaryDto | ApiResponse<SchedulesSummaryDto>>('/admin/analytics/schedules');
    return unwrap<SchedulesSummaryDto>(res);
  },

  getTopModulesByRevenue: async (limit: number = 5): Promise<TopModulesDto> => {
    const res = await apiClient.get<TopModulesDto | ApiResponse<TopModulesDto>>('/admin/analytics/top-modules', { params: { limit } });
    return unwrap<TopModulesDto>(res);
  },
};
