import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mark when we're on the client side
  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const isActive = (path) => router.pathname === path;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'mr' ? 'en' : 'mr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Don't render content until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <header className="bg-newspaper-dark text-white shadow-2xl sticky top-0 z-50 border-b-4 border-newspaper-gold">
        <div className="container mx-auto px-4">
          <div className="border-b border-newspaper-brown py-2 flex justify-between items-center">
            <p className="text-xs text-newspaper-gold font-english">
              Daily Digital Edition • Est. 2026
            </p>
            <div className="text-xs bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full font-semibold">
              English
            </div>
          </div>
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 bg-white rounded-full p-2 shadow-lg">
                <img
                  src="/logo.jpeg"
                  alt="आधारवाड लोगो"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black newspaper-headline tracking-wider">
                  आधारवाड
                </h1>
                <p className="text-xs md:text-sm text-newspaper-gold marathi-text">
                  डिजिटल वर्तमानपत्र
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <div className="h-6 w-20 bg-newspaper-brown opacity-50 rounded"></div>
              <div className="h-6 w-20 bg-newspaper-brown opacity-50 rounded"></div>
              <div className="h-6 w-24 bg-newspaper-red opacity-50 rounded"></div>
            </nav>
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-newspaper-gold via-newspaper-red to-newspaper-gold"></div>
      </header>
    );
  }

  return (
    <header className="bg-newspaper-dark text-white shadow-2xl sticky top-0 z-50 border-b-4 border-newspaper-gold">
      <div className="container mx-auto px-4">
        {/* Top banner */}
        <div className="border-b border-newspaper-brown py-2 flex justify-between items-center">
          <p className="text-xs text-newspaper-gold font-english">
            Daily Digital Edition • Est. 2026
          </p>
          
         {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="text-xs bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full font-semibold hover:bg-opacity-90 transition-all"
          >
            {i18n.language === 'mr' ? 'English' : 'मराठी'}
          </button>
        </div> 

        

        {/* Main header */}
        <div className="py-4 flex items-center justify-between">
          {/* Logo and title */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative w-16 h-16 bg-white rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-transform">
              <img
                src="/logo.jpeg"
                alt="आधारवाड लोगो"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%238B4513"/%3E%3Ctext x="50" y="60" font-size="40" text-anchor="middle" fill="white" font-weight="bold"%3Eआ%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black newspaper-headline tracking-wider">
                आधारवाड
              </h1>
              <p className="text-xs md:text-sm text-newspaper-gold marathi-text">
                डिजिटल वर्तमानपत्र
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`marathi-text font-semibold transition-all duration-300 ${isActive('/')
                  ? 'text-newspaper-gold border-b-2 border-newspaper-gold'
                  : 'hover:text-newspaper-gold'
                }`}
            >
              {t('header.home')}
            </Link>
            <Link
              href="/archive"
              className={`marathi-text font-semibold transition-all duration-300 ${isActive('/archive')
                  ? 'text-newspaper-gold border-b-2 border-newspaper-gold'
                  : 'hover:text-newspaper-gold'
                }`}
            >
              {t('header.archive')}
            </Link>
            <Link
              href="/login"
              className="bg-newspaper-red px-4 py-2 rounded-lg marathi-text font-semibold hover:bg-opacity-90 transition-all duration-300"
            >
              {t('header.adminLogin')}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-newspaper-brown">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                className={`marathi-text font-semibold py-2 px-4 rounded ${isActive('/') ? 'bg-newspaper-red' : 'hover:bg-newspaper-brown'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.home')}
              </Link>
              <Link
                href="/archive"
                className={`marathi-text font-semibold py-2 px-4 rounded ${isActive('/archive') ? 'bg-newspaper-red' : 'hover:bg-newspaper-brown'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.archive')}
              </Link>
              <Link
                href="/login"
                className="marathi-text font-semibold py-2 px-4 bg-newspaper-red rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.adminLogin')}
              </Link>
            </div>
          </nav>
        )}
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-newspaper-gold via-newspaper-red to-newspaper-gold"></div>
    </header>
  );
}