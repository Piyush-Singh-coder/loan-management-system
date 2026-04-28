'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useBorrowerStore } from '@/store/useBorrowerStore';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function UploadSlipPage() {
  const router = useRouter();
  const { uploadSalarySlip, isLoading } = useBorrowerStore();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file first.'); return; }
    try {
      await uploadSalarySlip(file);
      toast.success('Salary slip uploaded!');
      router.push('/apply/config');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BORROWER']}>
      <div className="mx-auto max-w-2xl px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Step 2: Upload Salary Slip</h1>
          <p className="mt-3 text-slate-500 text-lg">We need this to verify your income details.</p>
        </div>

        <div className="bg-white/80 glass-panel p-8 shadow-elevated rounded-3xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-12 transition-all hover:bg-indigo-50 hover:border-indigo-300 group">
            <input id="file-upload" type="file" className="hidden"
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <label htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                  Browse Files
                </label>
                <p className="mt-3 text-xs font-medium text-slate-500">PDF, JPG, or PNG up to 5MB</p>
              </div>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate flex-1 text-left">{file.name}</p>
                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-slate-100">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/dashboard')} disabled={isLoading}>
              Cancel
            </Button>
            <Button size="lg" className="w-full sm:w-auto min-w-[200px]" onClick={handleUpload} isLoading={isLoading} disabled={!file}>
              Upload & Continue →
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
