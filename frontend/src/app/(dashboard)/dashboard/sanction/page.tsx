'use client';

import { useEffect, useState } from 'react';
import { useSanctionStore } from '@/store/useSanctionStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import type { Loan, User } from '@/types';

export default function SanctionDashboard() {
  const { pendingLoans, fetchPendingLoans, approveLoan, rejectLoan, actionLoading, isLoading, error } = useSanctionStore();
  const [rejectModal, setRejectModal] = useState<{ loanId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPendingLoans(); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleApprove = async (loanId: string) => {
    try {
      await approveLoan(loanId);
      toast.success('Loan approved successfully.');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal || !rejectReason.trim()) { toast.error('Please enter a reason.'); return; }
    try {
      await rejectLoan(rejectModal.loanId, rejectReason);
      toast.success('Loan rejected.');
      setRejectModal(null);
      setRejectReason('');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <ProtectedRoute allowedRoles={['SANCTION', 'ADMIN']}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sanction Queue</h1>
          <p className="mt-2 text-slate-500 text-lg">Review and approve pending loan applications.</p>
        </div>

        <div className="bg-white/80 glass-panel shadow-soft rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Pending Applications</h3>
            <div className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1 rounded-full text-sm font-bold">
              {pendingLoans.length} Pending
            </div>
          </div>

          <ul className="divide-y divide-slate-100/60">
            {isLoading ? (
              <li className="px-6 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </li>
            ) : pendingLoans.length === 0 ? (
              <li className="px-6 py-16 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up!</h3>
                <p className="text-slate-500">There are no pending applications to review right now.</p>
              </li>
            ) : (
              pendingLoans.map((loan) => {
                const borrower = loan.borrowerId as User;
                const acting = actionLoading === loan._id;
                return (
                  <li key={loan._id} className="p-6 transition-colors hover:bg-slate-50/80">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-extrabold text-slate-900">
                            ₹{loan.amount.toLocaleString('en-IN')}
                          </p>
                          <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded text-sm">
                            {loan.tenure} Months
                          </span>
                        </div>
                        
                        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 mb-0.5 font-medium">Borrower</p>
                              <p className="font-semibold text-slate-900">{borrower?.personalDetails?.fullName ?? borrower?.email}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 mb-0.5 font-medium">Monthly Salary</p>
                              <p className="font-semibold text-slate-900">₹{borrower?.personalDetails?.monthlySalary?.toLocaleString()}</p>
                            </div>
                          </div>
                          {loan.salarySlipUrl && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <a href={loan.salarySlipUrl} target="_blank" rel="noreferrer"
                                className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View Salary Slip Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex w-full md:w-auto flex-row md:flex-col gap-3 shrink-0">
                        <Button variant="primary" size="md" className="flex-1 md:w-32" isLoading={acting}
                          onClick={() => handleApprove(loan._id)}>
                          Approve
                        </Button>
                        <Button variant="danger" size="md" className="flex-1 md:w-32 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-none" isLoading={acting}
                          onClick={() => setRejectModal({ loanId: loan._id })}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl p-8 shadow-elevated w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Rejection Reason</h3>
                <p className="text-sm text-slate-500 mt-1">Please provide a reason for rejecting this application. This will be visible to the borrower.</p>
              </div>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-shadow bg-slate-50 placeholder:text-slate-400"
                rows={4} placeholder="E.g., Debt-to-income ratio too high…"
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                  Cancel
                </Button>
                <Button variant="danger" isLoading={actionLoading === rejectModal.loanId} onClick={handleRejectSubmit}>
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
