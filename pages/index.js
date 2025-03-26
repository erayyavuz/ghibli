import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setImage({
        file,
        preview: URL.createObjectURL(file)
      });
      setConvertedImage(null);
      setError(null);
    }
  });

  const convertToGhibli = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image.file);

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
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <input {...getInputProps()} />
            {!image ? (
              <div>
                <p className="text-gray-600 mb-2">Görseli buraya sürükleyin veya tıklayıp seçin</p>
                <p className="text-sm text-gray-500">PNG, JPG ve JPEG dosyaları desteklenir</p>
              </div>
            ) : (
              <div className="relative h-64 w-full">
                <Image 
                  src={image.preview} 
                  alt="Yüklenen görsel" 
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

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

          {loading && (
            <div className="mt-8 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Görseliniz Studio Ghibli tarzına dönüştürülüyor, lütfen bekleyin...</p>
              <p className="mt-2 text-sm text-gray-500">Bu işlem 15-30 saniye sürebilir</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {convertedImage && !loading && (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Ghibli Tarzında Görseliniz</h2>
              <div className="relative h-96 w-full">
                <Image 
                  src={convertedImage} 
                  alt="Studio Ghibli tarzında dönüştürülmüş görsel" 
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <a 
                  href={convertedImage} 
                  download="ghibli-image.png"
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
