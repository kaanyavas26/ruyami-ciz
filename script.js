async function interpretDream() {
    const dreamInput = document.getElementById('dreamInput').value;
    const inputSection = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const dreamText = document.getElementById('dreamText');
    const dreamImg = document.getElementById('dreamImg');

    if (dreamInput.length < 5) {
        alert("Lütfen bir rüya yazın.");
        return;
    }

    inputSection.style.display = 'none';
    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';

    try {
        const response = await fetch('/api/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream: dreamInput })
        });

        const data = await response.json();

        if (!response.ok) {
            // İŞTE BURASI: Gerçek hatayı ekrana yazdıracağız
            throw new Error(data.message || data.error || "Sunucu Hatası");
        }

        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        dreamText.innerHTML = data.interpretation;
        
        if (data.imageUrl) {
            dreamImg.src = data.imageUrl;
        }

    } catch (error) {
        console.error(error);
        // Hatayı kullanıcıya açıkça göster
        alert("HATA DETAYI:\n" + error.message);
        
        loadingSection.style.display = 'none';
        inputSection.style.display = 'block';
    }
}
