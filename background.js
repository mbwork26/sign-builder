// Launch player.html in a fullscreen window when ChromeOS Kiosk boots
function createKioskWindow() {
  chrome.windows.create({
    url: 'player.html',
    state: 'fullscreen'
  });
}

// Trigger window creation on startup and installation
chrome.runtime.onStartup.addListener(createKioskWindow);
chrome.runtime.onInstalled.addListener(createKioskWindow);