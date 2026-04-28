'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useBorrowerStore } from '@/store/useBorrowerStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const detailsSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  dob: z.string().min(1, 'Date of birth is required'),
  monthlySalary: z.number().min(1, 'Salary must be greater than 0'),
  employmentMode: z.enum(['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED']),
});
type DetailsFormValues = z.infer<typeof detailsSchema>;

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { submitPersonalDetails, isLoading, breResult } = useBorrowerStore();

  const { register, handleSubmit, formState: { errors } } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
  });

  const onSubmit = async (data: DetailsFormValues) => {
    try {
      const result = await submitPersonalDetails(data);
      if (result.eligible) {
        toast.success('Great! You are eligible to proceed.');
        router.push('/apply/upload');
      } else {
        toast.error(`Not eligible: ${result.reason}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BORROWER']}>
      <div className="mx-auto max-w-2xl px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Step 1: Personal Details</h1>
          <p className="mt-3 text-slate-500 text-lg">We'll check your eligibility based on these details.</p>
        </div>

        {/* BRE rejection banner */}
        {breResult && !breResult.eligible && (
          <div className="mb-8 rounded-2xl bg-red-50 p-5 border border-red-200/60 shadow-sm flex gap-4 items-start animate-in slide-in-from-top-2">
            <div className="bg-red-100 text-red-600 p-2 rounded-full shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-red-800">Application Not Eligible</h3>
              <p className="mt-1 text-sm text-red-700/90 leading-relaxed">{breResult.reason}</p>
            </div>
          </div>
        )}

        <div className="bg-white/80 glass-panel p-8 shadow-elevated rounded-3xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 relative z-10">
            <div className="space-y-6">
              <Input label="Full Name" placeholder="As per PAN card"
                {...register('fullName')} error={errors.fullName?.message} />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input label="PAN Number" placeholder="ABCDE1234F" className="uppercase"
                  {...register('pan')} error={errors.pan?.message} />
                <Input label="Date of Birth" type="date"
                  {...register('dob')} error={errors.dob?.message} />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input label="Monthly Salary (₹)" type="number" placeholder="e.g. 50000"
                  {...register('monthlySalary', { valueAsNumber: true })}
                  error={errors.monthlySalary?.message} />

                <div className="w-full">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Employment Mode
                  </label>
                  <select
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
                    {...register('employmentMode')}
                  >
                    <option value="">Select mode</option>
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="UNEMPLOYED">Unemployed</option>
                  </select>
                  {errors.employmentMode && (
                    <p className="mt-1.5 text-sm font-medium text-red-500">{errors.employmentMode.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px]" isLoading={isLoading}>
                Check Eligibility <span className="ml-2">→</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
