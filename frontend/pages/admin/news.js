import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminNews() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title_mr: '',
    title_en: '',
    description_mr: '',
    description_en: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('adminToken');
      const response = await axios.get(`${API_URL}/admin/news/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNews(response.data.data);
    } catch (err) {
      toast.error('Failed to load news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG images allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setFormData({ ...formData, image: file });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title_mr || !formData.title_en || !formData.description_mr || !formData.description_en) {
      toast.error('Please fill all fields in both languages');
      return;
    }

    if (!editingNews && !formData.image) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploading(true);
      const token = Cookies.get('adminToken');
      
      const data = new FormData();
      data.append('title_mr', formData.title_mr);
      data.append('title_en', formData.title_en);
      data.append('description_mr', formData.description_mr);
      data.append('description_en', formData.description_en);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingNews) {
        await axios.put(`${API_URL}/admin/news/${editingNews._id}`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/news/create`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Published successfully');
      }

      resetForm();
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title_mr: item.title_mr,
      title_en: item.title_en,
      description_mr: item.description_mr,
      description_en: item.description_en,
      image: null
    });
    setImagePreview(item.imageUrl.replace('/preview', '/view'));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      const token = Cookies.get('adminToken');
      await axios.delete(`${API_URL}/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('News deleted successfully');
      fetchNews();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      title_mr: '',
      title_en: '',
      description_mr: '',
      description_en: '',
      image: null
    });
    setImagePreview(null);
    setEditingNews(null);
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <Head>
        <title>{t('admin.manageNews')} - आधारवाड</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold newspaper-headline text-newspaper-dark">
            {t('admin.manageNews')}
          </h2>
          <button
            onClick={() => { setShowForm(!showForm); if(showForm) resetForm(); }}
            className="btn-primary"
          >
            {showForm ? t('common.cancel') : t('admin.news.addNew')}
          </button>
        </div>

        {showForm && (
          <div className="newspaper-card p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 marathi-text">
              {editingNews ? t('admin.news.edit') : t('admin.news.addNew')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 marathi-text">
                    {t('admin.news.titleMr')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_mr}
                    onChange={(e) => setFormData({ ...formData, title_mr: e.target.value })}
                    className="input-field"
                    placeholder="शीर्षक मराठी मध्ये"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {t('admin.news.titleEn')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="input-field"
                    placeholder="Title in English"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 marathi-text">
                  {t('admin.news.descMr')} *
                </label>
                <textarea
                  value={formData.description_mr}
                  onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                  className="input-field min-h-[150px]"
                  placeholder="संपूर्ण वर्णन मराठी मध्ये..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  {t('admin.news.descEn')} *
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="input-field min-h-[150px]"
                  placeholder="Full description in English..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  {t('admin.news.image')} {!editingNews && '*'}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 10MB • JPG, JPEG, PNG only
                </p>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2 marathi-text">{t('admin.news.preview')}:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-md h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary disabled:opacity-50 flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <span>{editingNews ? t('common.save') : t('admin.news.publish')}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="newspaper-card p-6">
          <h3 className="text-xl font-bold mb-4 marathi-text">{t('admin.news.allNews')}</h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-newspaper-red mx-auto mb-4"></div>
              <p className="marathi-text">{t('common.loading')}</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-500 marathi-text">{t('admin.news.noNews')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={item.imageUrl.replace('/preview', '/view')}
                    alt={i18n.language === 'mr' ? item.title_mr : item.title_en}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold mb-2 line-clamp-2 marathi-text text-lg">
                      {i18n.language === 'mr' ? item.title_mr : item.title_en}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 marathi-text mb-4">
                      {i18n.language === 'mr' ? item.description_mr : item.description_en}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
