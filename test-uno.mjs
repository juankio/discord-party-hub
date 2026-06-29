import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  const host = await context.newPage();
  
  await host.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await host.waitForSelector('input[placeholder="Ej: Impostor"]', { state: 'visible' });
  await host.fill('input[placeholder="Ej: Impostor"]', 'Luffy');
  
  await host.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Crear Sala'));
    return btn && !btn.disabled;
  });
  
  await host.click('button:has-text("Crear Sala")');
  await host.waitForURL('**/sala/**');
  
  const url = host.url();
  const roomCode = url.split('/').pop();
  console.log(`Sala: ${roomCode}`);
  await browser.close();
}
runTests();
