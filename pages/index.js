import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [prompt, setPrompt] = useState("Create a Studio Ghibli style anime scene with vibrant colors, detailed backgrounds, and magical elements");
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const generateImage = async () => {
    if (!prompt || prompt.trim() === '') {
      setError("Lütfen bir prompt girin");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);

      const response = await axios.post('/api/transform-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setConvertedImage(response.data.url);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.error || 'Görsel oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6">
      <Head>
        <title>Studio Ghibli Görsel Oluşturucu</title>
        <meta name="description" content="Studio Ghibli tarzında görseller oluşturun" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800 font-serif">
          Studio Ghibli Görsel Oluşturucu
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Prompt girme alanı */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Studio Ghibli görselinizi tanımlayın:
            </label>
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Oluşturmak istediğiniz Studio Ghibli tarzı sahneyi tanımlayın..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Örnek: "Create a Studio Ghibli style anime scene with vibrant colors and magical elements"
            </p>
          </div>

          {/* Oluşturma butonu */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateImage}
              disabled={!prompt || loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                !prompt || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
              }`}
            >
              {loading ? 'Oluşturuluyor...' : 'Studio Ghibli Görseli Oluştur'}
            </button>
          </div>

          {/* Loading göstergesi */}
          {loading && (
            <div className="mt-8 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Ghibli tarzında görsel oluşturuluyor, lütfen bekleyin...</p>
              <p className="mt-2 text-sm text-gray-500">Bu işlem 30-60 saniye sürebilir</p>
            </div>
          )}

          {/* Hata mesajı */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Oluşturulan görsel */}
          {convertedImage && !loading && (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-800 mb-4 text-center">Ghibli Tarzında Görseliniz</h2>
              <div className="flex justify-center">
                <div className="w-full max-w-md bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden p-2">
                  <img 
                    src={convertedImage} 
                    alt="Studio Ghibli tarzında oluşturulmuş görsel" 
                    className="max-w-full object-contain rounded" 
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
        <p>Studio Ghibli Görsel Oluşturucu &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
