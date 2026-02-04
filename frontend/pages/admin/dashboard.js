import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { publicAPI } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    today: null
  });
  const [recentNewspapers, setRecentNewspapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all newspapers
      const allResponse = await publicAPI.getAll(1, 100);
      const allNewspapers = allResponse.data;
      
      // Get current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate stats
      const monthResponse = await publicAPI.getByMonth(currentMonth);
      
      // Check today's newspaper
      try {
        const todayResponse = await publicAPI.getToday();
        setStats({
          total: allNewspapers.length,
          thisMonth: monthResponse.count,
          today: todayResponse.data
        });
      } catch (err) {
        setStats({
          total: allNewspapers.length,
          thisMonth: monthResponse.count,
          today: null
        });
      }
      
      setRecentNewspapers(allNewspapers.slice(0, 5));
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>डॅशबोर्ड - आधारवाड प्रशासन</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold newspaper-headline text-newspaper-dark mb-8">
          डॅशबोर्ड
        </h2>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-newspaper-red"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Newspapers */}
              <div className="newspaper-card p-6 border-l-4 border-newspaper-red">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm marathi-text text-gray-600 mb-1">एकूण वर्तमानपत्रे</p>
                    <p className="text-4xl font-bold text-newspaper-dark">{stats.total}</p>
                  </div>
                  <div className="w-16 h-16 bg-newspaper-red bg-opacity-10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-newspaper-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="newspaper-card p-6 border-l-4 border-newspaper-brown">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm marathi-text text-gray-600 mb-1">या महिन्यात</p>
                    <p className="text-4xl font-bold text-newspaper-dark">{stats.thisMonth}</p>
                  </div>
                  <div className="w-16 h-16 bg-newspaper-brown bg-opacity-10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-newspaper-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Today's Status */}
              <div className={`newspaper-card p-6 border-l-4 ${stats.today ? 'border-green-500' : 'border-yellow-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm marathi-text text-gray-600 mb-1">आजचा स्टेटस</p>
                    <p className="text-xl font-bold marathi-text text-newspaper-dark">
                      {stats.today ? 'अपलोड झाले ✓' : 'प्रलंबित'}
                    </p>
                  </div>
                  <div className={`w-16 h-16 ${stats.today ? 'bg-green-500' : 'bg-yellow-500'} bg-opacity-10 rounded-full flex items-center justify-center`}>
                    {stats.today ? (
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="newspaper-card p-6 mb-8">
              <h3 className="text-xl font-bold marathi-text text-newspaper-dark mb-4">
                द्रुत क्रिया
              </h3>
              <div className="flex flex-wrap gap-4">
                <a href="/admin/upload" className="btn-primary">
                  नवीन अपलोड करा
                </a>
                <a href="/admin/history" className="btn-secondary">
                  इतिहास पहा
                </a>
                <a href="/" target="_blank" className="btn-outline">
                  मुख्यपृष्ठ पहा
                </a>
              </div>
            </div>

            {/* Recent Newspapers */}
            <div className="newspaper-card p-6">
              <h3 className="text-xl font-bold marathi-text text-newspaper-dark mb-4">
                अलीकडील अपलोड्स
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-newspaper-beige">
                      <th className="text-left py-3 px-4 marathi-text font-semibold">तारीख</th>
                      <th className="text-left py-3 px-4 marathi-text font-semibold">फाईल प्रकार</th>
                      <th className="text-left py-3 px-4 marathi-text font-semibold">साइज</th>
                      <th className="text-left py-3 px-4 marathi-text font-semibold">अपलोड केले</th>
                      <th className="text-left py-3 px-4 marathi-text font-semibold">क्रिया</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentNewspapers.map((newspaper) => (
                      <tr key={newspaper._id} className="border-b border-newspaper-beige hover:bg-newspaper-beige transition-colors">
                        <td className="py-3 px-4 marathi-text">
                          {new Date(newspaper.date).toLocaleDateString('mr-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-newspaper-red text-white px-2 py-1 rounded text-xs font-semibold">
                            {newspaper.fileType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {(newspaper.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(newspaper.uploadedAt).toLocaleDateString('mr-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={newspaper.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-newspaper-red hover:text-newspaper-brown transition-colors marathi-text text-sm font-semibold"
                          >
                            पहा →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
