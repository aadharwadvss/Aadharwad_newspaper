import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LatestNewsSection() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_URL}/news/latest?limit=5`);
      setNews(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || news.length === 0) return null;

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold newspaper-headline text-newspaper-dark mb-8 text-center">
            {t('home.latestNews')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div 
                key={item._id} 
                className="newspaper-card cursor-pointer group"
                onClick={() => setSelectedNews(item)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.imageUrl.replace('/preview', '/view')}
                    alt={i18n.language === 'mr' ? item.title_mr : item.title_en}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold marathi-text mb-2 line-clamp-2">
                    {i18n.language === 'mr' ? item.title_mr : item.title_en}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {i18n.language === 'mr' ? item.description_mr : item.description_en}
                  </p>
                  <button className="mt-4 text-newspaper-red font-semibold text-sm">
                    {t('home.readMore')} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedNews && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={selectedNews.imageUrl.replace('/preview', '/view')}
                className="w-full h-64 object-cover"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold marathi-text mb-4">
                {i18n.language === 'mr' ? selectedNews.title_mr : selectedNews.title_en}
              </h2>
              <p className="text-gray-700 marathi-text whitespace-pre-wrap">
                {i18n.language === 'mr' ? selectedNews.description_mr : selectedNews.description_en}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
