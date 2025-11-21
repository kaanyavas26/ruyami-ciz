async function interpretDream() {
    const dreamInput = document.getElementById('dreamInput').value;
    const inputSection = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const dreamText = document.getElementById('dreamText');
    const dreamImg = document.getElementById('dreamImg');

    if (dreamInput.length < 10) {
        alert("Lütfen rüyanı biraz daha detaylı anlat ki kahinler görebilsin...");
        return;
    }

    // Animasyonları Başlat
    inputSection.style.display = 'none';
    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';

    try {
        // API İsteği
        const response = await fetch('/api/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream: dreamInput })
        });

        if (!response.ok) throw new Error('Kahinler bağlantı kuramadı.');

        const data = await response.json();

        // Sonuçları Yükle
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        dreamText.innerHTML = data.interpretation; // HTML formatında metin
        
        if (data.imageUrl) {
            dreamImg.src = data.imageUrl;
        }

    } catch (error) {
        console.error(error);
        alert("Bir hata oluştu: " + error.message);
        loadingSection.style.display = 'none';
        inputSection.style.display = 'block';
    }
}
