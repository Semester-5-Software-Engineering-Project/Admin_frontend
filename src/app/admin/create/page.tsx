'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { adminAPI } from '@/API/admin';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { ShieldPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(8),
  // Backend expects uppercase roles (based on rest of app types): 'ADMIN' | 'SUPER_ADMIN'
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormValues = z.infer<typeof schema>;

export default function CreateAdminPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ADMIN' }
  });
  // Removed profile picture logic for current backend endpoint which does not accept it

  const onSubmit = async (values: FormValues) => {
    try {
      await adminAPI.create({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as UserRole,
      });
      toast.success('Admin created successfully');
      reset({ name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN' });
    } catch (err: unknown) {
      // Attempt to safely parse error shape
      let message = 'Failed to create admin';
      let fieldErrors: Record<string, string[]> | undefined;
      if (typeof err === 'object' && err !== null) {
        const anyErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
        message = anyErr.response?.data?.message || message;
        fieldErrors = anyErr.response?.data?.errors;
      }
      toast.error(message);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          if (msgs && msgs.length) {
            setError(field as keyof FormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  return (
    <RoleGuard allowed={['SUPER_ADMIN']} redirect="/admin">
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <ShieldPlus className="text-yellow-500" />
                Create New Admin
              </h1>
              <p className="text-gray-600 font-medium">Super admins can provision additional admin or super admin accounts.</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Badge variant="warning" size="sm">Secure Action</Badge>
                <Badge variant="info" size="sm">Super Admin Only</Badge>
              </div>
            </div>
            <Link href="/admin" className="text-sm font-semibold text-yellow-600 hover:underline">← Back to Admin Center</Link>
          </div>

          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">Admin Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <Input placeholder="Jane Doe" {...register('name')} error={errors.name?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <Input type="email" placeholder="jane@company.com" {...register('email')} error={errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <Input type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                    <Input type="password" placeholder="••••••••" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Role</label>
                    <select className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-medium focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition" {...register('role')}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-600 font-semibold mt-1">{errors.role.message}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting} variant="primary" className="min-w-40 flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    Create Admin
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
