import axios from '@/lib/axios';
import type { GetReportDto } from '@/types';

const reportsAPI = {
  async list(): Promise<GetReportDto[]> {
    const res = await axios.get('/reports');
    return res.data;
  },

  async reviewReport(reportId: string) {
    await axios.put(`/reports/review`, null, { params: { reportId } });
  },

  async resolveReport(reportId: string) {
    await axios.put(`/reports/resolve`, null, { params: { reportId } });
  },
};

export default reportsAPI;
