import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI, formatDate } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminHistory() {
  const [newspapers, setNewspapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchHistory();
  }, [pagination.page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getHistory(pagination.page, pagination.limit);
      setNewspapers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      toast.error('इतिहास लोड करता आला नाही');
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('तुम्हाला खात्री आहे की तुम्ही हे वर्तमानपत्र हटवू इच्छिता?')) {
      return;
    }

    try {
      setDeleteId(id);
      const response = await adminAPI.deleteNewspaper(id);
      if (response.success) {
        toast.success(response.message);
        fetchHistory(); // Refresh list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटवता आले नाही');
    } finally {
      setDeleteId(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <AdminLayout>
      <Head>
        <title>इतिहास - आधारवाड प्रशासन</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold newspaper-headline text-newspaper-dark">
            अपलोड इतिहास
          </h2>
          <button
            onClick={fetchHistory}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>रिफ्रेश करा</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-newspaper-red"></div>
          </div>
        ) : newspapers.length === 0 ? (
          <div className="newspaper-card p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold marathi-text text-newspaper-dark mb-2">
              कोणतेही वर्तमानपत्र नाही
            </h3>
            <p className="text-gray-600 marathi-text mb-6">
              पहिले वर्तमानपत्र अपलोड करण्यासाठी अपलोड पृष्ठावर जा
            </p>
            <a href="/admin/upload" className="btn-primary inline-block">
              अपलोड करा
            </a>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="newspaper-card overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-newspaper-beige">
                    <tr>
                      <th className="text-left py-4 px-6 marathi-text font-bold">#</th>
                      <th className="text-left py-4 px-6 marathi-text font-bold">तारीख</th>
                      <th className="text-left py-4 px-6 marathi-text font-bold">फाईल नाव</th>
                      <th className="text-left py-4 px-6 marathi-text font-bold">प्रकार</th>
                      <th className="text-left py-4 px-6 marathi-text font-bold">साइझ</th>
                      <th className="text-left py-4 px-6 marathi-text font-bold">अपलोड केले</th>
                      <th className="text-center py-4 px-6 marathi-text font-bold">क्रिया</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newspapers.map((newspaper, index) => (
                      <tr 
                        key={newspaper._id} 
                        className="border-b border-newspaper-beige hover:bg-newspaper-cream transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="py-4 px-6 marathi-text font-semibold">
                          {new Date(newspaper.date).toLocaleDateString('mr-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {newspaper.fileName}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-newspaper-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {newspaper.fileType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {(newspaper.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(newspaper.uploadedAt).toLocaleDateString('mr-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center space-x-3">
                            <a
                              href={newspaper.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-newspaper-brown hover:text-newspaper-red transition-colors"
                              title="पहा"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                            <button
                              onClick={() => handleDelete(newspaper._id)}
                              disabled={deleteId === newspaper._id}
                              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                              title="हटवा"
                            >
                              {deleteId === newspaper._id ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                              ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {newspapers.map((newspaper, index) => (
                <div key={newspaper._id} className="newspaper-card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold marathi-text text-lg">
                        {new Date(newspaper.date).toLocaleDateString('mr-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {newspaper.fileName}
                      </p>
                    </div>
                    <span className="bg-newspaper-red text-white px-2 py-1 rounded text-xs font-semibold">
                      {newspaper.fileType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {(newspaper.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex space-x-3">
                      <a
                        href={newspaper.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-newspaper-brown"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(newspaper._id)}
                        disabled={deleteId === newspaper._id}
                        className="text-red-600"
                      >
                        {deleteId === newspaper._id ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← मागील
                </button>
                <span className="marathi-text font-semibold">
                  पृष्ठ {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  पुढील →
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 text-center marathi-text text-gray-600">
              एकूण {pagination.total} वर्तमानपत्रे
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
