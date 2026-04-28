'use client';

import { useEffect } from 'react';
import { useDisbursementStore } from '@/store/useDisbursementStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import type { User } from '@/types';

export default function DisbursementDashboard() {
  const { approvedLoans, fetchApprovedLoans, disburseLoan, actionLoading, isLoading, error } = useDisbursementStore();

  useEffect(() => { fetchApprovedLoans(); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDisburse = async (loanId: string) => {
    if (!confirm('Confirm: mark this loan as disbursed (funds released to borrower)?')) return;
    try {
      await disburseLoan(loanId);
      toast.success('Loan marked as disbursed.');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <ProtectedRoute allowedRoles={['DISBURSEMENT', 'ADMIN']}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Disbursement Queue</h1>
          <p className="mt-2 text-slate-500 text-lg">Release funds for sanctioned loan applications.</p>
        </div>

        <div className="bg-white/80 glass-panel shadow-soft rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Approved Loans</h3>
            <div className="bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-sm font-bold">
              {approvedLoans.length} Ready
            </div>
          </div>

          <ul className="divide-y divide-slate-100/60">
            {isLoading ? (
              <li className="px-6 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </li>
            ) : approvedLoans.length === 0 ? (
              <li className="px-6 py-16 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Queue is empty</h3>
                <p className="text-slate-500">No approved loans are currently awaiting disbursement.</p>
              </li>
            ) : (
              approvedLoans.map((loan) => {
                const borrower = loan.borrowerId as User;
                return (
                  <li key={loan._id} className="p-6 transition-colors hover:bg-slate-50/80">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-extrabold text-slate-900">
                            ₹{loan.amount.toLocaleString('en-IN')}
                          </p>
                          <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded text-sm">
                            {loan.tenure} Months @ {loan.interestRate}%
                          </span>
                        </div>
                        
                        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 mb-0.5 font-medium">Borrower Details</p>
                              <p className="font-semibold text-slate-900">{borrower?.personalDetails?.fullName ?? borrower?.email}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 mb-0.5 font-medium">Total Repayment</p>
                              <p className="font-bold text-slate-900">₹{loan.totalRepayment.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                          Sanctioned on {new Date(loan.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex shrink-0 w-full md:w-auto">
                        <Button
                          variant="primary"
                          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30"
                          size="lg"
                          isLoading={actionLoading === loan._id}
                          onClick={() => handleDisburse(loan._id)}
                        >
                          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Disburse Funds
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
