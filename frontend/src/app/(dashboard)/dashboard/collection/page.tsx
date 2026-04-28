'use client';

import { useEffect, useState } from 'react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';
import type { User } from '@/types';

export default function CollectionDashboard() {
  const {
    activeLoans, paymentHistory,
    fetchActiveLoans, fetchPaymentHistory, recordPayment,
    paymentLoading, isLoading, error,
  } = useCollectionStore();

  const [openLoanId, setOpenLoanId] = useState<string | null>(null);
  const [form, setForm] = useState({
    utrNumber: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchActiveLoans(); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  // Fetch payment history when a loan row is expanded
  useEffect(() => {
    if (openLoanId) fetchPaymentHistory(openLoanId);
  }, [openLoanId]);

  const handleSubmitPayment = async (e: React.FormEvent, loanId: string) => {
    e.preventDefault();
    if (!form.utrNumber || !form.amount || !form.paymentDate) {
      toast.error('All payment fields are required.');
      return;
    }
    try {
      const { message } = await recordPayment({
        loanId,
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      toast.success(message);
      setOpenLoanId(null);
      setForm({ utrNumber: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COLLECTION', 'ADMIN']}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Collections</h1>
          <p className="mt-2 text-slate-500 text-lg">Record payments and track outstanding balances.</p>
        </div>

        <div className="bg-white/80 glass-panel shadow-soft rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Disbursed Loans</h3>
            <div className="bg-green-50 text-green-700 border border-green-200/60 px-3 py-1 rounded-full text-sm font-bold">
              {activeLoans.length} Active
            </div>
          </div>

          <ul className="divide-y divide-slate-100/60">
            {isLoading ? (
              <li className="px-6 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </li>
            ) : activeLoans.length === 0 ? (
              <li className="px-6 py-16 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No active loans</h3>
                <p className="text-slate-500">There are no disbursed loans requiring collection.</p>
              </li>
            ) : (
              activeLoans.map((loan) => {
                const borrower = loan.borrowerId as User;
                const isOpen = openLoanId === loan._id;
                const history = paymentHistory[loan._id];

                return (
                  <li key={loan._id} className="p-6 transition-colors hover:bg-slate-50/50">
                    {/* Loan summary row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3 flex-1 w-full">
                        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Outstanding Balance</p>
                            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                              ₹{loan.outstandingBalance.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="pb-1">
                            <span className="text-sm font-medium text-slate-400">
                              / ₹{loan.totalRepayment.toLocaleString('en-IN')} total
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                          <div>
                            <p className="text-slate-400 mb-0.5 font-medium">Borrower</p>
                            <p className="font-semibold text-slate-900">{borrower?.personalDetails?.fullName ?? borrower?.email}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-0.5 font-medium">Monthly EMI</p>
                            <p className="font-bold text-slate-900">₹{Math.round(loan.monthlyEMI).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-0.5 font-medium">Original Loan</p>
                            <p className="font-semibold text-slate-900">₹{loan.amount.toLocaleString('en-IN')} ({loan.tenure}m)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <Button
                          variant={isOpen ? 'outline' : 'primary'}
                          size="lg"
                          className="w-full md:w-auto"
                          onClick={() => setOpenLoanId(isOpen ? null : loan._id)}
                        >
                          {isOpen ? 'Close Panel' : 'Record Payment'}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded: payment form + history */}
                    {isOpen && (
                      <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Payment form */}
                          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                            <h4 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              New Payment
                            </h4>
                            <form onSubmit={(e) => handleSubmitPayment(e, loan._id)} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="UTR Number" required placeholder="e.g. UTR123456789"
                                  value={form.utrNumber}
                                  onChange={(e) => setForm({ ...form, utrNumber: e.target.value })} />
                                <Input label="Amount (₹)" type="number" required placeholder="Amount received"
                                  max={loan.outstandingBalance}
                                  value={form.amount}
                                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                              </div>
                              <Input label="Payment Date" type="date" required
                                value={form.paymentDate}
                                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
                              <div className="pt-2">
                                <Button type="submit" size="lg" className="w-full shadow-md" isLoading={paymentLoading === loan._id}>
                                  Submit Payment
                                </Button>
                              </div>
                            </form>
                          </div>

                          {/* Payment history */}
                          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h4 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Payment History
                            </h4>
                            
                            {(!history || history.length === 0) ? (
                              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm font-medium text-slate-500">No payments recorded yet.</p>
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                      <th className="px-4 py-3 border-b border-slate-200">Date</th>
                                      <th className="px-4 py-3 border-b border-slate-200">UTR / Ref</th>
                                      <th className="px-4 py-3 border-b border-slate-200 text-right">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {history.map((p) => (
                                      <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                                          {new Date(p.paymentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500">
                                          {p.utrNumber}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-bold text-green-600 text-right">
                                          ₹{p.amount.toLocaleString('en-IN')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
