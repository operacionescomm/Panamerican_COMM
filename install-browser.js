const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join(projectRoot, '.cache', 'puppeteer');
process.env.PUPPETEER_CACHE_DIR = cacheDir;

fs.mkdirSync(cacheDir, { recursive: true });

function browserCandidates() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);

  try {
    const puppeteer = require('puppeteer');
    const downloaded = puppeteer.executablePath();
    if (downloaded) candidates.unshift(downloaded);
  } catch (error) {
    // Durante ciertas fases de instalación Puppeteer aún puede no estar resoluble.
  }

  return candidates;
}

function findBrowser() {
  return browserCandidates().find(candidate => {
    try {
      return fs.existsSync(candidate);
    } catch (error) {
      return false;
    }
  }) || null;
}

const existingBrowser = findBrowser();
if (existingBrowser) {
  console.log(`[browser] Navegador disponible: ${existingBrowser}`);
  process.exit(0);
}

console.log(`[browser] Caché de Puppeteer: ${cacheDir}`);
console.log('[browser] No se encontró Chrome/Chromium. Instalando la versión compatible...');

try {
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npxCommand, ['--no-install', 'puppeteer', 'browsers', 'install', 'chrome'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env
  });

  const installedBrowser = findBrowser();
  if (!installedBrowser) {
    throw new Error('La instalación terminó, pero no se localizó el ejecutable de Chrome.');
  }

  console.log(`[browser] Chrome instalado correctamente: ${installedBrowser}`);
} catch (error) {
  console.error('[browser] No se pudo preparar Chrome:', error.message);
  console.error('[browser] Configura PUPPETEER_EXECUTABLE_PATH o ejecuta manualmente:');
  console.error('          npx puppeteer browsers install chrome');
  process.exit(1);
}
