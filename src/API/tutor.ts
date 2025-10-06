import apiClient from '@/lib/axios';
import { Tutor, ApiResponse, TableFilter, PaginationState } from '@/types';

export const tutorAPI = {
  // Get all tutors
  getTutors: async (filters?: TableFilter, pagination?: PaginationState) => {
    const response = await apiClient.get<ApiResponse<{ tutors: Tutor[]; total: number }>>(
      '/tutors',
      { params: { ...filters, ...pagination } }
    );
    return response.data.data;
  },

  // Get single tutor
  getTutor: async (id: string): Promise<Tutor> => {
    const response = await apiClient.get<ApiResponse<Tutor>>(`/tutors/${id}`);
    return response.data.data;
  },

  // Approve tutor
  approveTutor: async (id: string): Promise<void> => {
    await apiClient.patch(`/tutors/${id}/approve`);
  },

  // Ban tutor
  banTutor: async (id: string, reason?: string): Promise<void> => {
    await apiClient.patch(`/tutors/${id}/ban`, { reason });
  },

  // Unban tutor
  unbanTutor: async (id: string): Promise<void> => {
    await apiClient.patch(`/tutors/${id}/unban`);
  },

  // Update tutor
  updateTutor: async (id: string, data: Partial<Tutor>): Promise<Tutor> => {
    const response = await apiClient.put<ApiResponse<Tutor>>(`/tutors/${id}`, data);
    return response.data.data;
  },

  // Delete tutor
  deleteTutor: async (id: string): Promise<void> => {
    await apiClient.delete(`/tutors/${id}`);
  },

  // Get tutor statistics
  getTutorStats: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{
      totalEarnings: number;
      totalStudents: number;
      activeModules: number;
      rating: number;
    }>>(`/tutors/${id}/stats`);
    return response.data.data;
  },
};
