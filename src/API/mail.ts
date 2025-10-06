import apiClient from '@/lib/axios';
import { EmailPayload, ApiResponse } from '@/types';

export const mailAPI = {
  // Send email to single recipient
  sendEmail: async (emailData: EmailPayload): Promise<void> => {
    await apiClient.post('/mail/send', emailData);
  },

  // Send bulk email
  sendBulkEmail: async (recipients: string[], emailData: Omit<EmailPayload, 'to'>): Promise<void> => {
    await apiClient.post('/mail/send-bulk', {
      recipients,
      ...emailData,
    });
  },

  // Send email to tutor
  sendToTutor: async (tutorId: string, subject: string, message: string): Promise<void> => {
    await apiClient.post(`/mail/tutor/${tutorId}`, {
      subject,
      message,
    });
  },

  // Send email to student
  sendToStudent: async (studentId: string, subject: string, message: string): Promise<void> => {
    await apiClient.post(`/mail/student/${studentId}`, {
      subject,
      message,
    });
  },

  // Send payment notification
  sendPaymentNotification: async (paymentId: string): Promise<void> => {
    await apiClient.post(`/mail/payment-notification/${paymentId}`);
  },

  // Send approval notification
  sendApprovalNotification: async (tutorId: string): Promise<void> => {
    await apiClient.post(`/mail/tutor-approval/${tutorId}`);
  },

  // Send ban notification
  sendBanNotification: async (userId: string, type: 'tutor' | 'student', reason: string): Promise<void> => {
    await apiClient.post('/mail/ban-notification', {
      userId,
      type,
      reason,
    });
  },

  // Get email templates
  getEmailTemplates: async () => {
    const response = await apiClient.get<ApiResponse<{
      id: string;
      name: string;
      subject: string;
      body: string;
    }[]>>('/mail/templates');
    return response.data.data;
  },
};
