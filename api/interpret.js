module.exports = async (req, res) => {
  // 1. Güvenlik Kontrolleri
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST isteği kabul edilir.' });
  }

  const { dream } = req.body;

  if (!dream) {
    return res.status(400).json({ message: 'Lütfen bir rüya yazın.' });
  }

  try {
    // --- 1. BÖLÜM: RÜYA YORUMU (ANAHTARSIZ / POLLINATIONS TEXT) ---
    // OpenAI veya Google yerine açık kaynaklı Pollinations Text API kullanıyoruz.
    // Ücretsizdir, şifre gerektirmez.
    
    const prompt = `Sen mistik bir rüya tabircisisin. Şu rüyayı Jung psikolojisi ile analiz et: "${dream}". Gizemli, mistik bir dil kullan. Cevabı Türkçe ver ve HTML paragraf (<p>) etiketleri içine al. Cevap kısa olsun.`;
    
    // URL'e sığması için kodluyoruz
    const encodedPrompt = encodeURIComponent(prompt);
    const textUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai`; 
    // Not: Pollinations arka planda OpenAI modellerini ücretsiz sunar.

    const textResponse = await fetch(textUrl);
    
    if (!textResponse.ok) {
      throw new Error("Yorum servisine ulaşılamadı.");
    }

    const interpretation = await textResponse.text();

    // --- 2. BÖLÜM: GÖRSEL OLUŞTURMA ---
    const safePrompt = encodeURIComponent(dream + " mystical, surreal dream interpretation art, 8k, cinematic lighting");
    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // 3. Sonucu Gönder
    res.status(200).json({
      interpretation: interpretation, // Direkt gelen metni basıyoruz
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Sunucu Hatası:", error);
    res.status(500).json({ message: 'Sistem geçici olarak meşgul, tekrar deneyin.', error: error.message });
  }
};
