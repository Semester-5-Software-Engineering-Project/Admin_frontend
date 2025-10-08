import apiClient from '@/lib/axios';
import { CreateAdminPayload, AdminProfileDto, AdminProfileEntity } from '@/types';

/** Admin management API */
export const adminAPI = {
  /**
   * Creates an admin (or super admin) user using the backend endpoint:
   * POST /api/admin/register
   * Backend returns a plain text success/error message (not a wrapped JSON object)
   */
  create: async (payload: Pick<CreateAdminPayload, 'name' | 'email' | 'password' | 'role'>): Promise<string> => {
    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    };

    // Expecting a plain string response: "User registered" or conflict message
    const response = await apiClient.post<string>('/admin/register', body, {
      // Ensure JSON header (axios instance already sets this, but explicit for clarity)
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
  /**
   * Create or update the authenticated admin's profile.
   * Backend snippet indicates POST mapping that enforces adminId from auth token.
   * Assumed endpoint: POST /admin/profile
   */
  saveProfile: async (dto: AdminProfileDto): Promise<AdminProfileEntity> => {
    const response = await apiClient.post<AdminProfileEntity>('/admin-profile', dto);
    return response.data;
  },

  /**
   * Check if current admin profile exists (GET /admin-profile/check)
   * Backend returns "True" or error 404.
   */
  checkProfileExists: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<string>('/admin-profile/check');
      return response.data.toLowerCase() === 'true';
    } catch (err: unknown) {
      interface AxiosLikeError { response?: { status?: number } }
      const status = (err as AxiosLikeError)?.response?.status;
      if (status === 404) return false;
      throw err;
    }
  },
  /**
   * Change password for current admin (POST /admin-profile/change-password?newPassword=...)
   * Backend expects newPassword as request param (query string) and authenticates user via token/cookie.
   */
  changePassword: async (newPassword: string): Promise<string> => {
    const response = await apiClient.post<string>(`/admin-profile/change-password`, null, {
      params: { newPassword }
    });
    return response.data;
  },

  /**
   * Fetch current admin profile (GET /admin-profile/me)
   */
  getProfile: async (): Promise<AdminProfileEntity> => {
    const response = await apiClient.get<AdminProfileEntity>('/admin-profile/me');
    return response.data;
  }
};

export default adminAPI;
