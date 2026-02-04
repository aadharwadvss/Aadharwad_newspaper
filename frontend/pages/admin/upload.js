import { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUpload() {
  const [formData, setFormData] = useState({
    file: null,
    date: new Date().toISOString().split('T')[0]
  });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('फक्त PDF, JPG, JPEG, PNG फाईल्स स्वीकारल्या जातात');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('फाईल साइझ 50MB पेक्षा कमी असावी');
      return;
    }

    setFormData({ ...formData, file });

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error('कृपया फाईल निवडा');
      return;
    }

    if (!formData.date) {
      toast.error('कृपया तारीख निवडा');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await adminAPI.uploadNewspaper(
        formData.file,
        formData.date,
        (progress) => setUploadProgress(progress)
      );

      if (response.success) {
        toast.success(response.message);
        // Reset form
        setFormData({
          file: null,
          date: new Date().toISOString().split('T')[0]
        });
        setPreview(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'अपलोड अयशस्वी');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>अपलोड - आधारवाड प्रशासन</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold newspaper-headline text-newspaper-dark mb-8">
          नवीन वर्तमानपत्र अपलोड करा
        </h2>

        <div className="newspaper-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Picker */}
            <div>
              <label className="block text-lg font-semibold marathi-text text-newspaper-dark mb-3">
                तारीख निवडा
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="input-field text-lg"
                required
              />
              <p className="text-sm text-gray-600 marathi-text mt-2">
                या तारखेसाठी वर्तमानपत्र अपलोड केले जाईल
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-lg font-semibold marathi-text text-newspaper-dark mb-3">
                फाईल निवडा
              </label>
              <div className="border-4 border-dashed border-newspaper-beige rounded-lg p-8 text-center hover:border-newspaper-brown transition-colors">
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer block"
                >
                  <svg className="w-16 h-16 text-newspaper-brown mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg marathi-text text-newspaper-dark font-semibold mb-2">
                    {formData.file ? formData.file.name : 'फाईल निवडण्यासाठी क्लिक करा'}
                  </p>
                  <p className="text-sm text-gray-600 marathi-text">
                    PDF, JPG, JPEG, PNG (Max 50MB)
                  </p>
                </label>
              </div>

              {formData.file && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold marathi-text text-green-800">
                        {formData.file.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, file: null });
                        setPreview(null);
                        document.getElementById('fileInput').value = '';
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-semibold marathi-text mb-2">पूर्वावलोकन:</p>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded-lg shadow-lg max-h-96 mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="mb-2 flex justify-between text-sm marathi-text">
                  <span>अपलोड होत आहे...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-newspaper-beige rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-newspaper-red h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading || !formData.file}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>अपलोड होत आहे...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>अपलोड करा</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    file: null,
                    date: new Date().toISOString().split('T')[0]
                  });
                  setPreview(null);
                  document.getElementById('fileInput').value = '';
                }}
                className="btn-outline"
                disabled={uploading}
              >
                रीसेट करा
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h4 className="font-bold marathi-text text-blue-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              महत्त्वाच्या सूचना:
            </h4>
            <ul className="space-y-2 text-sm marathi-text text-blue-700">
              <li>• फक्त PDF, JPG, JPEG, PNG फाईल्स स्वीकारल्या जातात</li>
              <li>• फाईल साइझ 50MB पेक्षा कमी असावी</li>
              <li>• जर त्या तारखेसाठी आधीच वर्तमानपत्र असेल तर ते बदलले जाईल</li>
              <li>• अपलोड केल्यानंतर फाईल Google Drive वर सेव्ह केली जाईल</li>
              <li>• फाईल तात्काळ वापरकर्त्यांना उपलब्ध होईल</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
