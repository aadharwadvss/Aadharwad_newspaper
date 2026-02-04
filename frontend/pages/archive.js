import { useState, useEffect } from 'react';
import Head from 'next/head';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PDFViewer from '../components/PDFViewer';
import { publicAPI, formatDate } from '../utils/api';
import toast from 'react-hot-toast';

export default function Archive() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newspaper, setNewspaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allNewspapers, setAllNewspapers] = useState([]);
  const [availableDates, setAvailableDates] = useState(new Set());

  useEffect(() => {
    fetchAllNewspapers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchNewspaperByDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchAllNewspapers = async () => {
    try {
      const response = await publicAPI.getAll(1, 100);
      setAllNewspapers(response.data);
      
      // Create set of available dates
      const dates = new Set(response.data.map(n => n.date));
      setAvailableDates(dates);
    } catch (err) {
      console.error('Fetch all error:', err);
    }
  };

  const fetchNewspaperByDate = async (date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const response = await publicAPI.getByDate(dateStr);
      setNewspaper(response.data);
      toast.success('वर्तमानपत्र लोड झाले');
    } catch (err) {
      setNewspaper(null);
      toast.error(err.response?.data?.message || 'वर्तमानपत्र उपलब्ध नाही');
    } finally {
      setLoading(false);
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    if (availableDates.has(dateStr)) {
      return 'has-newspaper';
    }
    return null;
  };

  const tileDisabled = ({ date }) => {
    return date > new Date(); // Disable future dates
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
                `}</style>

                <div className="mt-6 p-4 bg-newspaper-beige rounded-lg">
                  <p className="text-sm marathi-text text-newspaper-dark">
                    <span className="font-bold">निवडलेली तारीख:</span><br />
                    {formatDate(selectedDate.toISOString().split('T')[0])}
                  </p>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs marathi-text text-green-800">
                    🟢 लाल तारखांना वर्तमानपत्र उपलब्ध आहे
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

              {!loading && newspaper && (
                <div className="fade-in">
                  {/* Info Card */}
                  <div className="newspaper-card p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-2xl font-bold marathi-text text-newspaper-dark mb-2">
                          {formatDate(newspaper.date)}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="bg-newspaper-beige px-3 py-1 rounded-full marathi-text">
                            {newspaper.fileType.toUpperCase()}
                          </span>
                          <span className="bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full font-semibold">
                            {(newspaper.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <a
                        href={`https://drive.google.com/file/d/${newspaper.driveFileId}/view`}
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
                    url={newspaper.previewUrl} 
                    fileName={newspaper.fileName}
                  />
                </div>
              )}

              {!loading && !newspaper && (
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
                  onClick={() => setSelectedDate(new Date(item.date))}
                >
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <svg className="w-16 h-16 text-newspaper-red mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold marathi-text text-center mb-2">
                      {new Date(item.date).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-gray-600 text-center marathi-text">
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
