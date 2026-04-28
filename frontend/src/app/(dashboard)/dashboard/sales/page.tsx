'use client';

import { useEffect } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { toast } from 'react-toastify';

export default function SalesDashboard() {
  const { leads, fetchLeads, isLoading, error } = useSalesStore();

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <ProtectedRoute allowedRoles={['SALES', 'ADMIN']}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales Pipeline</h1>
          <p className="mt-2 text-slate-500 text-lg">Manage registered borrowers who haven't applied yet.</p>
        </div>

        <div className="bg-white/80 glass-panel shadow-soft rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Registered Leads</h3>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
              {leads.length} Active Leads
            </div>
          </div>

          <ul className="divide-y divide-slate-100/60">
            {isLoading ? (
              <li className="px-6 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </li>
            ) : leads.length === 0 ? (
              <li className="px-6 py-16 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No leads found</h3>
                <p className="text-slate-500">There are no registered borrowers in the pipeline.</p>
              </li>
            ) : (
              leads.map((lead) => (
                <li key={lead._id} className="p-6 transition-colors hover:bg-slate-50/80">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 mt-1">
                        {lead.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900">{lead.personalDetails?.fullName || 'Pending Details'}</p>
                        <p className="text-sm font-medium text-indigo-600 mb-1">{lead.email}</p>
                        {lead.personalDetails && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">₹{lead.personalDetails.monthlySalary.toLocaleString()} / mo</span>
                            <span>•</span>
                            <span className="capitalize">{lead.personalDetails.employmentMode.toLowerCase().replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        lead.profileStatus === 'ELIGIBLE' ? 'bg-green-50 text-green-700 border border-green-200' :
                        lead.profileStatus === 'INELIGIBLE' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {lead.profileStatus}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
