import { useState } from 'react';

export default function PDFViewer({ url, fileName }) {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="pdf-container w-full h-[600px] md:h-[800px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-newspaper-red mx-auto mb-4"></div>
            <p className="marathi-text text-newspaper-dark">लोड होत आहे...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={url}
        className="w-full h-full border-0"
        title={fileName || 'Newspaper'}
        onLoad={handleLoad}
        allow="autoplay"
      />
      
      {/* Download button */}
      <a
        href={url.replace('/preview', '/view')}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 bg-newspaper-red text-white px-4 py-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all marathi-text text-sm font-semibold flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>डाउनलोड करा</span>
      </a>
    </div>
  );
}
