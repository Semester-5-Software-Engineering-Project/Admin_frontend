import apiClient from '@/lib/axios';
import { ApiResponse, CreateAdminPayload, CreateAdminResponse } from '@/types';

/** Admin management API */
export const adminAPI = {
  create: async (payload: CreateAdminPayload): Promise<CreateAdminResponse> => {
    // Decide if multipart needed
    const hasFile = payload.profilePicture instanceof File;
    if (hasFile) {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('password', payload.password);
      formData.append('role', payload.role);
      if (payload.profilePicture) formData.append('profilePicture', payload.profilePicture);
      const response = await apiClient.post<ApiResponse<CreateAdminResponse>>('/admins', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    }
    const response = await apiClient.post<ApiResponse<CreateAdminResponse>>('/admins', payload);
    return response.data.data;
  },
};

export default adminAPI;
