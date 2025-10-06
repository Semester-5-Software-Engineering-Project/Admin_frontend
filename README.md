# TutorVerse Admin PanelThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, production-quality admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS for managing tutors, students, and payments.## Getting Started



## 🎨 FeaturesFirst, run the development server:



- **Modern UI/UX**: Clean, minimal light mode design with elegant animations```bash

- **Fully Responsive**: Mobile-first design that works across all devicesnpm run dev

- **Type-Safe**: Built with TypeScript for better development experience# or

- **State Management**: Zustand for global state and authenticationyarn dev

- **Form Validation**: React Hook Form + Zod for robust form handling# or

- **Data Visualization**: Interactive charts with Rechartspnpm dev

- **Real-time Notifications**: Toast notifications for user feedback# or

- **Protected Routes**: Authentication-based access controlbun dev

```

## 📊 Pages

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

1. **Login Page** - Secure authentication with form validation

2. **Dashboard** - Overview with stats, recent activities, and announcementsYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

3. **Payment Distribution** - Manage tutor payment requests with approval workflow

4. **Tutor Management** - Approve, ban, and communicate with tutorsThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

5. **Student Management** - Monitor students and export data

6. **Analytics** - Interactive charts and insights## Learn More

7. **Settings** - Profile, security, and notification preferences

To learn more about Next.js, take a look at the following resources:

## 🛠️ Tech Stack

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Framework**: Next.js 14 (App Router)- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Language**: TypeScript

- **Styling**: Tailwind CSSYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **State Management**: Zustand

- **Form Handling**: React Hook Form + Zod## Deploy on Vercel

- **HTTP Client**: Axios

- **Data Fetching**: SWR (ready to integrate)The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Charts**: Recharts

- **Animations**: Framer MotionCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd tutorverse-admin
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

```
Email: admin@tutorverse.com
Password: admin123
```

## 🎨 Design System

### Color Palette

- **Primary**: `#FFD700` (Dark Yellow)
- **Secondary**: `#171717` (Deep Charcoal)
- **Accent**: `#444444` (Grey)
- **Background**: `#F9F9F9` (Soft White)
- **Text**: `#1A1A1A` (Dark Black)

### Typography

- **Font Family**: Inter (body), Poppins (headings)
- **Rounded Corners**: `rounded-2xl` (1rem)
- **Shadows**: Soft, medium, and strong variations

## 🔧 Key Features Details

### Dashboard
- Welcome section with admin info
- Quick stats cards (Students, Tutors, Modules, Payments)
- Recent activities feed
- Announcements section
- Revenue tracking

### Payments
- Filter by status (Pending/Approved/Rejected)
- Search functionality
- Approve/Reject actions with confirmation
- Payment details modal
- Summary cards showing totals

### Tutors
- Search and filter by status
- Approve/Ban actions
- Email composer modal for communication
- Tutor detail view with stats
- Module assignments

### Students
- Search and filter functionality
- Ban/Unban actions
- CSV export capability
- Student profile modal
- Enrollment tracking

### Analytics
- Monthly enrollment growth (Line chart)
- Revenue vs Expenses (Bar chart)
- Tutor-Student ratio (Pie chart)
- Top 5 popular modules
- Performance insights
- Date range filters

### Settings
- Profile picture upload
- Name, email, contact updates
- Password change with validation
- 2FA toggle
- Notification preferences

## 🚀 Build & Deploy

```bash
npm run build
npm start
```

## 📝 Next Steps

1. Connect backend API (replace mock data)
2. Implement real authentication
3. Add file upload for profile pictures
4. Connect email service
5. Add pagination to tables
6. Implement real-time notifications

## 📄 License

MIT License - Academic Project

---

**Note**: This project uses mock data for demonstration. Connect your backend API to make it fully functional.
