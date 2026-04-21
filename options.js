(() => {
  'use strict';

  const STORAGE_KEY = 'mktAutofillOptions';

  const DEFAULTS = {
    defaultUrl: '',
    columns: {
      title: 'title',
      price: 'price',
      category: 'category',
      condition: 'condition',
      description: 'description',
      location: 'location',
    },
    skipEmpty: false,
    autoReload: true,
    scrollToError: true,
  };

  const $id = (id) => document.getElementById(id);

  async function init() {
    const opts = await loadOptions();
    populateForm(opts);

    $id('saveBtn').addEventListener('click', handleSave);
    $id('resetBtn').addEventListener('click', handleReset);
  }

  function populateForm(opts) {
    $id('defaultUrl').value = opts.defaultUrl || '';
    $id('colTitle').value = opts.columns?.title || '';
    $id('colPrice').value = opts.columns?.price || '';
    $id('colCategory').value = opts.columns?.category || '';
    $id('colCondition').value = opts.columns?.condition || '';
    $id('colDescription').value = opts.columns?.description || '';
    $id('colLocation').value = opts.columns?.location || '';
    $id('skipEmpty').checked = opts.skipEmpty ?? DEFAULTS.skipEmpty;
    $id('autoReload').checked = opts.autoReload ?? DEFAULTS.autoReload;
    $id('scrollToError').checked = opts.scrollToError ?? DEFAULTS.scrollToError;
  }

  async function handleSave() {
    const opts = {
      defaultUrl: $id('defaultUrl').value.trim(),
      columns: {
        title: $id('colTitle').value.trim() || 'title',
        price: $id('colPrice').value.trim() || 'price',
        category: $id('colCategory').value.trim() || 'category',
        condition: $id('colCondition').value.trim() || 'condition',
        description: $id('colDescription').value.trim() || 'description',
        location: $id('colLocation').value.trim() || 'location',
      },
      skipEmpty: $id('skipEmpty').checked,
      autoReload: $id('autoReload').checked,
      scrollToError: $id('scrollToError').checked,
    };

    await saveOptions(opts);

    // Also save the URL to the main storage key so popup picks it up
    if (opts.defaultUrl) {
      chrome.storage.local.get('mktAutofill', (data) => {
        const existing = data['mktAutofill'] || {};
        chrome.storage.local.set({
          mktAutofill: { ...existing, sheetsUrl: opts.defaultUrl, source: 'sheets' },
        });
      });
    }

    showSaveStatus();
  }

  function handleReset() {
    if (!confirm('Reset all settings to defaults?')) return;
    populateForm(DEFAULTS);
  }

  function showSaveStatus() {
    const el = $id('saveStatus');
    el.textContent = '✓ Saved';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
  }

  function loadOptions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (data) => {
        resolve({ ...DEFAULTS, ...(data[STORAGE_KEY] || {}) });
      });
    });
  }

  function saveOptions(opts) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: opts }, resolve);
    });
  }

  init();
})();
