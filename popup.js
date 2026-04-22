(() => {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let allRows = [];
  let filteredRows = [];
  let selectedIndex = -1;
  let columns = [];
  const STORAGE_KEY = 'mktAutofill';

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const $id = (id) => document.getElementById(id);
  const statusDot      = $id('statusDot');
  const statusText     = $id('statusText');
  const sheetsUrl      = $id('sheetsUrl');
  const loadSheetsBtn  = $id('loadSheets');
  const fileInput      = $id('fileInput');
  const fileLabel      = $id('fileLabel');
  const fileLabelText  = $id('fileLabelText');
  const tableContainer = $id('tableContainer');
  const tableHead      = $id('tableHead');
  const tableBody      = $id('tableBody');
  const tableCount     = $id('tableCount');
  const searchInput    = $id('searchInput');
  const selectedPreview = $id('selectedPreview');
  const selectedTitle  = $id('selectedTitle');
  const copyFields     = $id('copyFields');
  const autofillBtn    = $id('autofillBtn');
  const clearBtn       = $id('clearBtn');
  const toast          = $id('toast');

  // ── Init ───────────────────────────────────────────────────────────────────
  init();

  async function init() {
    setupTabs();
    setupEventListeners();
    await checkPageStatus();
    await restoreState();
  }

  // ── Tab switching ──────────────────────────────────────────────────────────
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        $id(`panel-${btn.dataset.tab}`).classList.add('active');
        saveState({ activeTab: btn.dataset.tab });
      });
    });
  }

  // ── Event listeners ────────────────────────────────────────────────────────
  function setupEventListeners() {
    loadSheetsBtn.addEventListener('click', handleLoadSheets);
    sheetsUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLoadSheets(); });
    fileInput.addEventListener('change', handleFileUpload);
    fileLabel.addEventListener('click', () => fileInput.click());
    searchInput.addEventListener('input', handleSearch);
    autofillBtn.addEventListener('click', handleAutofill);
    clearBtn.addEventListener('click', handleClear);
    $id('downloadTemplate').addEventListener('click', handleDownloadTemplate);
    $id('openOptions').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }

  // ── Page status check ──────────────────────────────────────────────────────
  async function checkPageStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';
      const isMarketplace =
        url.includes('facebook.com/marketplace/create') ||
        url.includes('facebook.com/marketplace/') && url.includes('/edit/');

      if (isMarketplace) {
        statusDot.className = 'status-dot active';
        statusText.textContent = 'Ready — Facebook Marketplace detected';
      } else if (url.includes('facebook.com')) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Go to Marketplace → Create listing to autofill';
      } else {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Not on Facebook — navigate to Marketplace first';
      }
    } catch {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'Could not read current tab';
    }
  }

  // ── Load Google Sheets ─────────────────────────────────────────────────────
  async function handleLoadSheets() {
    const raw = sheetsUrl.value.trim();
    if (!raw) { showToast('Paste a Google Sheets URL first', 'error'); return; }

    const csvUrl = resolveGoogleSheetsUrl(raw);
    if (!csvUrl) { showToast('Invalid Google Sheets URL', 'error'); return; }

    setLoading(loadSheetsBtn, true);
    try {
      const resp = await fetch(csvUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const rows = parseCSV(text);
      loadRows(rows);
      saveState({ sheetsUrl: raw, source: 'sheets' });
      showToast(`Loaded ${allRows.length} listing${allRows.length !== 1 ? 's' : ''}`, 'success');
    } catch (err) {
      showToast(`Failed to load: ${err.message}`, 'error');
    } finally {
      setLoading(loadSheetsBtn, false);
    }
  }

  function resolveGoogleSheetsUrl(input) {
    // Already a CSV export URL
    if (input.includes('export?format=csv') || input.includes('pub?output=csv')) {
      return input;
    }
    // Extract sheet ID from edit/view/pub URL
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    const id = match[1];
    // Extract gid if present
    const gidMatch = input.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  }

  // ── Load Excel / CSV file ─────────────────────────────────────────────────
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel && typeof XLSX === 'undefined') {
      showToast('Run setup.sh first to enable Excel support (xlsx not loaded)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let rows;
        if (isCSV) {
          rows = parseCSV(ev.target.result);
        } else {
          // Use SheetJS for .xlsx / .xls
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          rows = json;
        }
        loadRows(rows);
        fileLabelText.textContent = `${file.name} (${allRows.length} rows)`;
        fileLabel.classList.add('loaded');
        showToast(`Loaded ${allRows.length} listing${allRows.length !== 1 ? 's' : ''}`, 'success');
      } catch (err) {
        showToast(`File error: ${err.message}`, 'error');
      }
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  // ── CSV parser ─────────────────────────────────────────────────────────────
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    return lines.slice(1).map((line) => {
      const vals = parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h.trim()] = (vals[i] || '').trim(); });
      return row;
    }).filter((row) => Object.values(row).some((v) => v));
  }

  function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  // ── Load rows into table ───────────────────────────────────────────────────
  function loadRows(rows) {
    if (!rows.length) { showToast('No data found in source', 'error'); return; }
    allRows = rows;
    columns = Object.keys(rows[0]);
    selectedIndex = -1;
    filteredRows = [...allRows];
    renderTable();
    tableContainer.classList.remove('hidden');
    updateSelection(-1);
  }

  // ── Render table ───────────────────────────────────────────────────────────
  function renderTable() {
    // Display subset of columns: always prefer known fields first
    const PRIORITY = ['title', 'price', 'category', 'condition', 'description', 'location'];
    const displayCols = [
      ...PRIORITY.filter((c) => columns.map((x) => x.toLowerCase()).includes(c)),
      ...columns.filter((c) => !PRIORITY.includes(c.toLowerCase())),
    ].slice(0, 5);

    // Map display cols to actual column keys
    const colMap = displayCols.map((dc) => {
      return columns.find((c) => c.toLowerCase() === dc) || dc;
    });

    // Header
    tableHead.innerHTML = `<tr>${colMap.map((c) => `<th>${escHtml(c)}</th>`).join('')}</tr>`;

    // Rows
    tableBody.innerHTML = filteredRows.map((row, i) => `
      <tr data-index="${i}" class="${i === selectedIndex ? 'selected' : ''}">
        ${colMap.map((c) => `<td title="${escHtml(row[c] || '')}">${escHtml(truncate(row[c] || '', 24))}</td>`).join('')}
      </tr>
    `).join('');

    tableCount.textContent = `${filteredRows.length} listing${filteredRows.length !== 1 ? 's' : ''}`;

    tableBody.querySelectorAll('tr').forEach((tr) => {
      tr.addEventListener('click', () => {
        const idx = parseInt(tr.dataset.index, 10);
        // Find actual index in allRows
        const actualRow = filteredRows[idx];
        const actualIdx = allRows.indexOf(actualRow);
        updateSelection(actualIdx);
        renderTable();
      });
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  function handleSearch() {
    const q = searchInput.value.toLowerCase();
    filteredRows = q
      ? allRows.filter((row) =>
          Object.values(row).some((v) => String(v).toLowerCase().includes(q))
        )
      : [...allRows];
    renderTable();
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  // Copy-field definitions in display order
  const COPY_FIELDS = [
    { key: 'title',       label: 'Title' },
    { key: 'price',       label: 'Price' },
    { key: 'category',    label: 'Category' },
    { key: 'condition',   label: 'Condition' },
    { key: 'description', label: 'Description' },
    { key: 'location',    label: 'Location' },
    { key: 'tags',        label: 'Tags' },
  ];

  function updateSelection(idx) {
    selectedIndex = idx;
    const hasSelection = idx >= 0 && !!allRows[idx];

    document.body.classList.toggle('has-selection', hasSelection);
    selectedPreview.classList.toggle('hidden', !hasSelection);
    autofillBtn.disabled = !hasSelection;
    clearBtn.disabled    = !hasSelection;

    if (!hasSelection) return;

    const row = allRows[idx];
    selectedTitle.textContent = getField(row, 'title') || Object.values(row)[0] || '(no title)';
    copyFields.innerHTML = buildCopyFields(row);

    // Wire click handlers on freshly rendered rows
    copyFields.querySelectorAll('.copy-row').forEach((el) => {
      el.addEventListener('click', () => handleCopyField(el));
    });
  }

  function buildCopyFields(row) {
    return COPY_FIELDS.map(({ key, label }) => {
      const col = columns.find((c) => c.toLowerCase() === key.toLowerCase());
      const val = col ? (row[col] || '').trim() : '';
      if (!val) return '';

      const display = key === 'description' ? truncate(val, 72) : truncate(val, 48);
      return `
        <div class="copy-row" data-value="${escHtml(val)}">
          <span class="copy-label">${label}</span>
          <span class="copy-value" title="${escHtml(val)}">${escHtml(display)}</span>
          <svg class="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </div>`;
    }).join('');
  }

  // ── Copy field handler ─────────────────────────────────────────────────────
  async function handleCopyField(el) {
    const value = el.dataset.value;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      // Visual feedback — green flash then settle
      el.classList.add('copied');
      const icon = el.querySelector('.copy-icon');
      if (icon) {
        icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
        icon.setAttribute('stroke', 'currentColor');
      }
      setTimeout(() => {
        el.classList.remove('copied');
        if (icon) {
          icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
        }
      }, 1200);
    } catch {
      showToast('Clipboard access denied', 'error');
    }
  }

  // ── Autofill ───────────────────────────────────────────────────────────────
  async function handleAutofill() {
    if (selectedIndex < 0) return;
    const row = allRows[selectedIndex];

    const listing = normalizeListing(row);

    autofillBtn.disabled = true;
    const originalHtml = autofillBtn.innerHTML;
    autofillBtn.innerHTML = '<div class="spinner"></div> Filling...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'AUTOFILL',
        payload: listing,
      });

      if (response?.success) {
        showToast('Listing filled successfully!', 'success');
        statusDot.className = 'status-dot active';
        statusText.textContent = 'Autofill complete — review and submit';
      } else {
        throw new Error(response?.error || 'Unknown error from content script');
      }
    } catch (err) {
      const msg = err.message.includes('Could not establish connection')
        ? 'Refresh the Marketplace page and try again'
        : err.message;
      showToast(msg, 'error');
    } finally {
      autofillBtn.disabled = false;
      autofillBtn.innerHTML = originalHtml;
    }
  }

  function normalizeListing(row) {
    const g = (key) => getField(row, key);
    return {
      title: g('title'),
      price: g('price'),
      category: g('category'),
      condition: g('condition'),
      description: g('description'),
      location: g('location'),
      tags: g('tags'),
    };
  }

  function getField(row, key) {
    const col = columns.find((c) => c.toLowerCase() === key.toLowerCase());
    return col ? (row[col] || '') : '';
  }

  // ── Download template ──────────────────────────────────────────────────────
  async function handleDownloadTemplate() {
    try {
      const url  = chrome.runtime.getURL('sample-listings.xlsx');
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Template file not found — run setup.sh first');
      const blob    = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href        = blobUrl;
      a.download    = 'marketplace-listings-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast('Template downloaded!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ── Clear ──────────────────────────────────────────────────────────────────
  function handleClear() {
    updateSelection(-1);
    tableBody.querySelectorAll('tr.selected').forEach((tr) => tr.classList.remove('selected'));
  }

  // ── Persist state ──────────────────────────────────────────────────────────
  async function restoreState() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const state = data[STORAGE_KEY] || {};
    if (state.sheetsUrl) sheetsUrl.value = state.sheetsUrl;
    if (state.activeTab) {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      const btn = document.querySelector(`.tab-btn[data-tab="${state.activeTab}"]`);
      const panel = $id(`panel-${state.activeTab}`);
      if (btn) btn.classList.add('active');
      if (panel) panel.classList.add('active');
    }
    // Auto-reload sheets data if URL is saved
    if (state.sheetsUrl && state.source === 'sheets') {
      sheetsUrl.value = state.sheetsUrl;
      handleLoadSheets();
    }
  }

  function saveState(partial) {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const existing = data[STORAGE_KEY] || {};
      chrome.storage.local.set({ [STORAGE_KEY]: { ...existing, ...partial } });
    });
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = '<div class="spinner spinner-dark"></div>';
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
      btn.disabled = false;
    }
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 250);
    }, 2800);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + '…' : str;
  }
})();
