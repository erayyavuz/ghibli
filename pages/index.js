import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState("Convert this photo to a studio ghibli style anime");
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Maksimum boyut kontrolü (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Görsel boyutu çok büyük (maksimum 5MB)");
        return;
      }
      
      // Desteklenen formatlar
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Lütfen JPEG, PNG veya WebP formatında bir görsel yükleyin");
        return;
      }
      
      setImage(selectedFile);
      setError(null);
      setErrorDetails(null);
      
      // Önizleme URL'sini oluştur
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setConvertedImage(null);
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const generateImage = async () => {
    if (!image) {
      setError("Lütfen bir görsel yükleyin");
      return;
    }

    if (!prompt || prompt.trim() === '') {
      setError("Lütfen bir prompt girin");
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', prompt);

      const response = await axios.post('/api/transform-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 dakika timeout
      });

      setConvertedImage(response.data.url);
    } catch (err) {
      console.error('Error generating image:', err);
      
      // API'den gelen hata mesajlarını göster
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Bir hata oluştu");
        
        if (err.response.data.details) {
          setErrorDetails(err.response.data.details);
        }
      } else {
        setError('Görsel oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
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
          Studio Ghibli Görsel Dönüştürücü
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Görsel yükleme alanı */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Dönüştürmek istediğiniz görseli seçin:
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Görsel yüklemek için tıklayın</span> veya sürükleyip bırakın
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG veya WEBP (Maks. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
              </label>
            </div>
          </div>
          
          {/* Önizleme alanı (sabit boyut) */}
          {previewUrl && (
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2 text-center">Yüklenen Görsel:</p>
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

          {/* Prompt girme alanı */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Görsel dönüştürme prompt'u:
            </label>
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Görseli nasıl dönüştürmek istediğinizi açıklayın..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Örnek: "Convert this photo to a studio ghibli style anime"
            </p>
          </div>

          {/* Dönüştürme butonu */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateImage}
              disabled={!image || !prompt || loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                !image || !prompt || loading
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
              <p className="mt-2 text-sm text-gray-500">Bu işlem 30-60 saniye sürebilir</p>
            </div>
          )}

          {/* Hata mesajı */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
              {errorDetails && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer">Teknik Detaylar</summary>
                  <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40 p-2 bg-red-50 rounded">
                    {errorDetails}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Dönüştürülen görsel */}
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
              <div className="mt-4 flex justify-center space-x-4">
                <a 
                  href={convertedImage} 
                  download="ghibli-image.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Görseli İndir
                </a>
                <a
                  href={convertedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Tam Boyutunda Görüntüle
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
