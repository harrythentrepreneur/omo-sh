import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { lookup } from 'mime-types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = join(__dirname, '..');
const PAPERS_DIR = __dirname;
const PORT = 8766;

const PAPERS = [
  { name: 'omo-space', file: 'omo-space.html' },
  { name: 'agentjam', file: 'agentjam.html' },
  { name: 'spoken-english', file: 'spoken-english.html' },
];

// Simple static file server
const server = createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  
  const filePath = join(SITE_DIR, urlPath);
  
  try {
    const data = readFileSync(filePath);
    const mime = lookup(filePath) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  } catch {
    // Try papers dir
    try {
      const altPath = join(PAPERS_DIR, urlPath.replace(/^\//, ''));
      const data = readFileSync(altPath);
      const mime = lookup(altPath) || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`Server on http://localhost:${PORT}`);

const browser = await chromium.launch({ headless: true });

for (const paper of PAPERS) {
  console.log(`\n📄 Generating ${paper.name}.pdf...`);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  
  const page = await context.newPage();
  
  const url = `http://localhost:${PORT}/papers/${paper.file}`;
  console.log(`   Loading: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // The paper sections use a `.reveal` class that starts at opacity:0 and is
  // only un-hidden by a JS IntersectionObserver when scrolled into view. That
  // never happens for off-screen content during a headless print, so force
  // every reveal element visible before printing (belt-and-suspenders — the
  // print stylesheet also handles this).
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  });

  // Render using the print stylesheet (@page A4 geometry, running headers, etc.)
  await page.emulateMedia({ media: 'print' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Small extra wait for rendering
  await page.waitForTimeout(800);

  const pdfPath = join(PAPERS_DIR, `${paper.name}.pdf`);
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    scale: 1,
    displayHeaderFooter: false,
    preferCSSPageSize: true,
  });
  
  const stats = statSync(pdfPath);
  const sizeKB = (stats.size / 1024).toFixed(0);
  console.log(`   ✅ ${paper.name}.pdf — ${sizeKB} KB`);
  
  await context.close();
}

await browser.close();
server.close();
console.log('\n🎉 All PDFs generated successfully!');
