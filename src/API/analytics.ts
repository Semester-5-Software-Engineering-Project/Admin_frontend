import apiClient from '@/lib/axios';
import { 
  DashboardStats, 
  RecentActivity, 
  Announcement, 
  AnalyticsData,
  ApiResponse 
} from '@/types';

export const analyticsAPI = {
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
};
