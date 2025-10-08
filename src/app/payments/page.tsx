'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Protected from '@/components/auth/Protected';
import { Check, X, Eye, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';

interface PaymentRequest {
  id: string;
  tutorName: string;
  tutorEmail: string;
  module: string;
  studentsEnrolled: number;
  claimDate: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState<'requests' | 'history'>('requests');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock payment requests
  const [payments, setPayments] = useState<PaymentRequest[]>([
    {
      id: '1',
      tutorName: 'John Doe',
      tutorEmail: 'john@example.com',
      module: 'Mathematics 101',
      studentsEnrolled: 45,
      claimDate: '2025-10-01',
      amount: 2250,
      status: 'pending',
    },
    {
      id: '2',
      tutorName: 'Sarah Johnson',
      tutorEmail: 'sarah@example.com',
      module: 'Physics Advanced',
      studentsEnrolled: 32,
      claimDate: '2025-10-02',
      amount: 1600,
      status: 'pending',
    },
    {
      id: '3',
      tutorName: 'Mike Wilson',
      tutorEmail: 'mike@example.com',
      module: 'Computer Science',
      studentsEnrolled: 58,
      claimDate: '2025-09-28',
      amount: 2900,
      status: 'approved',
    },
  ]);

  const handleApprove = (paymentId: string) => {
    setPayments(prev =>
      prev.map(p => p.id === paymentId ? { ...p, status: 'approved' as const } : p)
    );
    toast.success('Payment approved successfully!');
    setShowDetailsModal(false);
  };

  const handleReject = (paymentId: string) => {
    setPayments(prev =>
      prev.map(p => p.id === paymentId ? { ...p, status: 'rejected' as const } : p)
    );
    toast.error('Payment rejected.');
    setShowDetailsModal(false);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalApproved = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Protected>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text">Payment Distribution</h1>
            <p className="text-text-light">Manage tutor payment requests and history</p>
          </div>
          <Button variant="outline" leftIcon={<Download size={20} />}>
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Total Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Total Approved</p>
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Pending Requests</p>
              <h3 className="text-2xl font-bold text-text">
                {payments.filter(p => p.status === 'pending').length}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['requests', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                selectedTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-light hover:text-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by tutor name or module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Filter size={20} />}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-base md:w-48"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <EmptyState
                title="No payments found"
                description="Try adjusting your search or filter criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-text">Tutor</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Module</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Students</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Amount</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text">{payment.tutorName}</p>
                            <p className="text-sm text-text-light">{payment.tutorEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-text">{payment.module}</td>
                        <td className="p-4 text-text">{payment.studentsEnrolled}</td>
                        <td className="p-4 font-semibold text-text">{formatCurrency(payment.amount)}</td>
                        <td className="p-4 text-text-light">{formatDate(payment.claimDate)}</td>
                        <td className="p-4">{getStatusBadge(payment.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(payment.id)}
                                  className="p-2 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(payment.id)}
                                  className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              </>
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

      {/* Payment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Payment Details"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-light">Tutor Name</label>
              <p className="text-text font-semibold">{selectedPayment.tutorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Email</label>
              <p className="text-text">{selectedPayment.tutorEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Module</label>
              <p className="text-text">{selectedPayment.module}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Students Enrolled</label>
              <p className="text-text">{selectedPayment.studentsEnrolled}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Amount</label>
              <p className="text-text font-bold text-2xl">{formatCurrency(selectedPayment.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Status</label>
              <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
            </div>
            
            {selectedPayment.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  leftIcon={<Check size={20} />}
                  onClick={() => handleApprove(selectedPayment.id)}
                >
                  Approve Payment
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  leftIcon={<X size={20} />}
                  onClick={() => handleReject(selectedPayment.id)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
    </Protected>
  );
}
