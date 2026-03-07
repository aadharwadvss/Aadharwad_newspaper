import { useState, useEffect } from 'react';
import Head from 'next/head';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PDFViewer from '../components/PDFViewer';
import { publicAPI, formatDate } from '../utils/api';
import toast from 'react-hot-toast';

export default function Archive() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newspapers, setNewspapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allNewspapers, setAllNewspapers] = useState([]);
  const [dateCounts, setDateCounts] = useState({});

  useEffect(() => {
    fetchAllNewspapers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchNewspapersByDate(selectedDate);
    }
  }, [selectedDate]);

  const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const fetchAllNewspapers = async () => {
    try {
      const response = await publicAPI.getAll(1, 500);
      setAllNewspapers(response.data);
      
      // Count papers per date
      const counts = {};
      response.data.forEach(n => {
        counts[n.date] = (counts[n.date] || 0) + 1;
      });
      setDateCounts(counts);
    } catch (err) {
      console.error('Fetch all error:', err);
    }
  };

  const fetchNewspapersByDate = async (date) => {
    try {
      setLoading(true);
      const dateStr = toLocalDateStr(date);
      const response = await publicAPI.getByDate(dateStr);
      setNewspapers(response.data); // Array of papers
      setSelectedPaper(response.data[0]); // Auto-select the first one
      toast.success('वर्तमानपत्रे लोड झाली');
    } catch (err) {
      setNewspapers([]);
      setSelectedPaper(null);
      toast.error(err.response?.data?.message || 'वर्तमानपत्र उपलब्ध नाही');
    } finally {
      setLoading(false);
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = toLocalDateStr(date);
    const count = dateCounts[dateStr] || 0;
    if (count > 1) return 'has-newspaper has-multiple';
    if (count === 1) return 'has-newspaper';
    return null;
  };

  const tileDisabled = ({ date }) => {
    return date > new Date(); // Disable future dates
  };

  const tileContent = ({ date }) => {
    const dateStr = toLocalDateStr(date);
    const count = dateCounts[dateStr] || 0;
    if (count > 1) {
      return <span className="paper-count-badge">{count}</span>;
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>संग्रहालय - आधारवाड</title>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-newspaper-brown via-newspaper-dark to-newspaper-brown text-white py-12 paper-texture">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black newspaper-headline mb-4 tracking-wide fade-in">
            वर्तमानपत्र संग्रहालय
          </h2>
          <p className="text-lg md:text-xl marathi-text text-newspaper-beige max-w-2xl mx-auto fade-in stagger-1">
            मागील सर्व अंक तारखेनुसार शोधा आणि वाचा
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Calendar */}
            <div className="lg:col-span-1">
              <div className="newspaper-card p-6 sticky top-24">
                <h3 className="text-2xl font-bold marathi-text mb-4 text-newspaper-dark">
                  तारीख निवडा
                </h3>
                
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  tileContent={tileContent}
                  locale="mr-IN"
                  className="mb-6"
                />

                <style jsx global>{`
                  .has-newspaper {
                    background-color: #C41E3A !important;
                    color: white !important;
                    font-weight: bold;
                  }
                  .has-newspaper:hover {
                    background-color: #8B4513 !important;
                  }
                  .has-multiple {
                    background-color: #9B2335 !important;
                    position: relative;
                  }
                  .paper-count-badge {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: #FFD700;
                    color: #1a1a1a;
                    font-size: 9px;
                    font-weight: bold;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                  }
                `}</style>

                <div className="mt-6 p-4 bg-newspaper-beige rounded-lg">
                  <p className="text-sm marathi-text text-newspaper-dark">
                    <span className="font-bold">निवडलेली तारीख:</span><br />
                    {formatDate(toLocalDateStr(selectedDate))}
                  </p>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs marathi-text text-green-800">
                    🟢 लाल तारखांना वर्तमानपत्र उपलब्ध आहे<br />
                    🟡 सोनेरी बॅज = एकापेक्षा जास्त अंक
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content - Newspaper Viewer */}
            <div className="lg:col-span-2">
              {loading && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-newspaper-red mb-6"></div>
                  <p className="text-xl marathi-text text-newspaper-dark">लोड होत आहे...</p>
                </div>
              )}

              {!loading && newspapers.length > 0 && (
                <div className="fade-in">
                  {/* Papers List for This Day */}
                  <div className="newspaper-card p-6 mb-8">
                    <h3 className="text-xl font-bold marathi-text text-newspaper-dark mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-newspaper-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      या दिवसाची वर्तमानपत्रे ({newspapers.length})
                    </h3>
                    <div className="space-y-3">
                      {newspapers.map((paper, idx) => (
                        <div
                          key={paper._id}
                          onClick={() => setSelectedPaper(paper)}
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                            selectedPaper?._id === paper._id
                              ? 'bg-newspaper-red text-white shadow-lg'
                              : 'bg-newspaper-beige hover:bg-newspaper-gold'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              selectedPaper?._id === paper._id ? 'bg-white text-newspaper-red' : 'bg-newspaper-brown text-white'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-sm">
                                {paper.originalFileName || paper.fileName}
                              </p>
                              <p className={`text-xs ${selectedPaper?._id === paper._id ? 'text-red-200' : 'text-gray-600'}`}>
                                {new Date(paper.uploadedAt).toLocaleTimeString('mr-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} • {paper.fileType.toUpperCase()} • {(paper.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <a
                            href={`https://drive.google.com/file/d/${paper.driveFileId}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                              selectedPaper?._id === paper._id
                                ? 'bg-white text-newspaper-red hover:bg-red-100'
                                : 'bg-newspaper-brown text-white hover:bg-newspaper-dark'
                            }`}
                          >
                            उघडा ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Paper Viewer */}
                  {selectedPaper && (
                    <>
                      <div className="newspaper-card p-6 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h3 className="text-2xl font-bold marathi-text text-newspaper-dark mb-2">
                              {formatDate(selectedPaper.date)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {selectedPaper.originalFileName || selectedPaper.fileName}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="bg-newspaper-beige px-3 py-1 rounded-full marathi-text">
                                {selectedPaper.fileType.toUpperCase()}
                              </span>
                              <span className="bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full font-semibold">
                                {(selectedPaper.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <a
                            href={`https://drive.google.com/file/d/${selectedPaper.driveFileId}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>नवीन टॅबमध्ये उघडा</span>
                          </a>
                        </div>
                      </div>

                      {/* PDF Viewer */}
                      <PDFViewer 
                        url={selectedPaper.previewUrl} 
                        fileName={selectedPaper.fileName}
                      />
                    </>
                  )}
                </div>
              )}

              {!loading && newspapers.length === 0 && (
                <div className="newspaper-card p-8 text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold marathi-text text-newspaper-dark mb-3">
                    या तारखेसाठी वर्तमानपत्र उपलब्ध नाही
                  </h3>
                  <p className="text-gray-600 marathi-text">
                    कृपया कॅलेंडरमधून दुसरी तारीख निवडा
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Newspapers List */}
          <div className="mt-12">
            <h3 className="text-3xl font-bold newspaper-headline mb-6 text-newspaper-dark">
              अलीकडील अंक
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allNewspapers.slice(0, 8).map((item) => (
                <div 
                  key={item._id}
                  className="newspaper-card cursor-pointer"
                  onClick={() => setSelectedDate(new Date(item.date + 'T00:00:00'))}
                >
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <svg className="w-16 h-16 text-newspaper-red mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold marathi-text text-center mb-2">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-gray-600 text-center marathi-text">
                      {item.originalFileName || item.fileName}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {item.fileType.toUpperCase()} • {(item.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
