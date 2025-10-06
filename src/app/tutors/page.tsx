'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Ban, Mail, Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TutorEntity, ModuelsDto } from '@/types';
import { 
  getAllTutors,
  getModulesByTutor,
  getEnrollmentCount,
  getPaymentCount,
  approveTutor,
  banTutor,
  getTutorFullName
} from '@/API/tutor';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';

interface EnhancedTutor extends TutorEntity {
  modules: ModuelsDto[];
  studentsCount: number;
  totalEarnings: number;
  modulesError?: string; // capture error message if module fetch fails
}

export default function TutorsPage() {
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState<EnhancedTutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'BANNED'>('ALL');
  const [selectedTutor, setSelectedTutor] = useState<EnhancedTutor | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showModulesDebug, setShowModulesDebug] = useState(false);
  const didFetchRef = useRef(false); // prevent double fetch in React Strict Mode
  const router = useRouter();

  useEffect(() => {
    if (didFetchRef.current) {
      console.log('[TutorsPage] Skipping duplicate fetch (Strict Mode guard)');
      return;
    }
    didFetchRef.current = true;
    const fetchTutors = async () => {
      try {
        setLoading(true);
  const rawTutors = await getAllTutors();
  console.log('[TutorsPage] Raw tutors fetched:', rawTutors.map(t => ({ id: t.tutorId, name: `${t.firstName} ${t.lastName}` })));

        const enhancedTutors = await Promise.all(
          rawTutors.map(async (tutor) => {
            let modules: ModuelsDto[] = [];
            let modulesError: string | undefined;
            try {
              modules = await getModulesByTutor(tutor.tutorId);
              console.log('[TutorsPage] Fetched modules for tutor', tutor.tutorId, modules);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
              modulesError = err?.message || 'Unknown modules fetch error';
              console.warn('[TutorsPage] Failed to fetch modules for tutor', tutor.tutorId, modulesError, err);
            }

            // Even if counts fail, keep modules.
            let studentsCount = 0;
            let totalEarnings = 0;
            for (const moduleItem of modules) {
              try {
                const enrollmentCount = await getEnrollmentCount(moduleItem.moduleId);
                studentsCount += enrollmentCount;
              } catch (e) {
                console.warn('[TutorsPage] enrollment count failed', tutor.tutorId, moduleItem.moduleId, e);
              }
              try {
                const paymentCount = await getPaymentCount(moduleItem.moduleId);
                totalEarnings += paymentCount;
              } catch (e) {
                console.warn('[TutorsPage] payment count failed', tutor.tutorId, moduleItem.moduleId, e);
              }
            }

            const enriched: EnhancedTutor = {
              ...tutor,
              modules,
              studentsCount,
              totalEarnings,
              modulesError,
            };
            console.log('[TutorsPage] Enriched tutor data', enriched);
            return enriched;
          })
        );

        // Preserve previously loaded non-empty modules in case of a second pass that returned empty arrays
        setTutors(prev => {
          if (!prev || prev.length === 0) return enhancedTutors;
          const merged = enhancedTutors.map(newT => {
            const old = prev.find(p => p.tutorId === newT.tutorId);
            if (old && (!newT.modules || newT.modules.length === 0) && old.modules && old.modules.length > 0) {
              return { ...newT, modules: old.modules };
            }
            return newT;
          });
            console.log('[TutorsPage] Merged tutors (preserving prior modules where needed)', merged.map(m => ({ id: m.tutorId, len: m.modules.length })));
          return merged;
        });
      } catch (error) {
        console.error('Error fetching tutors:', error);
        toast.error('Failed to load tutors');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Debug: log whenever tutors state changes
  useEffect(() => {
    if (!loading) {
      console.log('[TutorsPage] Tutors state snapshot:', tutors.map(t => ({ id: t.tutorId, modulesLen: t.modules?.length, moduleNames: t.modules?.map(m => m.name) })));
    }
  }, [tutors, loading]);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = getTutorFullName(tutor).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveTutor = async (tutorId: string) => {
    try {
      await approveTutor(tutorId);
      setTutors(tutors.map(tutor => 
        tutor.tutorId === tutorId 
          ? { ...tutor, status: 'APPROVED' as const }
          : tutor
      ));
      toast.success('Tutor approved successfully');
    } catch (error) {
      console.error('Error approving tutor:', error);
      toast.error('Failed to approve tutor');
    }
  };

  const handleBanTutor = async (tutorId: string) => {
    try {
      await banTutor(tutorId);
      setTutors(tutors.map(tutor => 
        tutor.tutorId === tutorId 
          ? { ...tutor, status: 'BANNED' as const }
          : tutor
      ));
      toast.success('Tutor banned successfully');
    } catch (error) {
      console.error('Error banning tutor:', error);
      toast.error('Failed to ban tutor');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!selectedTutor) {
      toast.error('No tutor selected');
      return;
    }

    try {
      // Here you would integrate with your email API
      // await sendEmail(selectedTutor.user.email, emailSubject, emailMessage);
      toast.success('Email sent successfully');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const getStatusBadgeVariant = (status: TutorEntity['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'BANNED':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Debug toggle */}
        <div className="flex justify-end -mb-4">
          <Button size="sm" variant={showModulesDebug ? 'danger' : 'outline'} onClick={() => setShowModulesDebug(v => !v)}>
            {showModulesDebug ? 'Hide Modules Debug' : 'Show Modules Debug'}
          </Button>
        </div>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text">Tutors Management</h1>
          <p className="text-text-muted mt-2">Manage tutor accounts, approvals, and communications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-muted">Total Tutors</p>
                    <p className="text-2xl font-bold text-text">{tutors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Check className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-muted">Approved</p>
                    <p className="text-2xl font-bold text-text">
                      {tutors.filter(t => t.status === 'APPROVED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Search className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-muted">Pending</p>
                    <p className="text-2xl font-bold text-text">
                      {tutors.filter(t => t.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Ban className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-muted">Banned</p>
                    <p className="text-2xl font-bold text-text">
                      {tutors.filter(t => t.status === 'BANNED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tutors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'BANNED'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    size="sm"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutors Table */}
        <Card>
          <CardContent className="p-0">
            {filteredTutors.length === 0 ? (
              <EmptyState
                title="No tutors found"
                description="No tutors match your current filters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-text">Tutor</th>
                      <th className="text-left p-4 font-semibold text-text">Modules</th>
                      <th className="text-left p-4 font-semibold text-text">Students</th>
                      <th className="text-left p-4 font-semibold text-text">Earnings</th>
                      <th className="text-left p-4 font-semibold text-text">Status</th>
                      <th className="text-left p-4 font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTutors.map((tutor, index) => (
                      <motion.tr
                        key={tutor.tutorId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-background/50 cursor-pointer"
                        onClick={(e) => {
                          // Avoid triggering row navigation when clicking action buttons
                          const target = e.target as HTMLElement;
                          if (target.closest('button')) return;
                          router.push(`/tutors/${tutor.tutorId}`);
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={tutor.image}
                              alt={getTutorFullName(tutor)}
                              size="md"
                            />
                            <div>
                              <div className="font-medium text-text">
                                {getTutorFullName(tutor)}
                              </div>
                              <div className="text-sm text-text-muted">
                                {tutor.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {tutor.modulesError ? (
                            <span className="text-xs text-red-600" title={tutor.modulesError}>Modules load error</span>
                          ) : Array.isArray(tutor.modules) ? (
                            tutor.modules.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {tutor.modules.map(m => (
                                  <Badge key={m.moduleId} size="sm" variant="info" className="truncate max-w-[160px]" title={m.name}>
                                    {m.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted" title={`TutorId: ${tutor.tutorId}`}>No modules</span>
                            )
                          ) : (
                            <span className="text-xs text-orange-600" title="Modules not yet loaded">Loading…</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-text">
                            {tutor.studentsCount}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-text">
                            ${tutor.totalEarnings.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(tutor.status)}>
                            {tutor.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {tutor.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApproveTutor(tutor.tutorId)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {tutor.status !== 'BANNED' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleBanTutor(tutor.tutorId)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTutor(tutor);
                                setShowEmailModal(true);
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {showModulesDebug && (
                  <div className="p-4 bg-background border-t text-xs font-mono space-y-2">
                    <div className="font-semibold">Modules Debug Snapshot</div>
                    {filteredTutors.map(t => (
                      <div key={t.tutorId} className="border rounded p-2 bg-white/50">
                        <div><strong>Tutor:</strong> {t.tutorId}</div>
                        <div><strong>modules len:</strong> {t.modules?.length}</div>
                        <div><strong>names:</strong> {t.modules?.map(m => m.name).join(', ') || '(none)'}</div>
                        {t.modulesError && <div className="text-red-600">modulesError: {t.modulesError}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Modal */}
        <Modal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedTutor(null);
            setEmailSubject('');
            setEmailMessage('');
          }}
          title={`Send Email to ${selectedTutor ? getTutorFullName(selectedTutor) : ''}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Subject
              </label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Message
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter your message"
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedTutor(null);
                  setEmailSubject('');
                  setEmailMessage('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                Send Email
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}