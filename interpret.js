import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { dream } = req.body;

  try {
    // 1. Rüya Yorumu (GPT-4o-mini)
    const textCompletion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Sen 'Rüyamı Çiz' platformunun mistik kahinisin. Kullanıcının rüyasını Jung psikolojisi ve sembolizm ile analiz et. Geleceğe dair hafif, umut dolu ama gizemli bir dil kullan. Çıktıyı HTML paragraf etiketleri (<p>) kullanarak formatla." },
        { role: "user", content: dream }
      ],
      model: "gpt-4o-mini",
    });

    const interpretation = textCompletion.choices[0].message.content;

    // 2. Görsel Oluşturma (DALL-E 3)
    // Promptu İngilizceye çevirip detaylandırıyoruz ki DALL-E daha iyi çalışsın.
    const imagePrompt = `A surreal, high-quality, mystical digital art interpretation of a dream: ${dream}. Artistic style, ethereal lighting, cinematic composition, fantasy elements, no text.`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data[0].url;

    return res.status(200).json({ 
        interpretation, 
        imageUrl 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
