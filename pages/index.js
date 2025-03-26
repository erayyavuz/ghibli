import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Önizleme URL'sini oluştur
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setConvertedImage(null);
      setError(null);
    }
  };

  const convertToGhibli = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post('/api/convert-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setConvertedImage(response.data.url);
    } catch (err) {
      console.error('Error converting image:', err);
      setError('Görsel dönüştürülürken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6">
      <Head>
        <title>Studio Ghibli Görsel Dönüştürücü</title>
        <meta name="description" content="Görselleri Studio Ghibli tarzına dönüştürün" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800 font-serif">
          Studio Ghibli
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Dosya yükleme alanı */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Dönüştürmek istediğiniz görseli seçin:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
          
          {/* Önizleme alanı - Maksimum 200px genişlikte */}
          {previewUrl && (
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">Yüklenen Görsel:</p>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Önizleme" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dönüştürme butonu */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={convertToGhibli}
              disabled={!image || loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                !image || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
              }`}
            >
              {loading ? 'Dönüştürülüyor...' : 'Studio Ghibli Tarzına Dönüştür'}
            </button>
          </div>

          {/* Loading göstergesi */}
          {loading && (
            <div className="mt-8 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Görseliniz Studio Ghibli tarzına dönüştürülüyor, lütfen bekleyin...</p>
              <p className="mt-2 text-sm text-gray-500">Bu işlem 15-30 saniye sürebilir</p>
            </div>
          )}

          {/* Hata mesajı */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Dönüştürülen görsel - Sabit boyutta gösterim */}
          {convertedImage && !loading && (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-800 mb-4 text-center">Ghibli Tarzında Görseliniz</h2>
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={convertedImage} 
                    alt="Studio Ghibli tarzında dönüştürülmüş görsel" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <a 
                  href={convertedImage} 
                  download="ghibli-image.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Görseli İndir
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Studio Ghibli Görsel Dönüştürücü &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
