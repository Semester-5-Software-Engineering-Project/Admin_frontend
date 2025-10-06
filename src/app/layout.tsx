import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TutorVerse Admin Panel",
  description: "Professional admin dashboard for managing tutors, students, and payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1A1A1A',
              borderRadius: '1rem',
              padding: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#FFD700',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
