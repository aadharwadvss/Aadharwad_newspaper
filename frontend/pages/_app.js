import '../styles/globals.css';
import '../utils/i18n';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps, router }) {
  // Don't show header/footer on admin pages except login
  const isAdminPage = router.pathname.startsWith('/admin') && router.pathname !== '/login';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="आधारवाड डिजिटल वर्तमानपत्र - दररोज ताज्या बातम्या आणि ई-पेपर" />
        <meta name="keywords" content="Aadharwad, Newspaper, Marathi News, E-paper, Maharashtra News, Daily Newspaper" />
        <meta name="author" content="Aadharwad" />
        <meta property="og:title" content="आधारवाड डिजिटल वर्तमानपत्र" />
        <meta property="og:description" content="दररोज ताज्या बातम्या आणि ई-पेपरसाठी तुमचे विश्वासू साथीदार" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen bg-newspaper-cream">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Noto Sans Devanagari, sans-serif',
            },
          }}
        />
        
        {!isAdminPage && <Header />}
        
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        
        {!isAdminPage && <Footer />}
      </div>
    </>
  );
}
