'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Protected from '@/components/auth/Protected';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Users, Shield, Settings, Activity, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { adminAPI } from '@/API/admin';
import type { AdminProfileEntity } from '@/types';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/helpers';
import Modal from '@/components/ui/Modal';
import { announcementsAPI } from '@/API/announcements';
import type { AnnouncementCreateDto, AnnouncementGetDto } from '@/types';

export default function AdminPanelPage() {
  const [admins, setAdmins] = useState<AdminProfileEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  // Create Announcement modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [annForm, setAnnForm] = useState<AnnouncementCreateDto>({ title: '', content: '', isActive: true });
  const [annErrors, setAnnErrors] = useState<{ title?: string; content?: string }>({});
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annServerError, setAnnServerError] = useState<string | null>(null);
  // My Announcements state
  const [myAnnouncements, setMyAnnouncements] = useState<AnnouncementGetDto[]>([]);
  const [myAnnLoading, setMyAnnLoading] = useState<boolean>(false);
  const [myAnnError, setMyAnnError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminAPI.getAllProfiles();
        setAdmins(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load admins';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Fetch My Announcements
  const fetchMyAnnouncements = async () => {
    setMyAnnLoading(true);
    setMyAnnError(null);
    try {
      const res = await announcementsAPI.getByAuthor();
      setMyAnnouncements(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load announcements';
      setMyAnnError(msg);
    } finally {
      setMyAnnLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAnnouncements();
  }, []);

  const handleDeleteAnnouncement = async (id: string) => {
    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('Delete this announcement? This action cannot be undone.');
      if (!confirmDelete) return;
    }
    setDeletingId(id);
    try {
      await announcementsAPI.remove(id);
      setMyAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete announcement';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const validateAnnouncement = (): boolean => {
    const e: typeof annErrors = {};
    if (!annForm.title || annForm.title.trim().length === 0) e.title = 'Title is required';
    if (annForm.title && annForm.title.length > 200) e.title = 'Title cannot exceed 200 characters';
    if (!annForm.content || annForm.content.trim().length === 0) e.content = 'Content is required';
    if (annForm.content && annForm.content.length > 5000) e.content = 'Content cannot exceed 5000 characters';
    setAnnErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnServerError(null);
    if (!validateAnnouncement()) return;
    setAnnSubmitting(true);
    try {
      await announcementsAPI.create(annForm);
      // Reset and close
      setAnnForm({ title: '', content: '', isActive: true });
      setIsCreateOpen(false);
      toast.success('Announcement created successfully');
      // refresh my announcements
      fetchMyAnnouncements();
    } catch (err: unknown) {
      let msg: string | undefined;
      if (typeof err === 'object' && err !== null) {
        const maybeAxios = err as { response?: { data?: unknown }; message?: string };
        const data = maybeAxios.response?.data;
        msg = (typeof data === 'string' ? data : undefined) || maybeAxios.message;
      }
      setAnnServerError(msg || 'Failed to create announcement');
    } finally {
      setAnnSubmitting(false);
    }
  };

  const filtered = admins.filter(a => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      a.fullName?.toLowerCase().includes(s) ||
      a.email?.toLowerCase().includes(s) ||
      (a.contactNumber || '').toLowerCase().includes(s)
    );
  });

  const managementTiles = [
    {
      title: 'User Management',
      description: 'View & manage platform admins, tutors, and students.',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Access Control',
      description: 'Assign roles, elevate privileges, revoke access.',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Platform Settings',
      description: 'Configure global preferences and security policies.',
      icon: Settings,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'System Activity',
      description: 'Audit logs & recent elevated actions.',
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <Protected roles={['ADMIN','SUPER_ADMIN']} redirect="/dashboard">
      <DashboardLayout>
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white border-gray-700 shadow-xl">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-display font-bold mb-3 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Admin Control Center</h1>
                  <p className="text-gray-300 max-w-2xl font-medium">Central hub for elevated administration tasks. Only users with appropriate roles can access and perform changes here.</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Badge variant="warning" size="sm">Restricted Area</Badge>
                    <Badge variant="info" size="sm">Role Based</Badge>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Link href="/admin/create" className="inline-block">
                    <Button variant="primary">Create Admin</Button>
                  </Link>
                  <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Create Announcement</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {managementTiles.map(tile => {
              const Icon = tile.icon;
              return (
                <Card key={tile.title} hoverable className="group hover:shadow-lg transition-all">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-black group-hover:text-yellow-600 transition-colors">{tile.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${tile.bg} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={tile.color} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{tile.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 font-medium mb-2">More granular admin tools coming soon.</p>
              <p className="text-sm text-gray-500 font-medium">(Role creation, audit log feed, impersonation, advanced security reports)</p>
            </CardContent>
          </Card>
                            {/* Admin Profiles Table */}
                  <Card>
                    <CardHeader className="pb-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                        <CardTitle>Admin Profiles</CardTitle>
                        <div className="w-full md:w-80">
                          <Input
                            placeholder="Search admins by name, email, contact..."
                            leftIcon={<Search size={18} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading && (
                        <div className="p-6 text-center text-gray-500">Loading admins...</div>
                      )}
                      {error && !loading && (
                        <div className="p-6 text-center text-red-500">{error}</div>
                      )}
                      {!loading && !error && filtered.length === 0 ? (
                        <EmptyState title="No admins found" description="Try a different search term" />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left p-4 text-sm font-semibold text-black">Admin</th>
                                <th className="text-left p-4 text-sm font-semibold text-black">Contact</th>
                                <th className="text-left p-4 text-sm font-semibold text-black">Created</th>
                                <th className="text-left p-4 text-sm font-semibold text-black">Updated</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((a) => (
                                <tr key={a.adminId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar name={a.fullName} src={a.imageUrl} />
                                      <div>
                                        <p className="font-semibold text-black">{a.fullName || '—'}</p>
                                        <p className="text-sm text-gray-600">{a.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-gray-700">{a.contactNumber || '—'}</td>
                                  <td className="p-4 text-gray-600">{a.createdAt ? formatDate(a.createdAt, 'long') : '—'}</td>
                                  <td className="p-4 text-gray-600">{a.updatedAt ? formatDate(a.updatedAt, 'relative') : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* My Announcements Section */}
                  <Card>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <CardTitle>My Announcements</CardTitle>
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" onClick={fetchMyAnnouncements}>
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {myAnnLoading && (
                        <div className="p-6 text-center text-gray-500">Loading my announcements...</div>
                      )}
                      {myAnnError && !myAnnLoading && (
                        <div className="p-6 text-center text-red-500">{myAnnError}</div>
                      )}
                      {!myAnnLoading && !myAnnError && myAnnouncements.length === 0 ? (
                        <EmptyState title="No announcements yet" description="Announcements you create will show up here." />
                      ) : (
                        <div className="space-y-4">
                          {myAnnouncements.map(a => (
                            <Card key={a.id} className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-black mb-1">{a.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 break-words">{a.content}</p>
                                  </div>
                                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                    <Badge variant={a.isActive ? 'success' : 'default'}>
                                      {a.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteAnnouncement(a.id)}
                                      isLoading={deletingId === a.id}
                                      disabled={deletingId === a.id}
                                    >
                                      Delete
                                    </Button>
                                    <span className="text-xs text-gray-500">{formatDate(a.createdAt, 'relative')}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
        </div>
      </DashboardLayout>
      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Announcement"
        size="lg"
      >
        <form className="space-y-5" onSubmit={submitAnnouncement}>
          <Input
            label="Title"
            placeholder="Enter announcement title"
            value={annForm.title}
            onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
            error={annErrors.title}
          />
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Content</label>
            <textarea
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all duration-200 text-black placeholder-gray-400 bg-white hover:border-gray-300 ${annErrors.content ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
              rows={8}
              placeholder="Write the announcement content here..."
              value={annForm.content}
              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
            />
            {annErrors.content && (
              <p className="mt-2 text-sm text-red-500 font-medium">{annErrors.content}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              id="ann_isActive"
              type="checkbox"
              checked={!!annForm.isActive}
              onChange={(e) => setAnnForm({ ...annForm, isActive: e.target.checked })}
              className="h-5 w-5 rounded border-2 border-gray-300 text-yellow-500 focus:ring-yellow-400 focus:ring-2"
            />
            <label htmlFor="ann_isActive" className="text-sm font-medium text-black">Active</label>
          </div>
          {annServerError && (
            <div className="text-red-600 text-sm font-medium">{annServerError}</div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={annSubmitting}>Create</Button>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </Protected>
  );
}
