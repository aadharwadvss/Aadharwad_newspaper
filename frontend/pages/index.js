import { useState, useEffect } from 'react';
import Head from 'next/head';
import PDFViewer from '../components/PDFViewer';
import LatestNewsSection from '../components/LatestNewsSection';
import { publicAPI, formatDate } from '../utils/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function Home() {
  const { t } = useTranslation();
  const [papers, setPapers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const newspaper = papers[currentIndex] || null;

  useEffect(() => {
    fetchTodaysPapers();
  }, []);

  const fetchTodaysPapers = async () => {
    try {
      setLoading(true);
      // Try to get today's papers first
      try {
        const response = await publicAPI.getToday();
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setPapers(data);
        setCurrentIndex(0);
        setError(null);
        return;
      } catch (todayErr) {
        // No papers today, fall back to latest
      }

      // Fallback: get the latest paper's date, then fetch all papers for that date
      const latestResponse = await publicAPI.getLatest();
      const latestPaper = latestResponse.data;
      
      try {
        const dateResponse = await publicAPI.getByDate(latestPaper.date);
        const data = Array.isArray(dateResponse.data) ? dateResponse.data : [dateResponse.data];
        setPapers(data);
      } catch (dateErr) {
        // Single paper fallback
        setPapers([latestPaper]);
      }
      setCurrentIndex(0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('home.noNewspaper'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < papers.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const getPublishedDate = () => {
    if (!newspaper) return '';
    const date = new Date(newspaper.date + 'T00:00:00');
    return date.toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isToday = () => {
    if (!newspaper) return false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return newspaper.date === today;
  };

  return (
    <>
      <Head>
        <title>{t('header.title')} - ताज्या बातम्या आणि वर्तमानपत्र</title>
      </Head>

      {/* Latest News Section */}
      <LatestNewsSection />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-newspaper-dark via-newspaper-brown to-newspaper-dark text-white py-12 paper-texture">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-newspaper-gold text-newspaper-dark px-6 py-2 rounded-full mb-4 font-semibold text-sm animate-pulse">
            {isToday() ? (
              <>आजचे अंक • {getPublishedDate()}</>
            ) : (
              <>ताजे अंक • {getPublishedDate()}</>
            )}
          </div>
          <h2 className="text-4xl md:text-6xl font-black newspaper-headline mb-4 tracking-wide fade-in">
            {isToday() ? 'आजचे वर्तमानपत्र' : 'ताजे वर्तमानपत्र'}
          </h2>
          <p className="text-lg md:text-xl marathi-text text-newspaper-beige max-w-2xl mx-auto fade-in stagger-1">
            दररोज ताज्या बातम्या आणि माहितीसाठी तुमचे विश्वासू साथीदार
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-newspaper-red mb-6"></div>
              <p className="text-xl marathi-text text-newspaper-dark">{t('common.loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="newspaper-card max-w-2xl mx-auto p-8 text-center">
              <svg className="w-20 h-20 text-newspaper-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold marathi-text text-newspaper-dark mb-3">
                {error}
              </h3>
              <p className="text-gray-600 marathi-text mb-6">
                कृपया नंतर पुन्हा प्रयत्न करा किंवा संग्रहालय पहा
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={fetchTodaysPapers}
                  className="btn-primary"
                >
                  पुन्हा प्रयत्न करा
                </button>
                <a href="/archive" className="btn-outline">
                  {t('header.archive')}
                </a>
              </div>
            </div>
          )}

          {newspaper && !loading && (
            <div className="max-w-6xl mx-auto fade-in">
              {/* Paper Navigation (only if multiple papers) */}
              {papers.length > 1 && (
                <div className="newspaper-card p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPrev}
                      disabled={currentIndex === 0}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold marathi-text transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-newspaper-beige hover:bg-newspaper-gold text-newspaper-dark"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>← मागील अंक</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      {papers.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-9 h-9 rounded-full font-bold text-sm transition-all ${
                            idx === currentIndex
                              ? 'bg-newspaper-red text-white shadow-lg scale-110'
                              : 'bg-newspaper-beige text-newspaper-dark hover:bg-newspaper-gold'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNext}
                      disabled={currentIndex === papers.length - 1}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold marathi-text transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-newspaper-beige hover:bg-newspaper-gold text-newspaper-dark"
                    >
                      <span>पुढील अंक →</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-center text-sm marathi-text text-gray-600 mt-2">
                    अंक {currentIndex + 1} / {papers.length} — {newspaper.originalFileName || newspaper.fileName}
                  </p>
                </div>
              )}

              {/* Newspaper Info Card */}
              <div className="newspaper-card p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold marathi-text text-newspaper-dark">
                        {formatDate(newspaper.date)}
                      </h3>
                      {papers.length > 1 && (
                        <span className="bg-newspaper-red text-white px-3 py-1 rounded-full text-xs font-bold">
                          अंक {currentIndex + 1}
                        </span>
                      )}
                      {!isToday() && (
                        <span className="bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full text-xs font-bold">
                          ताजे अंक
                        </span>
                      )}
                    </div>
                    {newspaper.originalFileName && (
                      <p className="text-sm text-gray-600 mb-2">{newspaper.originalFileName}</p>
                    )}
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
                directDownloadUrl={newspaper.directDownloadUrl}
              />

              {/* Bottom Navigation (only if multiple papers) */}
              {papers.length > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← मागील अंक
                  </button>
                  <span className="marathi-text font-semibold text-newspaper-dark">
                    {currentIndex + 1} / {papers.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex === papers.length - 1}
                    className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    पुढील अंक →
                  </button>
                </div>
              )}

              {/* Quick Links */}
              <div className="mt-8 text-center">
                <a href="/archive" className="btn-secondary inline-block">
                  मागील वर्तमानपत्रे पहा
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold newspaper-headline text-center mb-12 text-newspaper-dark">
            {t('home.features.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 fade-in">
              <div className="w-16 h-16 bg-newspaper-red rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold marathi-text mb-2">{t('home.features.daily')}</h4>
              <p className="text-gray-600 marathi-text">
                {t('home.features.dailyDesc')}
              </p>
            </div>

            <div className="text-center p-6 fade-in stagger-1">
              <div className="w-16 h-16 bg-newspaper-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold marathi-text mb-2">{t('home.features.archive')}</h4>
              <p className="text-gray-600 marathi-text">
                {t('home.features.archiveDesc')}
              </p>
            </div>

            <div className="text-center p-6 fade-in stagger-2">
              <div className="w-16 h-16 bg-newspaper-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-newspaper-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold marathi-text mb-2">{t('home.features.mobile')}</h4>
              <p className="text-gray-600 marathi-text">
                {t('home.features.mobileDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
