import apiClient from '@/lib/axios';
import type { AnnouncementCreateDto, AnnouncementGetDto, AnnouncementUpdateDto } from '@/types';

// Base path from Spring controller: @RequestMapping("/api/announcements")
// Our axios baseURL already ends with /api, so use '/announcements'

export const announcementsAPI = {
  // List announcements; optionally filter only active ones
  async list(onlyActive?: boolean): Promise<AnnouncementGetDto[]> {
    const res = await apiClient.get<AnnouncementGetDto[]>('/announcements', {
      params: typeof onlyActive === 'boolean' ? { onlyActive } : undefined,
    });
    return res.data;
  },

  // Get announcements created by current authenticated user (author)
  async getByAuthor(): Promise<AnnouncementGetDto[]> {
    // Spring controller mapping: GET /api/announcements/authorannouncements
    const res = await apiClient.get<AnnouncementGetDto[]>('/announcements/authorannouncements');
    return res.data;
  },

  // Get one by id
  async getById(id: string): Promise<AnnouncementGetDto> {
    const res = await apiClient.get<AnnouncementGetDto>(`/announcements/${id}`);
    return res.data;
  },

  // Create new announcement
  async create(payload: AnnouncementCreateDto): Promise<AnnouncementGetDto> {
    const res = await apiClient.post<AnnouncementGetDto>('/announcements', payload);
    return res.data;
  },

  // Update existing announcement
  async update(id: string, payload: AnnouncementUpdateDto): Promise<AnnouncementGetDto> {
    const res = await apiClient.put<AnnouncementGetDto>(`/announcements/${id}`, payload);
    return res.data;
  },

  // Delete
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/announcements/${id}`);
  },
};

export default announcementsAPI;
