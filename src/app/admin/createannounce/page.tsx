'use client';

import React, { useState } from 'react';
import Protected from '@/components/auth/Protected';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { announcementsAPI } from '@/API/announcements';
import type { AnnouncementCreateDto } from '@/types';
import { useRouter } from 'next/navigation';

export default function CreateAnnouncementPage() {
  const [form, setForm] = useState<AnnouncementCreateDto>({ title: '', content: '', isActive: true });
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title || form.title.trim().length === 0) e.title = 'Title is required';
    if (form.title && form.title.length > 200) e.title = 'Title cannot exceed 200 characters';
    if (!form.content || form.content.trim().length === 0) e.content = 'Content is required';
    if (form.content && form.content.length > 5000) e.content = 'Content cannot exceed 5000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await announcementsAPI.create(form);
      router.push('/admin');
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'Failed to create announcement';
      setServerError(typeof msg === 'string' ? msg : 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Protected roles={['ADMIN','SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Title"
                  placeholder="Enter announcement title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  error={errors.title}
                />
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Content</label>
                  <textarea
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all duration-200 text-black placeholder-gray-400 bg-white hover:border-gray-300 ${errors.content ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    rows={10}
                    placeholder="Write the announcement content here..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-red-500 font-medium">{errors.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-2 border-gray-300 text-yellow-500 focus:ring-yellow-400 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-black">Active</label>
                </div>
                {serverError && (
                  <div className="text-red-600 text-sm font-medium">{serverError}</div>
                )}
                <div className="flex items-center gap-3">
                  <Button type="submit" isLoading={submitting}>Create</Button>
                  <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
