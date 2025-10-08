import apiClient from '@/lib/axios';
import { LoginCredentials, AuthResponse, ApiResponse, Admin } from '@/types';

// The backend Spring controller (provided snippet) returns a Map like:
// {
//   token: string,
//   message: string,
//   user: { email: string, name: string, role: string }
// }
// It does NOT (yet) provide refreshToken or id / createdAt fields expected by the
// front-end AuthResponse/Admin types. We introduce a light transformation layer
// to hydrate missing properties with sensible placeholders so the rest of the
// app can continue to rely on strongly typed objects.

interface BackendLoginUser {
  email: string;
  name?: string;
  role: string; // e.g. 'ADMIN' | 'SUPER_ADMIN'
}

interface BackendLoginResponseRaw {
  token: string;
  message?: string;
  user: BackendLoginUser;
}

// Helper to map backend user -> Admin
const mapBackendUserToAdmin = (u: BackendLoginUser): Admin => {
  return {
    id: u.email, // Using email as a stable surrogate id until backend supplies one
    name: u.name || '',
    email: u.email,
    role: (u.role?.toUpperCase?.() as Admin['role']) || 'ADMIN',
    createdAt: new Date().toISOString(), // Placeholder; ideally provided by backend
  };
};

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // We cannot rely on ApiResponse<AuthResponse> shape yet; accept loose any and map.
    const response = await apiClient.post<BackendLoginResponseRaw | ApiResponse<BackendLoginResponseRaw>>(
      '/auth/login',
      credentials
    );

    // Some backends wrap in ApiResponse, others return raw map. Support both.
    const payload = response.data as BackendLoginResponseRaw | ApiResponse<BackendLoginResponseRaw>;
    const raw: BackendLoginResponseRaw = (payload && (payload as ApiResponse<BackendLoginResponseRaw>).data
      ? (payload as ApiResponse<BackendLoginResponseRaw>).data
      : (payload as BackendLoginResponseRaw));

    if (!raw?.token || !raw?.user) {
      throw new Error('Malformed login response');
    }

    const admin = mapBackendUserToAdmin(raw.user);
    const auth: AuthResponse = {
      user: admin,
      token: raw.token,
      // Backend endpoint (per snippet) does not return refresh token yet.
      refreshToken: '',
    };
    return auth;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ valid: boolean }>>(
        '/auth/verify'
      );
      return response.data.data.valid;
    } catch {
      return false;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};
