// Launch player.html in a fullscreen window when ChromeOS Kiosk boots
// v0.2.1

async function ensureKioskWindow() {
  const playerUrl = chrome.runtime.getURL('player.html');
  // Check if player.html is already open in any window
  const existingTabs = await chrome.tabs.query({ url: playerUrl });
  
  if (existingTabs.length === 0) {
    chrome.windows.create({
      url: 'player.html',
      state: 'fullscreen'
    });
  }
}

// 1. Run immediately on Service Worker startup/evaluation
ensureKioskWindow();

// 2. Keep event listeners as fallbacks
chrome.runtime.onStartup.addListener(ensureKioskWindow);
chrome.runtime.onInstalled.addListener(ensureKioskWindow);