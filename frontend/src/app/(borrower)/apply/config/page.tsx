'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useBorrowerStore } from '@/store/useBorrowerStore';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const INTEREST_RATE = 12; // 12% p.a. — matches backend

export default function LoanConfigPage() {
  const router = useRouter();
  const { applyForLoan, isLoading, salarySlipUrl } = useBorrowerStore();

  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);

  // Simple Interest = P * R * T / (12 * 100)
  const interest = (amount * INTEREST_RATE * tenure) / (12 * 100);
  const total = amount + interest;
  const emi = total / tenure;

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const handleApply = async () => {
    if (!salarySlipUrl) {
      toast.error('Salary slip missing. Please go back and upload it.');
      return;
    }
    try {
      await applyForLoan(amount, tenure);
      toast.success('Loan application submitted!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BORROWER']}>
      <div className="mx-auto max-w-4xl px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Step 3: Loan Configuration</h1>
          <p className="mt-3 text-slate-500 text-lg">Adjust the sliders to build a plan that works for you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Sliders ── */}
          <div className="lg:col-span-7 bg-white/80 glass-panel p-8 shadow-elevated rounded-3xl border border-slate-100 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-base font-bold text-slate-900">Loan Amount</label>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl font-bold text-lg border border-indigo-100">
                  {fmt(amount)}
                </div>
              </div>
              <input type="range" min="50000" max="500000" step="10000" value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between text-sm font-semibold text-slate-400 mt-3">
                <span>₹50K</span><span>₹5L</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-base font-bold text-slate-900">Repayment Tenure</label>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl font-bold text-lg border border-indigo-100">
                  {tenure} months
                </div>
              </div>
              <input type="range" min="1" max="60" step="1" value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between text-sm font-semibold text-slate-400 mt-3">
                <span>1 month</span><span>60 months</span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 mt-6">
              <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interest is calculated on a flat <strong className="text-slate-800">{INTEREST_RATE}% p.a.</strong> simple interest rate to keep things straightforward and transparent.
              </p>
            </div>
          </div>

          {/* ── Live Summary ── */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-6 rounded-3xl bg-slate-900 text-white p-8 shadow-2xl overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  Repayment Summary
                </h3>
                
                <div className="space-y-6">
                  {[
                    ['Principal Amount', fmt(amount)],
                    ['Interest Rate (SI)', `${INTEREST_RATE}% p.a.`],
                    ['Total Interest', fmt(interest)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                      <span className="text-slate-400 font-medium">{label}</span>
                      <span className="font-bold text-slate-100">{value}</span>
                    </div>
                  ))}

                  <div className="pt-2">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Repayment</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {fmt(total)}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-5 border border-white/5 backdrop-blur-md mt-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-300">Monthly EMI</span>
                    </div>
                    <div className="text-4xl font-extrabold text-indigo-300 tracking-tight drop-shadow-sm">
                      {fmt(emi)}<span className="text-lg text-indigo-200/60 font-medium">/mo</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-8 bg-white text-slate-900 hover:bg-slate-100 hover:shadow-xl shadow-white/10 border-0" size="lg" onClick={handleApply} isLoading={isLoading}>
                  <span className="text-base font-bold">Submit Application</span>
                </Button>
                
                <Button variant="ghost" className="w-full mt-3 text-slate-300 hover:text-white hover:bg-white/10" size="lg" onClick={() => router.push('/dashboard')} disabled={isLoading}>
                  <span className="text-sm font-bold">Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
