#!/usr/bin/env node
// Copies xlsx.full.min.js from the locally installed npm package into lib/
'use strict';

const fs = require('fs');
const path = require('path');

const CANDIDATES = [
  path.join(__dirname, 'node_modules', 'xlsx', 'dist', 'xlsx.full.min.js'),
  path.join(__dirname, 'node_modules', 'xlsx', 'xlsx.js'),
];

const dest = path.join(__dirname, 'lib', 'xlsx.full.min.js');
fs.mkdirSync(path.join(__dirname, 'lib'), { recursive: true });

const src = CANDIDATES.find(fs.existsSync);
if (!src) {
  console.error('xlsx not found. Run: npm install');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`Copied xlsx → lib/xlsx.full.min.js (${fs.statSync(dest).size.toLocaleString()} bytes)`);
