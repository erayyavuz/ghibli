# Studio Ghibli Görsel Dönüştürücü

Bu web uygulaması, yüklediğiniz görselleri ChatGPT-4o modelini kullanarak Studio Ghibli tarzı anime görüntülere dönüştürmektedir.

## Özellikler

- Görsel yükleme (sürükle bırak destekli)
- ChatGPT-4o API entegrasyonu
- Studio Ghibli tarzında görüntü dönüşümü
- Dönüştürülen görseli indirme

## Kullanım

1. Ana sayfadaki alana bir görsel yükleyin
2. "Studio Ghibli Tarzına Dönüştür" butonuna tıklayın
3. İşlem tamamlandığında dönüştürülen görseli görüntüleyin ve indirin

## Teknolojiler

- Next.js
- React
- Tailwind CSS
- OpenAI ChatGPT-4o API

## Yerel Geliştirme

Bu projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Ardından tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

## Çevre Değişkenleri

Projeyi çalıştırmak için bir `.env.local` dosyası oluşturun ve OpenAI API anahtarınızı ekleyin:

```
OPENAI_API_KEY=your_api_key_here
```

## Lisans

MIT
