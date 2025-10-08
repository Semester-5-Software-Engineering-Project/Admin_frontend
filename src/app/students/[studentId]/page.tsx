'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchStudentById, fetchStudentTotalSpent, fetchStudentModules, mapStudentEntityToUI } from '@/API/student';
import type { StudentModuleDto } from '@/types';

const DEBUG_STUDENT = process.env.NEXT_PUBLIC_DEBUG_STUDENT === 'true';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = (params?.studentId as string) || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<ReturnType<typeof mapStudentEntityToUI> | null>(null);
  const [modules, setModules] = useState<StudentModuleDto[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [totalLoading, setTotalLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const entity = await fetchStudentById(studentId);
        if (!entity) throw new Error('Student not found');
        if (cancelled) return;
        setStudent(mapStudentEntityToUI(entity));
      } catch (e) {
        if (DEBUG_STUDENT) console.error('[StudentProfilePage] load error', e);
        const msg = e instanceof Error ? e.message : 'Failed to load student';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setModulesLoading(true);
    fetchStudentModules(studentId)
      .then(ms => setModules(ms))
      .catch(err => { if (DEBUG_STUDENT) console.warn('[StudentProfilePage] modules error', err); })
      .finally(() => setModulesLoading(false));
    setTotalLoading(true);
    fetchStudentTotalSpent(studentId)
      .then(res => setTotalSpent(res.totalSpent))
      .catch(err => { if (DEBUG_STUDENT) console.warn('[StudentProfilePage] total error', err); })
      .finally(() => setTotalLoading(false));
  }, [studentId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>&larr; Back</Button>
          <h1 className="text-3xl font-display font-bold text-text">Student Profile</h1>
        </div>
        {loading && <div className="text-text-light">Loading student...</div>}
        {error && !loading && <div className="text-red-500">{error}</div>}
        {!loading && !error && student && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar name={student.name} size="xl" />
                  <div>
                    <h2 className="text-xl font-bold text-text">{student.name}</h2>
                    <p className="text-text-light text-sm">{student.email}</p>
                    {student.status === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Banned</Badge>}
                  </div>
                </div>
                <div>
                  <p className="text-text-light text-xs uppercase tracking-wide">Phone</p>
                  <p className="text-text font-medium">{student.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-light text-xs uppercase tracking-wide">Enrolled Since</p>
                  <p className="text-text font-medium">{student.enrolledAt}</p>
                </div>
                <div>
                  <p className="text-text-light text-xs uppercase tracking-wide">Total Spent</p>
                  <p className="text-text font-semibold text-lg">{totalLoading ? 'Loading...' : `$${(totalSpent ?? 0).toFixed(2)}`}</p>
                </div>
              </CardContent>
            </Card>
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  {modulesLoading && <div className="text-text-light">Loading modules...</div>}
                  {!modulesLoading && modules.length === 0 && <div className="text-text-light">No modules found.</div>}
                  {!modulesLoading && modules.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {modules.map(m => (
                        <Badge key={m.moduleId}>{m.name}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
