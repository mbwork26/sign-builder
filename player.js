/**
 * BPS14 Chrome Sign Builder - Player Script
 * Handles managed policy loading, schedule parsing, and iframe rendering.
 */

// Dynamically retrieve version from manifest.json (or fallback if running outside runtime context)
const APP_VERSION = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest)
  ? chrome.runtime.getManifest().version
  : '0.2.1';  //Current version from manifest.json and update.xml

document.addEventListener('DOMContentLoaded', () => {
  initializePlayer();
});

function initializePlayer() {
  console.log(`BPS14 Chrome Sign Builder running v${APP_VERSION}`);

  // Fetch initial managed configuration from Google Admin Console
  if (chrome.storage && chrome.storage.managed) {
    chrome.storage.managed.get(null, (config) => {
      if (chrome.runtime.lastError) {
        console.warn('Managed storage retrieval error:', chrome.runtime.lastError.message);
      }
      renderSignage(config);
    });

    // Listen for live policy updates without requiring an app restart
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'managed') {
        chrome.storage.managed.get(null, (config) => {
          renderSignage(config);
        });
      }
    });
  } else {
    updateStatus('Managed storage unavailable. Ensure device is enrolled and policy is pushed.');
  }

  // Mandatory 24-hour full page refresh cycle to prevent memory leaks in prolonged unattended operation
  setTimeout(() => {
    window.location.reload();
  }, 24 * 60 * 60 * 1000);
}

function renderSignage(config) {
  const container = document.getElementById('signage-container');
  
  // Hardened validation check for schedule.Value[0].items
  const hasValidItems = config &&
                        config.schedule &&
                        Array.isArray(config.schedule.Value) &&
                        config.schedule.Value.length > 0 &&
                        config.schedule.Value[0] &&
                        Array.isArray(config.schedule.Value[0].items) &&
                        config.schedule.Value[0].items.length > 0;

  if (!hasValidItems) {
    container.innerHTML = '';
    updateStatus('Awaiting JSON configuration. Please add the policy payload in Google Admin. Current Version 0.2.1');
    return;
  }

  // Valid configuration detected; clear status message and render zones
  updateStatus('');
  container.innerHTML = '';

  const items = config.schedule.Value[0].items;

  items.forEach((item) => {
    if (!item.url) return;

    const iframe = document.createElement('iframe');
    iframe.src = item.url;
    iframe.className = 'signage-frame';
    
    // Apply optional positioning / layout properties if present
    if (item.width) iframe.style.width = item.width;
    if (item.height) iframe.style.height = item.height;
    if (item.top) iframe.style.top = item.top;
    if (item.left) iframe.style.left = item.left;

    container.appendChild(iframe);

    // Auto-reload individual zone frame if specified (autoReload in seconds)
    if (item.autoReload && item.autoReload > 0) {
      setInterval(() => {
        iframe.src = item.url;
      }, item.autoReload * 1000);
    }
  });
}

function updateStatus(message) {
  const statusEl = document.getElementById('status-message');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.display = message ? 'block' : 'none';
  }
}