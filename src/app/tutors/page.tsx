'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Ban, Mail, Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';

interface Tutor {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  modules: string[];
  status: 'pending' | 'approved' | 'banned';
  studentsCount: number;
  totalEarnings: number;
}

export default function TutorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      modules: ['Mathematics 101', 'Algebra'],
      status: 'approved',
      studentsCount: 45,
      totalEarnings: 12500,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      modules: ['Physics', 'Chemistry'],
      status: 'pending',
      studentsCount: 0,
      totalEarnings: 0,
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      modules: ['Computer Science', 'Programming'],
      status: 'approved',
      studentsCount: 58,
      totalEarnings: 18900,
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      modules: ['English Literature'],
      status: 'banned',
      studentsCount: 12,
      totalEarnings: 3200,
    },
  ]);

  const handleApproveTutor = (tutorId: string) => {
    setTutors(prev =>
      prev.map(t => t.id === tutorId ? { ...t, status: 'approved' as const } : t)
    );
    toast.success('Tutor approved successfully!');
    setShowDetailsModal(false);
  };

  const handleBanTutor = (tutorId: string) => {
    setTutors(prev =>
      prev.map(t => t.id === tutorId ? { ...t, status: 'banned' as const } : t)
    );
    toast.error('Tutor has been banned.');
    setShowDetailsModal(false);
  };

  const handleSendEmail = () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Mock email sending
    toast.success(`Email sent to ${selectedTutor?.name}!`);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'banned':
        return <Badge variant="danger">Banned</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const stats = {
    total: tutors.length,
    approved: tutors.filter(t => t.status === 'approved').length,
    pending: tutors.filter(t => t.status === 'pending').length,
    banned: tutors.filter(t => t.status === 'banned').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Tutor Management</h1>
          <p className="text-text-light">Manage tutor approvals, bans, and communications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Total Tutors</p>
              <h3 className="text-2xl font-bold text-text">{stats.total}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Approved</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-light text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
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
                  placeholder="Search tutors..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tutors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTutors.length === 0 ? (
              <EmptyState
                title="No tutors found"
                description="Try adjusting your search or filter criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-text">Tutor</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Modules</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Students</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Earnings</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTutors.map((tutor) => (
                      <motion.tr
                        key={tutor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={tutor.name} src={tutor.profilePicture} />
                            <div>
                              <p className="font-medium text-text">{tutor.name}</p>
                              <p className="text-sm text-text-light">{tutor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {tutor.modules.map((module, idx) => (
                              <Badge key={idx} size="sm">{module}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-text">{tutor.studentsCount}</td>
                        <td className="p-4 font-semibold text-text">${tutor.totalEarnings.toLocaleString()}</td>
                        <td className="p-4">{getStatusBadge(tutor.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedTutor(tutor);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="View Details"
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTutor(tutor);
                                setShowEmailModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-purple-50 text-purple-500 transition-colors"
                              title="Send Email"
                            >
                              <Mail size={18} />
                            </button>
                            {tutor.status === 'pending' && (
                              <button
                                onClick={() => handleApproveTutor(tutor.id)}
                                className="p-2 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                            )}
                            {tutor.status !== 'banned' && (
                              <button
                                onClick={() => handleBanTutor(tutor.id)}
                                className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                                title="Ban"
                              >
                                <Ban size={18} />
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

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title={`Send Email to ${selectedTutor?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            placeholder="Enter email subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text mb-2">Message</label>
            <textarea
              className="input-base min-h-[150px]"
              placeholder="Type your message here..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSendEmail}
              leftIcon={<Mail size={20} />}
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Tutor Details"
        size="md"
      >
        {selectedTutor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar name={selectedTutor.name} src={selectedTutor.profilePicture} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-text">{selectedTutor.name}</h3>
                <p className="text-text-light">{selectedTutor.email}</p>
                {getStatusBadge(selectedTutor.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Modules Teaching</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTutor.modules.map((module, idx) => (
                  <Badge key={idx}>{module}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Total Students</label>
              <p className="text-text font-semibold text-lg">{selectedTutor.studentsCount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Total Earnings</label>
              <p className="text-text font-semibold text-lg">${selectedTutor.totalEarnings.toLocaleString()}</p>
            </div>
            
            {selectedTutor.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleApproveTutor(selectedTutor.id)}
                >
                  Approve Tutor
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleBanTutor(selectedTutor.id)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
