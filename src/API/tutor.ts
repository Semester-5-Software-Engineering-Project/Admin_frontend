import { apiClient } from '../lib/axios';
import { TutorEntity, ModuelsDto } from '../types';

// Simple in-memory cache to avoid refetching entire tutor list repeatedly when we only need one tutor.
// This persists for the lifetime of the JS context (page/tab) only.
let _tutorsCache: TutorEntity[] | null = null;
let _tutorsCachePromise: Promise<TutorEntity[]> | null = null; // de-dupe concurrent loads

/**
 * Get all tutor profiles
 * GET /tutor/all
 */
export const getAllTutors = async (options: { force?: boolean } = {}): Promise<TutorEntity[]> => {
  const { force } = options;
  if (!force && _tutorsCache) return _tutorsCache;
  if (!force && _tutorsCachePromise) return _tutorsCachePromise;
  try {
    const fetchPromise = apiClient.get<TutorEntity[]>('/tutor-profile/all')
      .then(res => {
        _tutorsCache = res.data;
        _tutorsCachePromise = null;
        return res.data;
      })
      .catch(err => {
        _tutorsCachePromise = null;
        throw err;
      });
    _tutorsCachePromise = fetchPromise;
    return await fetchPromise;
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    throw error;
  }
};

/**
 * Get modules by tutor ID
 * Preferred backend pattern: @GetMapping("/modules/getmodtutor") with @RequestParam UUID tutorId
 * Frontend sends tutorId as a query parameter: /modules/getmodtutor?tutorId=...
 * If backend still expects a request body (non-standard for GET), update backend instead of reverting this.
 */
// Corrected spelling (was getMordulesByTuto). Use this in all new code.
export const getModulesByTutor = async (tutorId: string): Promise<ModuelsDto[]> => {
  try {
    if (!tutorId) throw new Error('tutorId is required');
    const response = await apiClient.get<ModuelsDto[]>('/modules/getmodtutor', {
      params: { tutorId }
    });
    return response.data;
  } catch (error: unknown) {
    const status = (error as any)?.response?.status; // eslint-disable-line @typescript-eslint/no-explicit-any
    const msg = status ? `Error fetching modules (status ${status})` : 'Error fetching modules';
    console.error(msg, error);
    throw error;
  }
};

// Temporary deprecated alias to avoid breaking any legacy imports.
// TODO: Remove after confirming no usage remains.
export const getMordulesByTuto = getModulesByTutor;

/**
 * Get enrollment count for a module
 * GET /enrollment/count?moduleId={moduleId}
 */
export const getEnrollmentCount = async (moduleId: string): Promise<number> => {
  try {
    const response = await apiClient.get<number>('/enrollment/count', {
      params: { moduleId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment count:', error);
    throw error;
  }
};

/**
 * Get payment count for a module
 * Align with enrollment endpoint by using query parameter: /payments/count?moduleId=...
 */
export const getPaymentCount = async (moduleId: string): Promise<number> => {
  try {
    if (!moduleId) throw new Error('moduleId is required');
    const response = await apiClient.get<number>('/payments/count', {
      params: { moduleId }
    });
    return response.data;
  } catch (error: unknown) {
    const status = (error as any)?.response?.status; // eslint-disable-line @typescript-eslint/no-explicit-any
    const msg = status ? `Error fetching payment count (status ${status})` : 'Error fetching payment count';
    console.error(msg, error);
    throw error;
  }
};

/**
 * Ban a tutor
 * POST /tutor/ban
 */
export const banTutor = async (tutorId: string): Promise<void> => {
  try {
    await apiClient.post('/tutor-profile/ban', {
      tutorId: tutorId
    });
  } catch (error) {
    console.error('Error banning tutor:', error);
    throw error;
  }
};

/**
 * Approve a tutor
 * POST /tutor/approve
 */
export const approveTutor = async (tutorId: string): Promise<void> => {
  try {
    await apiClient.post('/tutor-profile/approve', {
      tutorId: tutorId
    });
  } catch (error) {
    console.error('Error approving tutor:', error);
    throw error;
  }
};

/**
 * Get tutor counts (total, banned, pending, approved)
 * GET /tutor/count
 */
export const getTutorCount = async (): Promise<{
  total: number;
  banned: number;
  pending: number;
  approved: number;
}> => {
  try {
    const response = await apiClient.get<{
      total: number;
      banned: number;
      pending: number;
      approved: number;
    }>('/tutor-profile/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor count:', error);
    throw error;
  }
};

/**
 * Helper function to get tutor's full name
 */
export const getTutorFullName = (tutor: TutorEntity): string => {
  return `${tutor.firstName} ${tutor.lastName}`;
};

/**
 * Helper function to format tutor status for display
 */
export const formatTutorStatus = (status: TutorEntity['status']): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'BANNED':
      return 'Banned';
    default:
      return status;
  }
};

/**
 * Helper function to get status color class for UI
 */
export const getTutorStatusColor = (status: TutorEntity['status']): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'BANNED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Fetch a single tutor by ID (basic profile) - aligns with backend route /tutor-profile/{id}
 * If backend route differs adjust path accordingly.
 */
export const getTutorById = async (tutorId: string): Promise<TutorEntity> => {
  if (!tutorId) throw new Error('tutorId is required');
  // Since backend lacks a dedicated endpoint, fetch all (cached) and pick one.
  try {
    const all = await getAllTutors();
    const match = all.find(t => t.tutorId === tutorId);
    if (!match) throw new Error('Tutor not found');
    return match;
  } catch (error) {
    console.error('Error resolving tutor by id via list fallback:', error);
    throw error;
  }
};

/**
 * Convenience helper to build an enriched tutor with modules, student count (sum of enrollments), and earnings (sum of payment counts * fee if needed).
 * Currently earnings uses paymentCount as already aggregated value in backend; adjust if backend returns raw amounts.
 */
export interface EnrichedTutor extends TutorEntity {
  modules: ModuelsDto[];
  studentsCount: number;
  totalEarnings: number; // numeric aggregated value
}

export const getEnrichedTutor = async (tutorId: string): Promise<EnrichedTutor> => {
  const base = await getTutorById(tutorId);
  let modules: ModuelsDto[] = [];
  try {
    modules = await getModulesByTutor(tutorId);
  } catch (e) {
    console.warn('Failed fetching modules for tutor', tutorId, e);
  }
  let studentsCount = 0;
  let totalEarnings = 0;
  for (const m of modules) {
    try {
      const enroll = await getEnrollmentCount(m.moduleId);
      studentsCount += enroll;
    } catch (e) {
      console.warn('enrollment count failed for module', m.moduleId, e);
    }
    try {
      const pay = await getPaymentCount(m.moduleId);
      totalEarnings += pay; // If pay is count not amount, adapt when API supplies amount
    } catch (e) {
      console.warn('payment count failed for module', m.moduleId, e);
    }
  }
  return { ...base, modules, studentsCount, totalEarnings };
};
