import { IncomingForm } from 'formidable';
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
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    const fields = data.fields;
    const files = data.files;

    // Prompt kontrolü
    const prompt = fields.prompt?.[0] || "Convert this to a studio ghibli style anime";

    // Kontrol ekleyin
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt alanı boş olamaz' });
    }
    
    try {
      // Doğrudan DALL-E 3 API'yi kullan (görsel referansı olmadan)
      console.log("DALL-E 3 API'ye istek gönderiliyor...");
      
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 30000, // 30 saniye timeout
        }
      );
      
      // Görüntü URL'ini al
      const imageUrl = response.data.data[0].url;
      
      // Başarılı yanıt
      return res.status(200).json({ url: imageUrl });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError.message);
      
      let errorMessage = 'API işleminde bir hata oluştu.';
      
      if (apiError.response) {
        const statusCode = apiError.response.status;
        
        if (statusCode === 429) {
          errorMessage = 'API hız sınırlaması. Lütfen daha sonra tekrar deneyin.';
        } else if (statusCode === 400) {
          errorMessage = 'İstek parametrelerinde sorun var.';
        } else if (statusCode === 401) {
          errorMessage = 'API anahtarı geçersiz.';
        }
      }
      
      return res.status(500).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'İşlem başarısız oldu' });
  }
}
