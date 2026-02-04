import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    try {
      const response = await adminAPI.verify();
      if (response.success) {
        setAdmin(response.admin);
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminAPI.logout();
    toast.success('लॉगआउट यशस्वी');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-newspaper-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-newspaper-red mx-auto mb-4"></div>
          <p className="marathi-text text-newspaper-dark">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-newspaper-cream">
      {/* Top Navigation */}
      <nav className="bg-newspaper-dark text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold newspaper-headline">
                आधारवाड प्रशासन पॅनल
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm marathi-text text-newspaper-gold">{admin?.name}</p>
                <p className="text-xs text-gray-400">{admin?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-newspaper-red px-4 py-2 rounded-lg marathi-text text-sm font-semibold hover:bg-opacity-90 transition-all"
              >
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-xl transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-[72px] lg:mt-0
        `}>
          <div className="p-6 space-y-2">
            <Link
              href="/admin/dashboard"
              className={`block px-4 py-3 rounded-lg marathi-text font-semibold transition-all ${
                isActive('/admin/dashboard')
                  ? 'bg-newspaper-red text-white'
                  : 'hover:bg-newspaper-beige text-newspaper-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{t('admin.dashboard')}</span>
              </div>
            </Link>

            <Link
              href="/admin/upload"
              className={`block px-4 py-3 rounded-lg marathi-text font-semibold transition-all ${
                isActive('/admin/upload')
                  ? 'bg-newspaper-red text-white'
                  : 'hover:bg-newspaper-beige text-newspaper-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{t('admin.upload')}</span>
              </div>
            </Link>

            <Link
              href="/admin/news"
              className={`block px-4 py-3 rounded-lg marathi-text font-semibold transition-all ${
                isActive('/admin/news')
                  ? 'bg-newspaper-red text-white'
                  : 'hover:bg-newspaper-beige text-newspaper-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>{t('admin.manageNews')}</span>
              </div>
            </Link>

            <Link
              href="/admin/history"
              className={`block px-4 py-3 rounded-lg marathi-text font-semibold transition-all ${
                isActive('/admin/history')
                  ? 'bg-newspaper-red text-white'
                  : 'hover:bg-newspaper-beige text-newspaper-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('admin.history')}</span>
              </div>
            </Link>

            <hr className="my-4 border-newspaper-beige" />

            <Link
              href="/"
              className="block px-4 py-3 rounded-lg marathi-text font-semibold hover:bg-newspaper-beige text-newspaper-dark transition-all"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>{t('admin.viewSite')}</span>
              </div>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
