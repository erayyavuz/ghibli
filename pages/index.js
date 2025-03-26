import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [theme, setTheme] = useState('landscape');
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const themes = [
    { id: 'landscape', name: 'Doğa Manzarası', description: 'Dağlar, göller ve ağaçlarla dolu bir Ghibli manzarası' },
    { id: 'character', name: 'Anime Karakteri', description: 'Ghibli tarzında sevimli bir anime karakteri' },
    { id: 'adventure', name: 'Macera Sahnesi', description: 'Heyecan dolu bir macera sahnesi' },
    { id: 'magical', name: 'Sihirli Dünya', description: 'Büyülü ve fantastik bir Ghibli dünyası' },
  ];

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Seçilen tema için özel bir prompt oluştur
      let prompt = '';
      switch(theme) {
        case 'landscape':
          prompt = 'Create a beautiful Studio Ghibli style landscape with mountains, lakes, and lush trees. Use the iconic Ghibli art style with its characteristic soft colors, detailed backgrounds, and whimsical aesthetic.';
          break;
        case 'character':
          prompt = 'Create a cute anime character in Studio Ghibli style. Use the iconic Ghibli art style with its characteristic soft colors and whimsical aesthetic. The character should have expressive eyes and a gentle appearance.';
          break;
        case 'adventure':
          prompt = 'Create an exciting adventure scene in Studio Ghibli style. Show characters embarking on a journey through a fantastical landscape with the iconic Ghibli art style with its characteristic soft colors, detailed backgrounds, and whimsical aesthetic.';
          break;
        case 'magical':
          prompt = 'Create a magical and fantastical world in Studio Ghibli style. Use the iconic Ghibli art style with its characteristic soft colors, detailed backgrounds, and whimsical aesthetic. Include floating islands, magical creatures, and a dreamy atmosphere.';
          break;
        default:
          prompt = 'Create a beautiful Studio Ghibli style image with the iconic Ghibli art style, soft colors, detailed backgrounds, and whimsical aesthetic.';
      }

      const response = await axios.post('/api/generate-image', { prompt }, {
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
        <title>Studio Ghibli Görsel Oluşturucu</title>
        <meta name="description" content="Studio Ghibli tarzında görseller oluşturun" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800 font-serif">
          Studio Ghibli Görsel Oluşturucu
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Tema seçim alanı */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Oluşturmak istediğiniz Ghibli temasını seçin:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {themes.map((t) => (
                <div 
                  key={t.id}
                  className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
                    theme === t.id 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  <h3 className="font-medium text-gray-800">{t.name}</h3>
                  <p className="text-sm text-gray-600">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Oluşturma butonu */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateImage}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading
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

          {/* Oluşturulan görsel */}
          {convertedImage && !loading && (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-800 mb-4 text-center">Ghibli Tarzında Görseliniz</h2>
              <div className="flex justify-center">
                <div className="w-full max-w-lg bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={convertedImage} 
                    alt="Studio Ghibli tarzında oluşturulmuş görsel" 
                    className="max-w-full object-contain" 
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
