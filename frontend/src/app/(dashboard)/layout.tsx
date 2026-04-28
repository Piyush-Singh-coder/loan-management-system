'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Banknote,
  LogOut,
  Wallet
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BORROWER', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION'] },
  { name: 'Sales (Leads)', href: '/dashboard/sales', icon: Users, roles: ['ADMIN', 'SALES'] },
  { name: 'Sanction', href: '/dashboard/sanction', icon: CheckSquare, roles: ['ADMIN', 'SANCTION'] },
  { name: 'Disbursement', href: '/dashboard/disbursement', icon: Banknote, roles: ['ADMIN', 'DISBURSEMENT'] },
  { name: 'Collection', href: '/dashboard/collection', icon: Wallet, roles: ['ADMIN', 'COLLECTION'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = user ? ALL_NAV_ITEMS.filter(item => item.roles.includes(user.role)) : [];

  return (
    <ProtectedRoute>
      {user && (
        <div className="flex h-screen bg-slate-50 bg-grid-pattern">
        {/* Sidebar */}
        <div className="w-72 bg-white/80 glass-panel border-r border-slate-200/60 flex-col hidden md:flex m-4 rounded-3xl shadow-soft z-10 overflow-hidden">
          <div className="h-20 flex items-center px-8 border-b border-slate-100 bg-white/50">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 mr-3">
              <span className="text-white font-bold text-lg leading-none">L</span>
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 tracking-tight">LMS Portal</span>
          </div>
          
          <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
            <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-5 border-t border-slate-100 bg-white/50">
            <div className="flex items-center mb-5 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                <p className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-0.5">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
