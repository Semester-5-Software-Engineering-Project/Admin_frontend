import apiClient from '@/lib/axios';
import { Student, ApiResponse, TableFilter, PaginationState } from '@/types';

export const studentAPI = {
  // Get all students
  getStudents: async (filters?: TableFilter, pagination?: PaginationState) => {
    const response = await apiClient.get<ApiResponse<{ students: Student[]; total: number }>>(
      '/students',
      { params: { ...filters, ...pagination } }
    );
    return response.data.data;
  },

  // Get single student
  getStudent: async (id: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  },

  // Ban student
  banStudent: async (id: string, reason?: string): Promise<void> => {
    await apiClient.patch(`/students/${id}/ban`, { reason });
  },

  // Unban student
  unbanStudent: async (id: string): Promise<void> => {
    await apiClient.patch(`/students/${id}/unban`);
  },

  // Update student
  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data.data;
  },

  // Delete student
  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  // Get student statistics
  getStudentStats: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{
      totalSpent: number;
      activeModules: number;
      completedModules: number;
      enrollmentDate: string;
    }>>(`/students/${id}/stats`);
    return response.data.data;
  },

  // Export students to CSV
  exportStudents: async (filters?: TableFilter): Promise<Blob> => {
    const response = await apiClient.get('/students/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
