import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('कृपया सर्व फील्ड भरा');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.login(formData.email, formData.password);
      
      if (response.success) {
        toast.success('यशस्वी लॉगिन!');
        router.push('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'लॉगिन अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>प्रशासक लॉगिन - आधारवाड</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-newspaper-dark via-newspaper-brown to-newspaper-dark py-12 px-4 paper-texture">
        <div className="max-w-md w-full">
          {/* Logo & Title */}
          <div className="text-center mb-8 fade-in">
            <div className="w-24 h-24 bg-white rounded-full p-3 shadow-2xl mx-auto mb-4">
              <img 
                src="/logo.jpeg" 
                alt="आधारवाड लोगो" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%238B4513"/%3E%3Ctext x="50" y="60" font-size="40" text-anchor="middle" fill="white" font-weight="bold"%3Eआ%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <h1 className="text-4xl font-black newspaper-headline text-white mb-2">
              आधारवाड
            </h1>
            <p className="text-newspaper-gold marathi-text">
              प्रशासक प्रवेश द्वार
            </p>
          </div>

          {/* Login Form */}
          <div className="newspaper-card p-8 fade-in stagger-1">
            <h2 className="text-2xl font-bold marathi-text text-newspaper-dark mb-6 text-center">
              लॉगिन करा
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold marathi-text text-newspaper-dark mb-2">
                  ईमेल
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="admin@aadharwad.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold marathi-text text-newspaper-dark mb-2">
                  पासवर्ड
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>लॉगिन होत आहे...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>लॉगिन करा</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-newspaper-beige">
              <a 
                href="/"
                className="text-center block text-sm marathi-text text-newspaper-brown hover:text-newspaper-red transition-colors"
              >
                ← मुख्यपृष्ठावर परत जा
              </a>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded fade-in stagger-2">
            <p className="text-sm marathi-text text-yellow-800">
              <span className="font-bold">लक्षात ठेवा:</span> केवळ अधिकृत प्रशासकांसाठी प्रवेश
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
