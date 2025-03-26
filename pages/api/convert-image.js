import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import axios from 'axios';
import sharp from 'sharp';

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
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const imageFile = files.image[0];

    // Görseli oku ve 1024px genişliğe sıkıştır (dosya boyutunu küçültür)
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = compressedImageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Sharp ile jpeg olarak çevrildiği için sabit

    try {
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
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 60000,
        }
      );

      // GPT-4o doğrudan image_url döndürmez, oluşturduğu cevabı döndürür.
      const resultContent = response.data.choices[0].message.content;

      return res.status(200).json({ result: resultContent });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);

      if (apiError.response) {
        const statusCode = apiError.response.status;
        let errorMessage = 'API işleminde bir hata oluştu.';

        if (statusCode === 429) {
          errorMessage = 'OpenAI API hız sınırlamasına ulaşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.';
        } else if (statusCode === 400) {
          errorMessage = 'Görsel formatı veya istek parametrelerinde bir sorun var. Başka bir görsel ile deneyiniz.';
          console.error('API error details:', apiError.response.data);
        } else if (statusCode === 401) {
          errorMessage = 'API anahtarı geçersiz veya süresi dolmuş.';
        }

        return res.status(statusCode).json({
          error: errorMessage,
          details: apiError.response.data ? JSON.stringify(apiError.response.data) : apiError.message,
        });
      }

      return res.status(500).json({
        error: 'OpenAI API ile iletişim sırasında bir hata oluştu.',
        details: apiError.message,
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'İşlem başarısız oldu', details: error.message });
  }
}
