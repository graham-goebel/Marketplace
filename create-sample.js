#!/usr/bin/env node
// Generates sample-listings.xlsx with dropdown validation for Category and Condition.
'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');

const OUT = path.join(__dirname, 'sample-listings.xlsx');

const CATEGORIES = [
  'Vehicles', 'Property Rentals', 'Apparel', 'Electronics',
  'Entertainment', 'Family', 'Free Stuff', 'Garden & Outdoor',
  'Hobbies', 'Home & Living', 'Home Improvement', 'Musical Instruments',
  'Office Supplies', 'Pet Supplies', 'Sporting Goods', 'Toys & Games',
];

const CONDITIONS = [
  'New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Used - Poor',
];

// Columns in order — each attribute is one column, each item is one row
const COLUMNS = [
  { header: 'title',       key: 'title',       width: 36 },
  { header: 'price',       key: 'price',       width: 10 },
  { header: 'category',    key: 'category',    width: 22 },
  { header: 'condition',   key: 'condition',   width: 20 },
  { header: 'description', key: 'description', width: 52 },
  { header: 'location',    key: 'location',    width: 14 },
  { header: 'tags',        key: 'tags',        width: 28 },
];

const SAMPLES = [
  {
    title: 'Vintage Leather Sofa',
    price: 350,
    category: 'Home & Living',
    condition: 'Used - Good',
    description: 'Beautiful 3-seater vintage leather sofa. Minor scuffs on armrests, smoke-free home. 84"W × 35"D × 32"H.',
    location: '90210',
    tags: 'furniture, sofa, leather, vintage',
  },
  {
    title: 'iPhone 14 Pro 256GB Space Black',
    price: 699,
    category: 'Electronics',
    condition: 'Used - Like New',
    description: 'Lightly used iPhone 14 Pro 256GB Space Black. Battery health 97%. Unlocked, original box & accessories included.',
    location: '10001',
    tags: 'iphone, apple, phone, unlocked',
  },
  {
    title: 'Trek FX3 Disc Hybrid Bike',
    price: 480,
    category: 'Sporting Goods',
    condition: 'Used - Good',
    description: '2022 Trek FX3 Disc, medium frame. Hydraulic disc brakes, 24-speed Shimano. Helmet and lock included.',
    location: '60614',
    tags: 'bike, bicycle, trek, commuter',
  },
  {
    title: 'IKEA KALLAX 4×4 Shelf White',
    price: 75,
    category: 'Home & Living',
    condition: 'Used - Good',
    description: 'IKEA KALLAX 4×4 shelf unit, white. Minor base scuffs. Disassembled for easy pickup. Inserts not included.',
    location: '77001',
    tags: 'ikea, shelf, storage, kallax',
  },
  {
    title: 'PlayStation 5 Disc Edition',
    price: 450,
    category: 'Electronics',
    condition: 'Used - Like New',
    description: 'PS5 disc edition, purchased Dec 2023. Includes all original cables and controller. No games.',
    location: '98101',
    tags: 'ps5, playstation, console, gaming',
  },
  {
    title: 'Canon EOS Rebel T8i + 18-55mm Lens',
    price: 420,
    category: 'Electronics',
    condition: 'Used - Good',
    description: '24.1MP DSLR, 4K video. Includes charger, 2 batteries, 16GB SD card and bag.',
    location: '30301',
    tags: 'camera, canon, dslr, photography',
  },
  {
    title: 'Motorized Standing Desk 60"×30"',
    price: 220,
    category: 'Home & Living',
    condition: 'Used - Like New',
    description: 'Electric sit-stand desk with memory presets. Bamboo top, black steel frame. Max load 275 lbs.',
    location: '94105',
    tags: 'desk, standing desk, office, ergonomic',
  },
  {
    title: 'Nike Air Max 270 Size 11',
    price: 65,
    category: 'Apparel',
    condition: 'Used - Good',
    description: 'Black/White colorway, men\'s size 11. Worn ~5 times. Minor toe box creasing, clean soles.',
    location: '33101',
    tags: 'shoes, nike, sneakers, air max',
  },
];

// ── Header styles ─────────────────────────────────────────────────────────────
const HEADER_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1877F2' } };
const ALT_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F2F5' } };
const HEADER_FONT  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
const BODY_FONT    = { size: 10, name: 'Calibri' };
const BORDER_BOTTOM = { style: 'thin', color: { argb: 'FF0F5BBD' } };

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator   = 'Marketplace Autofill';
  wb.created   = new Date();
  wb.modified  = new Date();

  // ── Sheet 1: Listings ───────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Listings', {
    views: [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }],
    properties: { defaultRowHeight: 18 },
  });

  ws.columns = COLUMNS;

  // Style header row
  const hdr = ws.getRow(1);
  hdr.height = 24;
  hdr.eachCell((cell) => {
    cell.font      = HEADER_FONT;
    cell.fill      = HEADER_FILL;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = { bottom: BORDER_BOTTOM };
  });

  // ── Dropdown: Category (col C = column 3) ───────────────────────────────────
  ws.dataValidations.add('C2:C10000', {
    type:           'list',
    allowBlank:     true,
    formulae:       [`"${CATEGORIES.join(',')}"`],
    showErrorMessage: true,
    errorStyle:     'warning',
    errorTitle:     'Invalid Category',
    error:          'Choose a category from the dropdown list.',
    showInputMessage: true,
    promptTitle:    'Category',
    prompt:         'Select a Facebook Marketplace category.',
  });

  // ── Dropdown: Condition (col D = column 4) ──────────────────────────────────
  ws.dataValidations.add('D2:D10000', {
    type:           'list',
    allowBlank:     true,
    formulae:       [`"${CONDITIONS.join(',')}"`],
    showErrorMessage: true,
    errorStyle:     'warning',
    errorTitle:     'Invalid Condition',
    error:          'Choose a condition from the dropdown list.',
    showInputMessage: true,
    promptTitle:    'Condition',
    prompt:         'New · Used - Like New · Used - Good · Used - Fair · Used - Poor',
  });

  // ── Sample data rows ─────────────────────────────────────────────────────────
  SAMPLES.forEach((item, i) => {
    const row = ws.addRow(item);
    row.height = 18;
    row.font   = BODY_FONT;
    row.alignment = { vertical: 'middle', wrapText: false };

    // Alternate row shading
    if (i % 2 === 1) {
      row.eachCell((cell) => { cell.fill = ALT_ROW_FILL; });
    }

    // Price: right-align, no decimals
    row.getCell('price').numFmt    = '#,##0';
    row.getCell('price').alignment = { horizontal: 'right', vertical: 'middle' };
  });

  // ── Sheet 2: Reference (hidden) ─────────────────────────────────────────────
  const ref = wb.addWorksheet('Reference', { state: 'hidden' });
  ref.getColumn(1).header = 'Categories';
  ref.getColumn(2).header = 'Conditions';
  CATEGORIES.forEach((c, i) => { ref.getCell(i + 2, 1).value = c; });
  CONDITIONS.forEach((c, i)  => { ref.getCell(i + 2, 2).value = c; });

  await wb.xlsx.writeFile(OUT);
  console.log(`Created ${OUT}`);
}

generate().catch((err) => { console.error(err.message); process.exit(1); });
