import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const imageBuffer = await fs.readFile(imageFile.filepath);
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Base64'e dönüştürülmüş görseli prompt ile gönder
    const base64Image = compressedImageBuffer.toString('base64');

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'Convert this photo to a studio ghibli style anime',
      size: '1024x1024',
      response_format: 'url',
    });

    const imageUrl = response.data[0].url;

    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'İşlem başarısız oldu', details: error.message });
  }
}
