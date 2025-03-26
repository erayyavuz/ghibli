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

    // Dosyayı oku ve base64'e çevir
    const imageFile = files.image[0];
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const base64Image = imageBuffer.toString('base64');

    // Görüntü formatını temizle ve düzelt
    const mimeType = imageFile.mimetype;
    // MIME türünde "image/image/" gibi hatalı bir ön ek varsa düzelt
    const properMimeType = mimeType.replace('image/image/', 'image/');

    try {
      // GPT-4o API'ye istek gönder
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Convert this photo to a studio ghibli style anime' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${properMimeType};base64,${base64Image}`,
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
          response_format: { type: "image_url" } // Görsel oluşturmak için gerekli
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 60000, // 60 saniye timeout
        }
      );

      // API'den dönen görsel URL'sini al
      const imageUrl = response.data.choices[0].message.content[0].image_url;
      
      // Görselin URL'sini döndür
      return res.status(200).json({ url: imageUrl });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      if (apiError.response) {
        // API'den dönüş var, hata mesajını gönder
        const statusCode = apiError.response.status;
        let errorMessage = 'API işleminde bir hata oluştu.';
        
        if (statusCode === 429) {
          errorMessage = 'OpenAI API hız sınırlamasına ulaşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.';
        } else if (statusCode === 400) {
          errorMessage = 'Görsel formatı veya istek parametrelerinde bir sorun var. Başka bir görsel ile deneyiniz.';
          
          // API'den dönen hata mesajını log'a yazdır (debugging için)
          console.error('API error details:', apiError.response.data);
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
