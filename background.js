// Service Worker — handles cross-origin fetches and extension lifecycle
'use strict';

// Inject content script into existing Marketplace tabs on install/update
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install' && reason !== 'update') return;

  const tabs = await chrome.tabs.query({
    url: ['https://www.facebook.com/marketplace/create/*'],
  });

  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch {
      // Tab may not be injectable (e.g., PDF, chrome:// page)
    }
  }
});

// Proxy fetch requests from the popup (handles CORS for Google Sheets)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'FETCH_CSV') return false;

  fetch(msg.url, { method: 'GET', credentials: 'omit' })
    .then(async (resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      const text = await resp.text();
      sendResponse({ ok: true, text });
    })
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true; // async
});
