import { apiClient } from '@/lib/axios';
import { PaymentRequest, PaymentHistory, ApiResponse, TableFilter } from '@/types';

export const paymentsAPI = {
  // Get all withdrawal requests
  getAllWithdrawals: async (): Promise<PaymentRequest[]> => {
    const response = await apiClient.get('/admin/withdrawals/get-all-withdrawals');
    return response.data;
  },

  // Get all payment requests (legacy)
  getPaymentRequests: async (filters?: TableFilter) => {
    const response = await apiClient.get<ApiResponse<{ payments: PaymentRequest[]; total: number }>>(
      '/payments/requests',
      { params: filters }
    );
    return response.data.data;
  },

  // Get single payment request
  getPaymentRequest: async (id: string): Promise<PaymentRequest> => {
    const response = await apiClient.get<ApiResponse<PaymentRequest>>(`/payments/requests/${id}`);
    return response.data.data;
  },

  // Approve payment
  approvePayment: async (id: string, notes?: string): Promise<void> => {
    await apiClient.post(`/payments/requests/${id}/approve`, { notes });
  },

  // Reject payment
  rejectPayment: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/payments/requests/${id}/reject`, { reason });
  },

  // Get payment history
  getPaymentHistory: async (filters?: TableFilter) => {
    const response = await apiClient.get<ApiResponse<{ history: PaymentHistory[]; total: number }>>(
      '/payments/history',
      { params: filters }
    );
    return response.data.data;
  },

  // Get payment summary
  getPaymentSummary: async () => {
    const response = await apiClient.get<ApiResponse<{
      totalPaid: number;
      totalPending: number;
      totalRejected: number;
      thisMonthPaid: number;
    }>>('/admin/withdrawals/summary');
    return response.data.data;
  },

  // Get total pending amount
  getTotalPending: async () => {
    const response = await apiClient.get('/admin/withdrawals/total-pending');
    return response.data.totalPendingAmount;
  },

  // Get total approved amount
  getTotalApproved: async () => {
    const response = await apiClient.get('/admin/withdrawals/total-approved');
    return response.data.totalApprovedAmount;
  },

  // Get pending requests count
  getPendingCount: async () => {
    const response = await apiClient.get('/admin/withdrawals/pending-count');
    return response.data.pendingRequests;
  },

  // Update withdrawal status
  updateWithdrawalStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/withdrawals/${id}/status?status=${status}`);
    return response.data;
  },


  // Get tutor payment history
  getTutorPayments: async (tutorId: string) => {
    const response = await apiClient.get<ApiResponse<PaymentHistory[]>>(
      `/payments/tutor/${tutorId}`
    );
    return response.data.data;
  },

  // Process bulk payments
  processBulkPayments: async (paymentIds: string[]): Promise<void> => {
    await apiClient.post('/payments/bulk-approve', { paymentIds });
  },

  getTotalRevenue: async (): Promise<number> => {
    const response = await apiClient.get('/admin/withdrawals/revenue');
    return response.data.totalRevenue;
  }
};
