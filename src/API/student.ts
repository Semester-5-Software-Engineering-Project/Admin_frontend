import apiClient from '@/lib/axios';
import type { ApiResponse, StudentEntityDto, StudentModuleDto, StudentTotalSpentResponse } from '@/types';

// Debug flag (only logs when explicitly enabled)
const DEBUG_STUDENT = process.env.NEXT_PUBLIC_DEBUG_STUDENT === 'true';

// Assumed backend base path for student admin endpoints
// Adjust if actual backend differs (e.g., '/api/admin/students')


// Fetch all students
export async function fetchAllStudents(): Promise<StudentEntityDto[]> {
	if (DEBUG_STUDENT) console.log('[studentAPI] fetchAllStudents: request -> /student-profile/all');
	try {
		const { data } = await apiClient.get<unknown>('/student-profile/all');
		if (DEBUG_STUDENT) console.log('[studentAPI] fetchAllStudents: raw response', data);
		if (Array.isArray(data)) {
			if (DEBUG_STUDENT) console.log('[studentAPI] fetchAllStudents: returning array (direct) length', data.length);
			return data as StudentEntityDto[];
		}
		const maybe = data as Partial<ApiResponse<StudentEntityDto[]>>;
		if (maybe && Array.isArray(maybe.data)) {
			if (DEBUG_STUDENT) console.log('[studentAPI] fetchAllStudents: returning array (wrapped) length', maybe.data.length);
			return maybe.data;
		}
		if (DEBUG_STUDENT) console.warn('[studentAPI] fetchAllStudents: unexpected shape', data);
		throw new Error('Unexpected students response shape');
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] fetchAllStudents: error', err);
		throw err;
	}
}

// Fetch single student by id (assumes backend endpoint). Fallback: filter from all.
export async function fetchStudentById(studentId: string): Promise<StudentEntityDto | null> {
	if (DEBUG_STUDENT) console.log('[studentAPI] fetchStudentById: request -> /student-profile/', studentId);
	try {
		// Assumption: backend exposes /student-profile/{id}
		const { data } = await apiClient.get<unknown>(`/student-profile/${studentId}`);
		const isEntity = (val: unknown): val is StudentEntityDto => typeof val === 'object' && val !== null && 'studentId' in val;
		if (isEntity(data)) return data;
		// If wrapped
		const maybe = data as Partial<ApiResponse<StudentEntityDto>> | undefined;
		if (maybe?.data && isEntity(maybe.data)) return maybe.data;
	} catch (err) {
		if (DEBUG_STUDENT) console.warn('[studentAPI] fetchStudentById: direct endpoint failed, attempting fallback', err);
	}
	try {
		const all = await fetchAllStudents();
		return all.find(s => s.studentId === studentId) || null;
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] fetchStudentById: fallback failed', err);
		return null;
	}
}

// Ban a student
export async function banStudent(studentId: string): Promise<void> {
	if (DEBUG_STUDENT) console.log('[studentAPI] banStudent: banning', studentId);
	try {
		await apiClient.post('/student-profile/ban', null, { params: { studentId } });
		if (DEBUG_STUDENT) console.log('[studentAPI] banStudent: success', studentId);
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] banStudent: error', studentId, err);
		throw err;
	}
}

// Unban a student
export async function unbanStudent(studentId: string): Promise<void> {
	if (DEBUG_STUDENT) console.log('[studentAPI] unbanStudent: unbanning', studentId);
	try {
		await apiClient.post('/student-profile/unban', null, { params: { studentId } });
		if (DEBUG_STUDENT) console.log('[studentAPI] unbanStudent: success', studentId);
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] unbanStudent: error', studentId, err);
		throw err;
	}
}

// Total spent by a student
export async function fetchStudentTotalSpent(studentId: string): Promise<StudentTotalSpentResponse> {
	if (DEBUG_STUDENT) console.log('[studentAPI] fetchStudentTotalSpent: request', { studentId });
	try {
		const { data } = await apiClient.get<StudentTotalSpentResponse>('/payments/totalspent', { params: { studentId } });
		if (DEBUG_STUDENT) console.log('[studentAPI] fetchStudentTotalSpent: response', data);
		return data;
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] fetchStudentTotalSpent: error', studentId, err);
		throw err;
	}
}

// Modules enrolled by student
export async function fetchStudentModules(studentId: string): Promise<StudentModuleDto[]> {
	if (DEBUG_STUDENT) console.log('[studentAPI] fetchStudentModules: request', { studentId });
	try {
		const { data } = await apiClient.get<StudentModuleDto[]>('/enrollment/studentmodule', { params: { studentId } });
		if (DEBUG_STUDENT) console.log('[studentAPI] fetchStudentModules: response length', Array.isArray(data) ? data.length : 'n/a');
		return data;
	} catch (err) {
		if (DEBUG_STUDENT) console.error('[studentAPI] fetchStudentModules: error', studentId, err);
		throw err;
	}
}

// Helper to map backend entity to UI Student type
export function mapStudentEntityToUI(entity: StudentEntityDto) {
	return {
		id: entity.studentId,
		name: entity.firstName + ' ' + entity.lastName,
		email: entity.user?.email,
		profilePicture: entity.imageUrl,
		modulesEnrolled: [] as string[], // fill separately if needed
		status: entity.isActive === false ? 'banned' : 'active',
		enrolledAt: entity.createdAt?.split('T')[0] || '',
		totalSpent: 0, // fetch separately
		phone: entity.phoneNumber,
	};
}

export type UIStudent = ReturnType<typeof mapStudentEntityToUI>;

