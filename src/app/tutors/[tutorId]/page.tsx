"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Check, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { EnrichedTutor, approveTutor, banTutor, getEnrichedTutor, getTutorFullName } from '@/API/tutor';

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params?.tutorId as string | undefined;
  const [tutor, setTutor] = useState<EnrichedTutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!tutorId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getEnrichedTutor(tutorId);
        if (!cancelled) setTutor(data);
      } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Failed loading tutor', e);
        if (!cancelled) setError(e?.message || 'Failed to load tutor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tutorId]);

  const handleApprove = async () => {
    if (!tutor) return;
    try {
      setUpdating(true);
      await approveTutor(tutor.tutorId);
      setTutor({ ...tutor, status: 'APPROVED' });
      toast.success('Tutor approved');
    } catch {
      toast.error('Approve failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleBan = async () => {
    if (!tutor) return;
    try {
      setUpdating(true);
      await banTutor(tutor.tutorId);
      setTutor({ ...tutor, status: 'BANNED' });
      toast.success('Tutor banned');
    } catch {
      toast.error('Ban failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-text">Tutor Profile</h1>
        </div>
        {loading && (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary" />
          </div>
        )}
        {!loading && error && (
          <EmptyState title="Error" description={error} />
        )}
        {!loading && !error && tutor && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <Avatar src={tutor.image} alt={getTutorFullName(tutor)} size="xxl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-text">{getTutorFullName(tutor)}</h2>
                      <Badge variant={tutor.status === 'APPROVED' ? 'success' : tutor.status === 'PENDING' ? 'warning' : 'danger'}>{tutor.status}</Badge>
                    </div>
                    <p className="text-text-muted text-sm">{tutor.user.email}</p>
                    {tutor.bio && <p className="text-sm text-text leading-relaxed max-w-2xl">{tutor.bio}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <Stat label="Students" value={tutor.studentsCount} />
                      <Stat label="Earnings" value={`$${tutor.totalEarnings.toLocaleString()}`} />
                      <Stat label="Modules" value={tutor.modules.length} />
                      <Stat label="Joined" value={new Date(tutor.createdAt).toLocaleDateString()} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {tutor.status === 'PENDING' && (
                      <Button disabled={updating} onClick={handleApprove} variant="primary" className="w-full"> <Check className="h-4 w-4 mr-1"/> Approve</Button>
                    )}
                    {tutor.status !== 'BANNED' && (
                      <Button disabled={updating} onClick={handleBan} variant="danger" className="w-full"> <Ban className="h-4 w-4 mr-1"/> Ban</Button>
                    )}
                    <Button variant="outline" className="w-full"> <Mail className="h-4 w-4 mr-1"/> Email</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-text">Modules</h3>
                {tutor.modules.length === 0 && (
                  <EmptyState title="No Modules" description="This tutor has not created any modules yet." />
                )}
                {tutor.modules.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {tutor.modules.map((m, idx) => (
                      <motion.div
                        key={m.moduleId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="border rounded-lg p-4 bg-white/70 space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-text truncate" title={m.name}>{m.name}</h4>
                            <Badge variant="info" size="sm">{m.domain}</Badge>
                          </div>
                          <div className="text-xs text-text-muted">Duration: {m.duration}</div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Fee</span>
                            <span className="font-semibold text-text">${m.fee.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Avg Ratings</span>
                            <span className="font-semibold text-text">{m.averageRatings?.toFixed(1) ?? 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-text">Additional Info</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <Info label="Phone" value={tutor.phoneNo || '—'} />
                  <Info label="Gender" value={tutor.gender} />
                  <Info label="DOB" value={new Date(tutor.dob).toLocaleDateString()} />
                  <Info label="Address" value={tutor.address || '—'} />
                  <Info label="City" value={tutor.city || '—'} />
                  <Info label="Country" value={tutor.country || '—'} />
                  <Info label="Portfolio" value={tutor.portfolio ? <a className="text-primary underline" href={tutor.portfolio} target="_blank" rel="noreferrer">View</a> : '—'} />
                  <Info label="Last Accessed" value={tutor.lastAccessed ? new Date(tutor.lastAccessed).toLocaleDateString() : '—'} />
                  <Info label="Updated" value={new Date(tutor.updatedAt).toLocaleDateString()} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg bg-background border p-3">
    <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className="font-semibold text-text text-lg">{value}</div>
  </div>
);

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-text-muted uppercase">{label}</div>
    <div className="text-text break-words">{value}</div>
  </div>
);
