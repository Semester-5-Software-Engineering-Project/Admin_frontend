import apiClient from '@/lib/axios';

export interface TwoFAStatus {
  enabled: boolean;
  hasSecret: boolean;
}

export interface TwoFAGenerateResponse {
  secretKey: string;
  qrImage: string; // data:image/png;base64,...
}

export const twofaAPI = {
  status: async (): Promise<TwoFAStatus> => {
    const res = await apiClient.get<TwoFAStatus>('/2fa/status');
    return res.data;
  },
  generate: async (): Promise<TwoFAGenerateResponse> => {
    const res = await apiClient.get<TwoFAGenerateResponse>('/2fa/generate');
    return res.data;
  },
  verify: async (code: string | number): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/2fa/verify`, null, {
      params: { code },
    });
    return res.data;
  },
  disable: async (code: string | number): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/2fa/disable`, null, {
      params: { code },
    });
    return res.data;
  },
};

export default twofaAPI;
