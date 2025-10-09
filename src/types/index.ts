// User & Authentication Types
// Central role union so it can be reused in guards/components
export type UserRole = 'admin' | 'super_admin';

export interface Admin {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: Admin;
  token: string;
  refreshToken: string;
}

// Admin Management
export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole; // 'admin' or 'super_admin' (only super_admin can assign super_admin ideally)
  profilePicture?: File | string; // optional - can be multipart upload
}

export interface CreateAdminResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Tutor Types
export interface Tutor {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  modules: string[];
  status: 'pending' | 'approved' | 'banned';
  totalEarnings: number;
  studentsCount: number;
  joinedAt: string;
  bio?: string;
  phone?: string;
  expertise?: string[];
}

// Student Types
export interface Student {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  modulesEnrolled: string[];
  status: 'active' | 'banned';
  enrolledAt: string;
  totalSpent: number;
  phone?: string;
}

// Payment Types
export interface PaymentRequest {
  withdrawalId: string;
  tutorId: string;
  tutorName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  method: string; // e.g., BANK, EZCASH, PAYHERE
  accountName: string;
  bankName?: string; // optional if method != BANK
  accountNumber: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  adminId?: string;
  transactionId?: string;
  paidAt?: string;
}

// Legacy interface for compatibility (can be removed later)
export interface LegacyPaymentRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  module: string;
  studentsEnrolled: number;
  claimDate: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface PaymentHistory {
  id: string;
  tutorId: string;
  tutorName: string;
  amount: number;
  paidDate: string;
  transactionId: string;
  module: string;
}

// Analytics Types
export interface DashboardStats {
  totalStudents: number;
  totalTutors: number;
  totalModules: number;
  pendingPayments: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'tutor_approval' | 'payment' | 'ban' | 'enrollment';
  message: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
}

export interface EnrollmentData {
  month: string;
  students: number;
  tutors: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ModulePopularity {
  name: string;
  enrollments: number;
  revenue: number;
}

export interface AnalyticsData {
  enrollmentGrowth: EnrollmentData[];
  revenueOverTime: RevenueData[];
  tutorStudentRatio: {
    tutors: number;
    students: number;
  };
  topModules: ModulePopularity[];
  highestEarningTutor: {
    name: string;
    earnings: number;
  };
  mostEnrolledModule: {
    name: string;
    enrollments: number;
  };
}

// Settings Types
export interface ProfileSettings {
  name: string;
  email: string;
  contact: string;
  profilePicture?: File | string;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  paymentNotifications: boolean;
  tutorApprovals: boolean;
  studentActivity: boolean;
}

// Mail Types
export interface EmailPayload {
  to: string;
  subject: string;
  message: string;
  cc?: string[];
  attachments?: File[];
}

// Table & Filter Types
export interface TableFilter {
  search: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Backend Entity Types for Tutor API
export interface TutorEntity {
  tutorId: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string; // LocalDate from backend
  phoneNo: string;
  lastAccessed?: string; // LocalDate from backend
  image?: string;
  portfolio?: string;
  bio?: string;
  status: 'PENDING' | 'APPROVED' | 'BANNED';
  createdAt: string; // LocalDateTime from backend
  updatedAt: string; // LocalDateTime from backend
}

export interface ModuelsDto {
  moduleId: string;
  tutorId: string;
  name: string;
  domain: string;
  averageRatings: number;
  fee: number;
  duration: string; // Duration from backend as string
  status: string;
}

// Student Backend DTO Types
export interface StudentEntityDto {
  studentId: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  birthday?: string; // LocalDate
  imageUrl?: string;
  lastAccessed?: string; // LocalDate
  isActive?: boolean;
  phoneNumber: string;
  bio?: string;
  createdAt: string; // LocalDateTime
  updatedAt: string; // LocalDateTime
}

export interface StudentTotalSpentResponse {
  studentId: string;
  totalSpent: number; // monetary amount
  currency: string; // e.g. LKR
}

export interface StudentModuleDto {
  moduleId: string;
  tutorId: string;
  name: string;
  domain?: string; // domain name if provided separately
  averageRatings: number;
  fee: number;
  duration?: string; // ISO-8601 duration string
  status: string; // Draft | Active | Archived
}
