import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt alanı zorunludur' });
    }
    
    try {
      // DALL-E 3 API'yi kullan
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
          errorMessage = 'İstek parametrelerinde bir sorun var.';
          
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
