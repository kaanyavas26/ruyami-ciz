export default async function handler(req, res) {
  // Sadece POST isteği kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { dream } = req.body;

  if (!dream) {
    return res.status(400).json({ message: 'Rüya metni eksik.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Sunucu Hatası: API Anahtarı bulunamadı (Vercel ayarlarını kontrol et).' });
  }

  try {
    // --- 1. BÖLÜM: RÜYA YORUMU (SAF FETCH YÖNTEMİ) ---
    // Kütüphane kullanmadan direkt Google adresine istek atıyoruz.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sen mistik bir rüya tabircisisin. Kullanıcının şu rüyasını Jung psikolojisi ve sembolizm ile analiz et: "${dream}". Geleceğe dair umut dolu ama gizemli bir dil kullan. Çıktıyı HTML paragraf etiketleri (<p>) içine alarak ver. Yorumun çok uzun olmasın.`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google API Hatası: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const interpretation = data.candidates[0].content.parts[0].text;

    // --- 2. BÖLÜM: GÖRSEL OLUŞTURMA (POLLINATIONS) ---
    // Rüya metnini güvenli hale getirip link oluşturuyoruz
    // Hız kazanmak için rüyayı direkt İngilizce anahtar kelimelerle değil, olduğu gibi URL'e gömüyoruz (Pollinations bunu anlayabiliyor)
    const safePrompt = encodeURIComponent(dream + " mystical, surreal dream interpretation art, 8k, cinematic lighting");
    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // Sonuçları gönder
    return res.status(200).json({ 
        interpretation: interpretation, 
        imageUrl: imageUrl 
    });

  } catch (error) {
    console.error("Backend Hatası:", error);
    return res.status(500).json({ message: 'İşlem sırasında hata oluştu.', error: error.message });
  }
}
