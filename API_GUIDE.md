# API Integration Guide

This document explains how to connect the TutorVerse Admin Panel to your backend API.

## 📋 API Configuration

### Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🔐 Authentication Flow

### Login Endpoint
```typescript
POST /auth/login
Body: { email: string, password: string, rememberMe?: boolean }
Response: {
  success: boolean,
  data: {
    user: Admin,
    token: string,
    refreshToken: string
  }
}
```

### Token Management
- Token stored in `localStorage` as `auth_token`
- Automatically attached to all requests via Axios interceptor
- On 401 error, user is redirected to login

## 📡 API Endpoints Reference

### Authentication (`/API/auth.ts`)

```typescript
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/refresh            - Refresh access token
GET    /auth/verify             - Verify token validity
POST   /auth/change-password    - Change password
POST   /auth/forgot-password    - Request password reset
POST   /auth/reset-password     - Reset password with token
```

### Tutors (`/API/tutor.ts`)

```typescript
GET    /tutors                  - Get all tutors (with filters/pagination)
GET    /tutors/:id              - Get single tutor
PATCH  /tutors/:id/approve      - Approve tutor
PATCH  /tutors/:id/ban          - Ban tutor
PATCH  /tutors/:id/unban        - Unban tutor
PUT    /tutors/:id              - Update tutor
DELETE /tutors/:id              - Delete tutor
GET    /tutors/:id/stats        - Get tutor statistics
```

### Students (`/API/student.ts`)

```typescript
GET    /students                - Get all students (with filters/pagination)
GET    /students/:id            - Get single student
PATCH  /students/:id/ban        - Ban student
PATCH  /students/:id/unban      - Unban student
PUT    /students/:id            - Update student
DELETE /students/:id            - Delete student
GET    /students/:id/stats      - Get student statistics
GET    /students/export         - Export students as CSV
```

### Payments (`/API/payments.ts`)

```typescript
GET    /payments                - Get all payment requests
GET    /payments/:id            - Get single payment
POST   /payments/:id/approve    - Approve payment
POST   /payments/:id/reject     - Reject payment
GET    /payments/history        - Get payment history
GET    /payments/summary        - Get payment summary stats
```

### Analytics (`/API/analytics.ts`)

```typescript
GET    /analytics/dashboard     - Get dashboard statistics
GET    /analytics/activities    - Get recent activities
GET    /analytics/announcements - Get announcements
POST   /analytics/announcements - Create announcement
GET    /analytics/data          - Get full analytics data
GET    /analytics/enrollment-growth - Get enrollment trends
GET    /analytics/revenue       - Get revenue data
GET    /analytics/top-modules   - Get popular modules
```

### Mail (`/API/mail.ts`)

```typescript
POST   /mail/send               - Send single email
POST   /mail/send-bulk          - Send bulk emails
POST   /mail/tutor/:id          - Send email to tutor
POST   /mail/student/:id        - Send email to student
POST   /mail/payment-notification/:id - Send payment notification
POST   /mail/tutor-approval/:id - Send approval notification
POST   /mail/ban-notification   - Send ban notification
GET    /mail/templates          - Get email templates
```

## 📝 Request/Response Examples

### Login Request
```json
{
  "email": "admin@tutorverse.com",
  "password": "admin123",
  "rememberMe": true
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Admin User",
      "email": "admin@tutorverse.com",
      "role": "admin",
      "profilePicture": "https://...",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Tutors Request
```
GET /tutors?search=john&status=approved&page=1&pageSize=10
Headers: {
  Authorization: "Bearer <token>"
}
```

### Get Tutors Response
```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "1",
        "name": "John Smith",
        "email": "john@example.com",
        "modules": ["Math 101", "Algebra"],
        "status": "approved",
        "studentsCount": 45,
        "totalEarnings": 12500,
        "joinedAt": "2025-01-15"
      }
    ],
    "total": 342
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

## 🔧 Implementation Steps

### Step 1: Set Up Backend

Ensure your backend implements the above endpoints with proper:
- CORS configuration
- JWT authentication
- Input validation
- Error handling

### Step 2: Update Environment

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Step 3: Uncomment API Calls

In each page component, replace mock data with real API calls:

**Example: Dashboard Page**
```typescript
// Before (Mock)
const stats = {
  totalStudents: 2847,
  // ...
};

// After (Real API)
import { analyticsAPI } from '@/API/analytics';
import useSWR from 'swr';

const { data: stats, error, isLoading } = useSWR(
  '/dashboard-stats',
  analyticsAPI.getDashboardStats
);
```

### Step 4: Handle Loading States

Use the Skeleton components for loading states:

```typescript
if (isLoading) return <TableSkeleton rows={5} cols={6} />;
if (error) return <EmptyState title="Error loading data" />;
```

### Step 5: Error Handling

The Axios interceptor handles common errors, but you can add custom handling:

```typescript
try {
  await tutorAPI.approveTutor(id);
  toast.success('Tutor approved!');
} catch (error) {
  toast.error('Failed to approve tutor');
  console.error(error);
}
```

## 🔒 Security Considerations

### Token Storage
- Access token in localStorage
- Refresh token in httpOnly cookie (recommended)
- Clear on logout

### API Security
- HTTPS only in production
- CORS whitelist
- Rate limiting
- Input sanitization
- SQL injection prevention

### Frontend Security
- XSS protection
- CSRF tokens
- Content Security Policy
- Secure headers

## 🧪 Testing API Integration

### Using Postman/Insomnia

1. Import endpoints
2. Set up environment variables
3. Test authentication flow
4. Test CRUD operations

### Example cURL Commands

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tutorverse.com","password":"admin123"}'

# Get Tutors (with token)
curl -X GET http://localhost:8000/api/tutors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Data Models

### Admin
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  profilePicture?: string;
  createdAt: string;
}
```

### Tutor
```typescript
{
  id: string;
  name: string;
  email: string;
  modules: string[];
  status: 'pending' | 'approved' | 'banned';
  studentsCount: number;
  totalEarnings: number;
  joinedAt: string;
  bio?: string;
}
```

### Student
```typescript
{
  id: string;
  name: string;
  email: string;
  modulesEnrolled: string[];
  status: 'active' | 'banned';
  totalSpent: number;
  enrolledAt: string;
}
```

### Payment
```typescript
{
  id: string;
  tutorId: string;
  tutorName: string;
  module: string;
  studentsEnrolled: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  claimDate: string;
}
```

## 🚀 Deployment Checklist

- [ ] Backend API deployed and accessible
- [ ] CORS configured for frontend domain
- [ ] Environment variables set in hosting platform
- [ ] API rate limiting configured
- [ ] Database migrations completed
- [ ] SSL certificate active
- [ ] Logging and monitoring enabled
- [ ] Error tracking set up (Sentry, etc.)

## 📞 Support

For API integration issues:
1. Check browser console for errors
2. Verify network tab in DevTools
3. Ensure backend is running
4. Validate token in localStorage
5. Check CORS configuration

---

**Happy Coding! 🎉**
