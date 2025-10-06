'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

interface Student {
  id: string;
  name: string;
  email: string;
  modulesEnrolled: string[];
  status: 'active' | 'banned';
  totalSpent: number;
  enrolledAt: string;
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Alice Brown',
      email: 'alice@example.com',
      modulesEnrolled: ['Mathematics 101', 'Physics'],
      status: 'active',
      totalSpent: 250,
      enrolledAt: '2025-01-15',
    },
    {
      id: '2',
      name: 'Bob Martinez',
      email: 'bob@example.com',
      modulesEnrolled: ['Computer Science', 'Programming', 'Data Structures'],
      status: 'active',
      totalSpent: 450,
      enrolledAt: '2025-02-20',
    },
    {
      id: '3',
      name: 'Charlie Lee',
      email: 'charlie@example.com',
      modulesEnrolled: ['English Literature'],
      status: 'banned',
      totalSpent: 100,
      enrolledAt: '2025-03-10',
    },
    {
      id: '4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      modulesEnrolled: ['Chemistry', 'Biology'],
      status: 'active',
      totalSpent: 320,
      enrolledAt: '2025-04-05',
    },
  ]);

  const handleBanStudent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, status: 'banned' as const } : s)
    );
    toast.error('Student has been banned.');
    setShowDetailsModal(false);
  };

  const handleUnbanStudent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, status: 'active' as const } : s)
    );
    toast.success('Student has been unbanned.');
    setShowDetailsModal(false);
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
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="danger">Banned</Badge>;
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    banned: students.filter(s => s.status === 'banned').length,
    totalRevenue: students.reduce((sum, s) => sum + s.totalSpent, 0),
  };

  return (
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
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-text">${stats.totalRevenue.toLocaleString()}</h3>
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
            {filteredStudents.length === 0 ? (
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
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} />
                            <div>
                              <p className="font-medium text-text">{student.name}</p>
                              <p className="text-sm text-text-light">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
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
                        <td className="p-4 font-semibold text-text">${student.totalSpent}</td>
                        <td className="p-4 text-text-light">{student.enrolledAt}</td>
                        <td className="p-4">{getStatusBadge(student.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="View Profile"
                            >
                              <Eye size={18} />
                            </button>
                            {student.status === 'active' ? (
                              <button
                                onClick={() => handleBanStudent(student.id)}
                                className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                                title="Ban Student"
                              >
                                <Ban size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnbanStudent(student.id)}
                                className="p-2 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                                title="Unban Student"
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
                {selectedStudent.modulesEnrolled.map((module, idx) => (
                  <Badge key={idx}>{module}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Total Spent</label>
              <p className="text-text font-semibold text-lg">${selectedStudent.totalSpent}</p>
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
  );
}
