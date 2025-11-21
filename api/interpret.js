// Vercel Serverless Function (Node.js Standard)
// Kütüphane gerektirmez, direkt çalışır.

module.exports = async (req, res) => {
  // 1. Güvenlik Kontrolleri
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST isteği kabul edilir.' });
  }

  const { dream } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("HATA: GOOGLE_API_KEY bulunamadı.");
    return res.status(500).json({ message: 'Sunucu Hatası: API Anahtarı girilmemiş.' });
  }

  if (!dream) {
    return res.status(400).json({ message: 'Lütfen bir rüya yazın.' });
  }

  try {
    // 2. Google Gemini API'ye İstek (Fetch ile)
    // Not: Node.js 18+ sürümünde fetch yerleşiktir.
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sen bir rüya tabircisisin. Şu rüyayı yorumla: "${dream}". Kısa, gizemli ve HTML <p> etiketleriyle formatlı cevap ver.`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Google API Hatası: ${JSON.stringify(errorData)}`);
    }

    const geminiData = await geminiResponse.json();
    // Google'dan gelen cevabı ayıklıyoruz
    const interpretation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Yorum alınamadı.";

    // 3. Görsel Linki Oluşturma (Pollinations)
    // Rüyayı güvenli bir URL formatına çeviriyoruz
    const safePrompt = encodeURIComponent(dream + " mystical dream art, surreal, 8k, cinematic lighting");
    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // 4. Sonucu Gönder
    res.status(200).json({
      interpretation: interpretation,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Sunucu Hatası:", error);
    res.status(500).json({ message: 'İşlem başarısız oldu.', error: error.message });
  }
};
