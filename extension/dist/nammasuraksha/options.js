document.addEventListener('DOMContentLoaded', () => {
  const autoScanCheckbox = document.getElementById('autoScan');
  const confidenceThreshold = document.getElementById('confidenceThreshold');
  const thresholdValue = document.getElementById('thresholdValue');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get({
    autoScan: true,
    confidenceThreshold: 80
  }, (items) => {
    autoScanCheckbox.checked = items.autoScan;
    confidenceThreshold.value = items.confidenceThreshold;
    thresholdValue.textContent = `${items.confidenceThreshold}%`;
  });

  // Update threshold value display
  confidenceThreshold.addEventListener('input', () => {
    thresholdValue.textContent = `${confidenceThreshold.value}%`;
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const settings = {
      autoScan: autoScanCheckbox.checked,
      confidenceThreshold: parseInt(confidenceThreshold.value)
    };

    chrome.storage.sync.set(settings, () => {
      // Show success message
      statusDiv.classList.remove('hidden');
      setTimeout(() => {
        statusDiv.classList.add('hidden');
      }, 2000);
    });
  });
}); 