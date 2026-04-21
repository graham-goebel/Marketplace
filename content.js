(() => {
  'use strict';

  // ── Message listener ───────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== 'AUTOFILL') return false;
    runAutofill(msg.payload)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async response
  });

  // ── Main autofill orchestrator ─────────────────────────────────────────────
  async function runAutofill(listing) {
    const results = {};

    if (listing.title) results.title = await fillTitle(listing.title);
    if (listing.price) results.price = await fillPrice(listing.price);
    if (listing.category) results.category = await fillCategory(listing.category);
    if (listing.condition) results.condition = await fillCondition(listing.condition);
    if (listing.description) results.description = await fillDescription(listing.description);
    if (listing.location) results.location = await fillLocation(listing.location);

    const failures = Object.entries(results)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);

    if (failures.length > 0) {
      return {
        success: false,
        error: `Could not fill: ${failures.join(', ')}. Facebook may have updated their UI.`,
        partial: true,
      };
    }
    return { success: true };
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  async function fillTitle(value) {
    const el = await waitForElement([
      'input[aria-label="Title"]',
      'input[placeholder="Title"]',
      'input[name="title"]',
      '[data-testid="marketplace-pdp-seller-listing-form"] input:first-of-type',
    ], 6000);
    if (!el) return false;
    return setInputValue(el, value);
  }

  // ── Price ──────────────────────────────────────────────────────────────────
  async function fillPrice(value) {
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const el = await waitForElement([
      'input[aria-label="Price"]',
      'input[placeholder*="price" i]',
      'input[placeholder="$0"]',
      'input[aria-label*="price" i]',
    ], 4000);
    if (!el) return false;
    return setInputValue(el, cleaned);
  }

  // ── Category ───────────────────────────────────────────────────────────────
  async function fillCategory(value) {
    // Category is a custom Facebook dropdown — click it, wait for options, select match
    const trigger = await waitForElement([
      '[aria-label="Category"]',
      '[aria-label*="category" i]',
      'select[name="category"]',
      // Generic: look for a div/span labelled Category that is clickable
      'label[for*="category" i] ~ div [role="button"]',
      'div[role="button"][aria-haspopup="listbox"]',
    ], 4000);

    if (!trigger) return false;
    return selectDropdownOption(trigger, value);
  }

  // ── Condition ──────────────────────────────────────────────────────────────
  async function fillCondition(value) {
    const trigger = await waitForElement([
      '[aria-label="Condition"]',
      '[aria-label*="condition" i]',
      'select[name="condition"]',
    ], 4000);

    if (!trigger) return false;

    // Native <select> element
    if (trigger.tagName === 'SELECT') {
      return selectNativeOption(trigger, value);
    }
    return selectDropdownOption(trigger, value);
  }

  // ── Description ────────────────────────────────────────────────────────────
  async function fillDescription(value) {
    const el = await waitForElement([
      'textarea[aria-label="Description"]',
      'div[aria-label="Description"][contenteditable]',
      'textarea[placeholder*="description" i]',
      'div[contenteditable="true"][aria-label*="description" i]',
      // Fallback: first large textarea on the page
      'textarea[rows]',
    ], 4000);

    if (!el) return false;

    if (el.tagName === 'TEXTAREA') {
      return setTextareaValue(el, value);
    }
    return setContentEditable(el, value);
  }

  // ── Location ───────────────────────────────────────────────────────────────
  async function fillLocation(value) {
    const el = await waitForElement([
      'input[aria-label="Location"]',
      'input[placeholder*="location" i]',
      'input[aria-label*="location" i]',
    ], 4000);

    if (!el) return false;

    const ok = setInputValue(el, value);
    if (!ok) return false;

    // Location has autocomplete — wait for suggestion and pick first one
    await sleep(600);
    const suggestion = await waitForElement([
      '[role="option"]',
      '[role="listbox"] [role="option"]:first-child',
      'ul[role="listbox"] li:first-child',
    ], 2000);

    if (suggestion) {
      suggestion.click();
      await sleep(300);
    }
    return true;
  }

  // ── React input helpers ────────────────────────────────────────────────────

  // Trigger React's synthetic events on a controlled <input> or <textarea>
  function setInputValue(el, value) {
    try {
      el.focus();
      // Use the native setter to bypass React's controlled input guard
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      ).set;
      nativeSetter.call(el, String(value));
      fireEvents(el, ['input', 'change']);
      return true;
    } catch {
      return false;
    }
  }

  function setTextareaValue(el, value) {
    try {
      el.focus();
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value'
      ).set;
      nativeSetter.call(el, String(value));
      fireEvents(el, ['input', 'change']);
      return true;
    } catch {
      return false;
    }
  }

  function setContentEditable(el, value) {
    try {
      el.focus();
      // Select all and replace via execCommand (best React compatibility)
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, String(value));
      fireEvents(el, ['input', 'change']);
      return true;
    } catch {
      return false;
    }
  }

  function fireEvents(el, types) {
    types.forEach((type) => {
      el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
    });
  }

  // ── Dropdown helpers ───────────────────────────────────────────────────────

  async function selectDropdownOption(trigger, value) {
    try {
      trigger.click();
      await sleep(400);

      // Find the matching option in the opened dropdown
      const option = await waitForMatchingOption(value, 2000);
      if (!option) return false;

      option.click();
      await sleep(200);
      return true;
    } catch {
      return false;
    }
  }

  async function waitForMatchingOption(value, timeout) {
    const end = Date.now() + timeout;
    const normalized = value.toLowerCase().trim();

    while (Date.now() < end) {
      const options = Array.from(document.querySelectorAll(
        '[role="option"], [role="menuitem"], [role="listbox"] li, ul[aria-label] li'
      ));

      const match = options.find((o) => {
        const text = (o.textContent || '').toLowerCase().trim();
        return text === normalized || text.startsWith(normalized);
      });

      if (match) return match;
      await sleep(100);
    }
    return null;
  }

  function selectNativeOption(select, value) {
    const normalized = value.toLowerCase().trim();
    const option = Array.from(select.options).find((o) => {
      const text = (o.text || '').toLowerCase().trim();
      const val = (o.value || '').toLowerCase().trim();
      return text === normalized || val === normalized ||
             text.startsWith(normalized) || val.startsWith(normalized);
    });

    if (!option) return false;
    select.value = option.value;
    fireEvents(select, ['change']);
    return true;
  }

  // ── DOM utilities ──────────────────────────────────────────────────────────

  async function waitForElement(selectors, timeout = 5000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el && isVisible(el)) return el;
        } catch {
          // Invalid selector — skip
        }
      }
      await sleep(120);
    }
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
