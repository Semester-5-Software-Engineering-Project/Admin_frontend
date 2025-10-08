"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Protected from '@/components/auth/Protected';
import { Ban, Eye, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { downloadCSV } from '@/utils/helpers';
import { fetchAllStudents, banStudent as apiBanStudent, unbanStudent as apiUnbanStudent, fetchStudentTotalSpent, fetchStudentModules, mapStudentEntityToUI, UIStudent } from '@/API/student';
import type { StudentModuleDto } from '@/types';

const DEBUG_STUDENT = process.env.NEXT_PUBLIC_DEBUG_STUDENT === 'true';

interface EnrichedStudent extends UIStudent {
  loadingDetails?: boolean;
  modulesLoaded?: boolean;
  totalSpentLoading?: boolean;
  modulesLoading?: boolean;
  modulesError?: boolean;
}

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (DEBUG_STUDENT) console.log('[StudentsPage] loadStudents: start');
    setLoading(true);
    setError(null);
    try {
      const entities = await fetchAllStudents();
      const ui = entities.map(mapStudentEntityToUI);
      setStudents(ui);
      if (DEBUG_STUDENT) console.log('[StudentsPage] loadStudents: mapped count', ui.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load students';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Batch fetch total spent
  const totalsFetchedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (loading || students.length === 0) return;
    const toFetch = students.filter(s => !totalsFetchedRef.current.has(s.id));
    if (toFetch.length === 0) return;
    setStudents(prev => prev.map(s => toFetch.some(t => t.id === s.id) ? { ...s, totalSpentLoading: true } : s));
    const run = async () => {
      const batchSize = 5;
      for (let i = 0; i < toFetch.length; i += batchSize) {
        const batch = toFetch.slice(i, i + batchSize);
        await Promise.all(batch.map(async stu => {
          try {
            const res = await fetchStudentTotalSpent(stu.id);
            totalsFetchedRef.current.add(stu.id);
            setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, totalSpent: res.totalSpent, totalSpentLoading: false } : s));
          } catch (err) {
            if (DEBUG_STUDENT) console.warn('[StudentsPage] totalSpent error', stu.id, err);
            setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, totalSpentLoading: false } : s));
          }
        }));
        if (i + batchSize < toFetch.length) await new Promise(r => setTimeout(r, 100));
      }
    };
    run();
  }, [loading, students]);

  // Batch fetch modules (lightweight – similar pattern)
  const modulesFetchedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (loading || students.length === 0) return;
    const toFetch = students.filter(s => s.modulesEnrolled.length === 0 && !modulesFetchedRef.current.has(s.id));
    if (toFetch.length === 0) return;
    setStudents(prev => prev.map(s => toFetch.some(t => t.id === s.id) ? { ...s, modulesLoading: true, modulesError: false } : s));
    const run = async () => {
      const batchSize = 4;
      for (let i = 0; i < toFetch.length; i += batchSize) {
        const batch = toFetch.slice(i, i + batchSize);
        await Promise.all(batch.map(async stu => {
          try {
            const mods = await fetchStudentModules(stu.id);
            modulesFetchedRef.current.add(stu.id);
            setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, modulesEnrolled: mods.map(m => m.name), modulesLoaded: true, modulesLoading: false } : s));
          } catch (err) {
            if (DEBUG_STUDENT) console.warn('[StudentsPage] modules error', stu.id, err);
            modulesFetchedRef.current.add(stu.id);
            setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, modulesLoading: false, modulesError: true } : s));
          }
        }));
        if (i + batchSize < toFetch.length) await new Promise(r => setTimeout(r, 120));
      }
    };
    run();
  }, [loading, students]);

  const handleBanStudent = async (studentId: string) => {
    try {
      await apiBanStudent(studentId);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'banned' } : s));
      toast.error('Student has been banned.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to ban student';
      toast.error(msg);
    } finally { setShowDetailsModal(false); }
  };

  const handleUnbanStudent = async (studentId: string) => {
    try {
      await apiUnbanStudent(studentId);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'active' } : s));
      toast.success('Student has been unbanned.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to unban student';
      toast.error(msg);
    } finally { setShowDetailsModal(false); }
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(s => ({
      Name: s.name,
      Email: s.email,
      Modules: s.modulesEnrolled.join('; '),
      Status: s.status,
      'Total Spent': `$${s.totalSpent}`,
      'Enrolled Date': s.enrolledAt,
    }));
    downloadCSV(exportData, 'students_export');
    toast.success('Students exported successfully!');
  };

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(search) || student.email.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => status === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Banned</Badge>;

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    banned: students.filter(s => s.status === 'banned').length,
    totalRevenue: students.reduce((sum, s) => sum + (s.totalSpent || 0), 0),
  };

  const loadStudentDetails = async (student: EnrichedStudent) => {
    if (student.loadingDetails) return;
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, loadingDetails: true } : s));
    try {
      const [spent, modules] = await Promise.all([
        fetchStudentTotalSpent(student.id).catch(() => null),
        fetchStudentModules(student.id).catch(() => [] as StudentModuleDto[])
      ]);
      setStudents(prev => prev.map(s => s.id === student.id ? {
        ...s,
        totalSpent: spent?.totalSpent ?? s.totalSpent,
        modulesEnrolled: (modules || []).map(m => m.name),
        modulesLoaded: true,
        loadingDetails: false,
      } : s));
    } catch {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, loadingDetails: false } : s));
    }
  };

  const handleRowNavigate = (id: string) => {
    router.push(`/students/${id}`);
  };

  return (
    <Protected>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text">Student Management</h1>
            <p className="text-text-light">Monitor and manage student accounts</p>
          </div>
          <Button
            variant="outline"
            leftIcon={<Download size={20} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Total Students</p>
              <h3 className="text-2xl font-bold text-text">{stats.total}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Active</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Banned</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.banned}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={20} />}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base md:w-48"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="p-6 text-center text-text-light">Loading students...</div>
            )}
            {error && !loading && (
              <div className="p-6 text-center text-red-500">{error}</div>
            )}
            {!loading && !error && filteredStudents.length === 0 ? (
              <EmptyState
                title="No students found"
                description="Try adjusting your search or filter criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-text">Student</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Modules Enrolled</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Total Spent</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Enrolled Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('[data-row-action]')) return;
                          handleRowNavigate(student.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRowNavigate(student.id); }}
                      >
                        <td className="p-4" onClick={(e)=>{e.stopPropagation(); handleRowNavigate(student.id);}}>
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} />
                            <div>
                              <p className="font-medium text-text">{student.name}</p>
                              <p className="text-sm text-text-light">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4" onClick={(e)=>{e.stopPropagation(); handleRowNavigate(student.id);}}>
                          <div className="flex flex-wrap gap-1">
                            {student.modulesLoading && student.modulesEnrolled.length === 0 && !student.modulesError && (
                              <span className="text-text-light text-xs animate-pulse">Loading...</span>
                            )}
                            {student.modulesError && student.modulesEnrolled.length === 0 && (
                              <span className="text-red-500 text-xs" title="Failed to load modules">Error</span>
                            )}
                            {!student.modulesLoading && !student.modulesError && student.modulesEnrolled.length === 0 && (
                              <span className="text-text-light text-xs">None</span>
                            )}
                            {student.modulesEnrolled.slice(0, 2).map((module, idx) => (
                              <Badge key={idx} size="sm">{module}</Badge>
                            ))}
                            {student.modulesEnrolled.length > 2 && (
                              <Badge size="sm" variant="info">
                                +{student.modulesEnrolled.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-text" onClick={(e)=>{e.stopPropagation(); handleRowNavigate(student.id);}}>
                          {student.totalSpentLoading ? (
                            <span className="animate-pulse text-text-light text-sm">Loading...</span>
                          ) : (
                            `$${(student.totalSpent ?? 0).toFixed(2)}`
                          )}
                        </td>
                        <td className="p-4 text-text-light" onClick={(e)=>{e.stopPropagation(); handleRowNavigate(student.id);}}>{student.enrolledAt}</td>
                        <td className="p-4" onClick={(e)=>{e.stopPropagation(); handleRowNavigate(student.id);}}>{getStatusBadge(student.status)}</td>
                        <td className="p-4" data-row-action>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDetailsModal(true);
                                if (!student.modulesLoaded) {
                                  loadStudentDetails(student);
                                }
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="View Profile"
                              data-row-action
                            >
                              <Eye size={18} />
                            </button>
                            {student.status === 'active' ? (
                              <button
                                onClick={() => handleBanStudent(student.id)}
                                className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                                title="Ban Student"
                                data-row-action
                              >
                                <Ban size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnbanStudent(student.id)}
                                className="p-2 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                                title="Unban Student"
                                data-row-action
                              >
                                <Badge size="sm" variant="success">Unban</Badge>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Student Profile"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar name={selectedStudent.name} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-text">{selectedStudent.name}</h3>
                <p className="text-text-light">{selectedStudent.email}</p>
                {getStatusBadge(selectedStudent.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Enrolled Modules</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedStudent.modulesEnrolled.length === 0 && (
                  <span className="text-text-light text-sm">{students.find(s => s.id === selectedStudent.id)?.loadingDetails ? 'Loading modules...' : 'No modules enrolled'}</span>
                )}
                {selectedStudent.modulesEnrolled.map((module: string, idx: number) => (
                  <Badge key={idx}>{module}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Total Spent</label>
              <p className="text-text font-semibold text-lg">${selectedStudent.totalSpent?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Enrolled Since</label>
              <p className="text-text">{selectedStudent.enrolledAt}</p>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              {selectedStudent.status === 'active' ? (
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleBanStudent(selectedStudent.id)}
                >
                  Ban Student
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleUnbanStudent(selectedStudent.id)}
                >
                  Unban Student
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
    </Protected>
  );
}
