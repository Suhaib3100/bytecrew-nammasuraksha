document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const scanButton = document.getElementById('scanButton');
  const clearButton = document.getElementById('clearButton');
  const resultDiv = document.getElementById('result');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const categorySpan = document.getElementById('category');
  const confidenceSpan = document.getElementById('confidence');

  // Scan button click handler
  scanButton.addEventListener('click', async () => {
    const text = urlInput.value.trim();
    if (!text) return;

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceType: 'Web'
        })
      });

      const result = await response.json();
      
      // Update UI
      resultDiv.classList.remove('hidden');
      if (result.isPhishingLink) {
        statusIcon.innerHTML = '🛑';
        statusIcon.className = 'phishing';
        statusText.textContent = 'Phishing Detected';
      } else {
        statusIcon.innerHTML = '✅';
        statusIcon.className = 'safe';
        statusText.textContent = 'Safe';
      }
      
      categorySpan.textContent = result.linkCategory;
      confidenceSpan.textContent = `${result.confidenceScore}%`;

    } catch (error) {
      console.error('Error:', error);
      resultDiv.classList.remove('hidden');
      statusIcon.innerHTML = '❌';
      statusIcon.className = 'error';
      statusText.textContent = 'Error analyzing text';
      categorySpan.textContent = 'N/A';
      confidenceSpan.textContent = 'N/A';
    }
  });

  // Clear button click handler
  clearButton.addEventListener('click', () => {
    urlInput.value = '';
    resultDiv.classList.add('hidden');
  });
}); 