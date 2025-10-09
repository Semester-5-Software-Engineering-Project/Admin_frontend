'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import Skeleton from '@/components/ui/Skeleton';
import { paymentsAPI } from '@/API/payments';
import { PaymentRequest } from '@/types';

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState<'requests' | 'history'>('requests');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // API data states
  const [totalPending, setTotalPending] = useState<number>(0);
  const [totalApproved, setTotalApproved] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Real withdrawal data
  const [withdrawals, setWithdrawals] = useState<PaymentRequest[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState<boolean>(true);

  // Fetch summary data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingWithdrawals(true);
        setError(null);
        
        // Fetch summary data and withdrawal data in parallel
        const [pendingAmount, approvedAmount, pendingRequests, withdrawalData] = await Promise.all([
          paymentsAPI.getTotalPending(),
          paymentsAPI.getTotalApproved(),
          paymentsAPI.getPendingCount(),
          paymentsAPI.getAllWithdrawals()
        ]);
        
        setTotalPending(pendingAmount);
        setTotalApproved(approvedAmount);
        setPendingCount(pendingRequests);
        setWithdrawals(withdrawalData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch payment data');
        toast.error('Failed to load payment data');
      } finally {
        setIsLoading(false);
        setIsLoadingWithdrawals(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (withdrawalId: string) => {
    try {
      await paymentsAPI.updateWithdrawalStatus(withdrawalId, 'APPROVED');
      setWithdrawals(prev =>
        prev.map(w => w.withdrawalId === withdrawalId ? { ...w, status: 'APPROVED' as const } : w)
      );
      toast.success('Payment approved successfully!');
      setShowDetailsModal(false);
      
      // Refresh summary data
      refreshSummaryData();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      await paymentsAPI.updateWithdrawalStatus(withdrawalId, 'REJECTED');
      setWithdrawals(prev =>
        prev.map(w => w.withdrawalId === withdrawalId ? { ...w, status: 'REJECTED' as const } : w)
      );
      toast.error('Payment rejected.');
      setShowDetailsModal(false);
      
      // Refresh summary data
      refreshSummaryData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const refreshSummaryData = async () => {
    try {
      const [pendingAmount, approvedAmount, pendingRequests] = await Promise.all([
        paymentsAPI.getTotalPending(),
        paymentsAPI.getTotalApproved(),
        paymentsAPI.getPendingCount()
      ]);
      
      setTotalPending(pendingAmount);
      setTotalApproved(approvedAmount);
      setPendingCount(pendingRequests);
    } catch (err) {
      console.error('Error refreshing summary data:', err);
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesFilter = filter === 'all' || withdrawal.status.toLowerCase() === filter;
    const matchesSearch = withdrawal.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.method.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
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

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Total Pending</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <h3 className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</h3>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Total Approved</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</h3>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-text-light text-sm mb-1">Pending Requests</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <h3 className="text-2xl font-bold text-text">{pendingCount}</h3>
              )}
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
                <option value="paid">Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingWithdrawals ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <EmptyState
                title="No withdrawal requests found"
                description="Try adjusting your search or filter criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-text">Tutor</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Payment Method</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Account Details</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Amount</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.map((withdrawal) => (
                      <motion.tr
                        key={withdrawal.withdrawalId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text">{withdrawal.tutorName}</p>
                            <p className="text-sm text-text-light">ID: {withdrawal.tutorId.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-text">{withdrawal.method}</p>
                            {withdrawal.bankName && (
                              <p className="text-sm text-text-light">{withdrawal.bankName}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text">{withdrawal.accountName}</p>
                            <p className="text-sm text-text-light">{withdrawal.accountNumber}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-text">{formatCurrency(withdrawal.amount)}</td>
                        <td className="p-4 text-text-light">{formatDate(withdrawal.createdAt)}</td>
                        <td className="p-4">{getStatusBadge(withdrawal.status.toLowerCase())}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(withdrawal);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {withdrawal.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(withdrawal.withdrawalId)}
                                  className="p-2 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(withdrawal.withdrawalId)}
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
        title="Withdrawal Details"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-light">Tutor Name</label>
              <p className="text-text font-semibold">{selectedPayment.tutorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Tutor ID</label>
              <p className="text-text">{selectedPayment.tutorId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Payment Method</label>
              <p className="text-text">{selectedPayment.method}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Account Name</label>
              <p className="text-text">{selectedPayment.accountName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Account Number</label>
              <p className="text-text">{selectedPayment.accountNumber}</p>
            </div>
            {selectedPayment.bankName && (
              <div>
                <label className="text-sm font-medium text-text-light">Bank Name</label>
                <p className="text-text">{selectedPayment.bankName}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-text-light">Amount</label>
              <p className="text-text font-bold text-2xl">{formatCurrency(selectedPayment.amount)}</p>
            </div>
            {selectedPayment.notes && (
              <div>
                <label className="text-sm font-medium text-text-light">Notes</label>
                <p className="text-text">{selectedPayment.notes}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-text-light">Created Date</label>
              <p className="text-text">{formatDate(selectedPayment.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">Status</label>
              <div className="mt-1">{getStatusBadge(selectedPayment.status.toLowerCase())}</div>
            </div>
            
            {selectedPayment.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  leftIcon={<Check size={20} />}
                  onClick={() => handleApprove(selectedPayment.withdrawalId)}
                >
                  Approve Payment
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  leftIcon={<X size={20} />}
                  onClick={() => handleReject(selectedPayment.withdrawalId)}
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
