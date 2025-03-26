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

    try {
      // ChatGPT-4o API'ye istek gönder
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
                    url: `data:image/${imageFile.mimetype};base64,${base64Image}`,
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
          response_format: { type: "image_url" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 30000, // 30 saniye timeout ekleyelim
        }
      );

      // API'den dönen görsel URL'sini al
      const imageUrl = response.data.choices[0].message.content[0].image_url;
      
      // Görselin URL'sini döndür
      return res.status(200).json({ url: imageUrl });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      // API rate limit hatası için özel mesaj
      if (apiError.response && apiError.response.status === 429) {
        return res.status(429).json({ 
          error: 'OpenAI API hız sınırlamasına ulaşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.',
          details: 'Rate limit exceeded'
        });
      }
      
      // Diğer API hataları
      return res.status(500).json({ 
        error: 'OpenAI API işlem sırasında bir hata oluştu.', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'İşlem başarısız oldu', details: error.message });
  }
}
