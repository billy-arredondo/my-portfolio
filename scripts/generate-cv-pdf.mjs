import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { setTimeout } from 'timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'public', 'billy-arredondo-cv.pdf');
const PORT = 4322;

console.log('Building site...');
execSync('pnpm build', { cwd: root, stdio: 'inherit' });

console.log('Starting preview server...');
const preview = spawn('pnpm', ['preview', '--port', String(PORT)], {
  cwd: root,
  stdio: 'ignore',
  shell: true,
});

await setTimeout(3000);

console.log('Generating PDF...');
const browser = await chromium.launch();
const page = await browser.newPage();

await page.emulateMedia({ colorScheme: 'light', media: 'print' });
await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'networkidle' });

// Ensure light theme is applied before capture
await page.evaluate(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
});

await page.pdf({
  path: outputPath,
  format: 'A4',
  margin: { top: '16mm', right: '18mm', bottom: '16mm', left: '18mm' },
  printBackground: true,
});

await browser.close();
preview.kill();

console.log(`✓ PDF saved to public/billy-arredondo-cv.pdf`);
