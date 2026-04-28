'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBorrowerStore } from '@/store/useBorrowerStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800',
  APPROVED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  DISBURSED: 'bg-blue-100 text-blue-800',
  CLOSED:    'bg-slate-100 text-slate-700',
};

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const getMe = useAuthStore((s) => s.getMe);
  const { myLoans, fetchMyLoans, isLoading: isLoansLoading } = useBorrowerStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (user?.role === 'BORROWER') {
        await Promise.all([fetchMyLoans(), getMe()]);
      }
      if (isMounted) {
        setIsInitialLoad(false);
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [user?.role, fetchMyLoans, getMe]);

  const isLoading = isInitialLoad || isLoansLoading;

  const hasActiveLoan = myLoans.some((l) =>
    ['PENDING', 'APPROVED', 'DISBURSED'].includes(l.status)
  );

  const showReapplyButton = 
    user?.role === 'BORROWER' && 
    !hasActiveLoan && 
    (user.profileStatus === 'ELIGIBLE' || user.profileStatus === 'REGISTERED');

  if (isInitialLoad) {
    return (
      <ProtectedRoute>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Welcome card */}
        <div className="bg-white/80 glass-panel p-10 shadow-soft rounded-3xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.personalDetails?.fullName ?? user?.email.split('@')[0]}!
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              You are currently logged in as{' '}
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm inline-block">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* ── Borrower: loan status cards ── */}
        {user?.role === 'BORROWER' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Your Loan Applications</h2>
              {showReapplyButton && myLoans.length > 0 && (
                <Link href="/apply/details">
                  <Button size="sm" className="rounded-full shadow-md shadow-indigo-200">
                    + New Application
                  </Button>
                </Link>
              )}
            </div>

            {showReapplyButton && myLoans.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold">Ready for a new start?</h3>
                    <p className="text-indigo-100 mt-1 max-w-md">Your previous application was rejected, but you can apply again with updated details or a different amount.</p>
                  </div>
                  <Link href="/apply/details">
                    <Button variant="outline" className="bg-white text-indigo-600 border-white hover:bg-indigo-50 font-bold px-8">
                      Start New Application
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : myLoans.length === 0 ? (
              <div className="bg-white/60 glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-300">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No applications yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't started any loan applications yet. Check your eligibility to get started.</p>
                {user.profileStatus === 'REGISTERED' && (
                  <Link href="/apply/details">
                    <Button size="lg" className="rounded-full">Start Application →</Button>
                  </Link>
                )}
                {user.profileStatus === 'ELIGIBLE' && (
                  <Link href="/apply/upload">
                    <Button size="lg" className="rounded-full">Continue Application →</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-5">
                {myLoans.map((loan) => (
                  <div
                    key={loan._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-extrabold text-slate-900">
                          ₹{loan.amount.toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLE[loan.status] ?? 'bg-slate-100 text-slate-700'}`}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{loan.tenure} months</span>
                        <span>•</span>
                        <span>{loan.interestRate}% p.a. interest</span>
                      </p>
                      
                      {loan.status === 'DISBURSED' && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-sm text-slate-600">
                            Outstanding Balance:{' '}
                            <span className="font-bold text-red-600 text-base">
                              ₹{loan.outstandingBalance.toLocaleString('en-IN')}
                            </span>
                          </p>
                        </div>
                      )}
                      {loan.status === 'REJECTED' && loan.rejectionReason && (
                        <div className="mt-3 pt-3 border-t border-red-50">
                          <p className="text-sm font-medium text-red-600 flex items-start gap-1.5">
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Reason: {loan.rejectionReason}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xs font-medium text-slate-400">
                        Applied on
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {new Date(loan.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Ops roles: module hint ── */}
        {user?.role !== 'BORROWER' && (
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/50 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Operations Panel</h3>
            <p className="text-indigo-700/80">
              Use the sidebar navigation to access your module.
              {user?.role === 'ADMIN'
                ? ' As an Admin, you have full access to all operational modules.'
                : ` You are currently assigned to manage the ${user?.role?.toLowerCase()} pipeline.`}
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
