import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import axios from 'axios';

// formData parsing için config
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Formdan gelen veriyi parse et
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Dosyayı oku
    const imageFile = files.image[0];
    
    try {
      // DALL-E 3 API'yi kullan
      console.log("DALL-E 3 API'ye istek gönderiliyor...");
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: 'Convert this to a Studio Ghibli style anime. Create a beautiful, whimsical Studio Ghibli animation style version with soft colors, detailed backgrounds, and the iconic Ghibli aesthetic. Maintain the original composition but transform it into a magical anime scene that looks like it could be from a Hayao Miyazaki film.',
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 60000, // 60 saniye timeout
        }
      );

      console.log("DALL-E 3 API yanıt verdi:", response.status);
      
      // Görüntü URL'ini al
      const imageUrl = response.data.data[0].url;
      
      // Başarılı yanıt
      return res.status(200).json({ url: imageUrl });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError.response?.data || apiError.message);
      
      if (apiError.response) {
        // API'den dönüş var, hata mesajını gönder
        const statusCode = apiError.response.status;
        let errorMessage = 'API işleminde bir hata oluştu.';
        
        if (statusCode === 429) {
          errorMessage = 'OpenAI API hız sınırlamasına ulaşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.';
        } else if (statusCode === 400) {
          errorMessage = 'Görsel formatı veya istek parametrelerinde bir sorun var. Başka bir görsel ile deneyiniz.';
          
          // Detaylı hata mesajı
          if (apiError.response.data && apiError.response.data.error) {
            errorMessage += ` Hata: ${apiError.response.data.error.message}`;
          }
        } else if (statusCode === 401) {
          errorMessage = 'API anahtarı geçersiz veya süresi dolmuş.';
        }
        
        return res.status(statusCode).json({ 
          error: errorMessage,
          details: apiError.response.data ? JSON.stringify(apiError.response.data) : apiError.message
        });
      }
      
      // Genel hata
      return res.status(500).json({ 
        error: 'OpenAI API ile iletişim sırasında bir hata oluştu.', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'İşlem başarısız oldu', details: error.message });
  }
}
