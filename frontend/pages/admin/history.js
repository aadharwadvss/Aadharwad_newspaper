import { useState, useEffect, useMemo } from 'react';
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
    limit: 50,
    total: 0,
    pages: 0
  });

  // Group papers by date for the grouped view
  const groupedByDate = useMemo(() => {
    const groups = {};
    newspapers.forEach(paper => {
      if (!groups[paper.date]) groups[paper.date] = [];
      groups[paper.date].push(paper);
    });
    return groups;
  }, [newspapers]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  }, [groupedByDate]);

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
        fetchHistory();
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
            {/* Grouped by Date View */}
            <div className="space-y-6">
              {sortedDates.map(date => {
                const papersForDate = groupedByDate[date];
                return (
                  <div key={date} className="newspaper-card overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-gradient-to-r from-newspaper-dark to-newspaper-brown text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-bold marathi-text">
                          {formatDate(date)}
                        </h3>
                      </div>
                      <span className="bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full text-sm font-bold">
                        {papersForDate.length} {papersForDate.length === 1 ? 'अंक' : 'अंक'}
                      </span>
                    </div>

                    {/* Papers List */}
                    <div className="divide-y divide-newspaper-beige">
                      {papersForDate.map((paper, idx) => (
                        <div key={paper._id} className="px-6 py-4 hover:bg-newspaper-cream transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Index Badge */}
                              <span className="w-8 h-8 bg-newspaper-red text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-newspaper-dark">
                                  {paper.originalFileName || paper.fileName}
                                </p>
                                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                                  <span className="bg-newspaper-beige px-2 py-0.5 rounded text-xs font-semibold">
                                    {paper.fileType.toUpperCase()}
                                  </span>
                                  <span>{(paper.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                  <span>
                                    अपलोड: {new Date(paper.uploadedAt).toLocaleTimeString('mr-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                              <a
                                href={paper.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-sm font-semibold text-newspaper-brown hover:text-newspaper-red transition-colors px-3 py-1 rounded-lg hover:bg-newspaper-beige"
                                title="पहा"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="hidden sm:inline">पहा</span>
                              </a>
                              <button
                                onClick={() => handleDelete(paper._id)}
                                disabled={deleteId === paper._id}
                                className="flex items-center space-x-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 px-3 py-1 rounded-lg hover:bg-red-50"
                                title="हटवा"
                              >
                                {deleteId === paper._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="hidden sm:inline">हटवा</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              एकूण {pagination.total} वर्तमानपत्रे • {sortedDates.length} तारखा
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
