import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  const host = await context.newPage();
  
  await host.goto('http://localhost:3002');
  
  // Wait for the Nuxt app to hydrate
  await host.waitForFunction(() => window.__NUXT__ !== undefined);
  await host.waitForTimeout(1000); // give it a sec

  // Fill using evaluate to trigger events correctly
  await host.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     input.value = 'Luffy';
     input.dispatchEvent(new Event('input', { bubbles: true }));
     
     // Also update pinia directly just in case
     const playerStore = window.__NUXT__?.pinia?.state?.value?.player;
     if(playerStore) playerStore.nickname = 'Luffy';
  });
  
  await host.waitForTimeout(500);

  // force click 
  await host.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Crear Sala'));
     if(btn) {
       btn.disabled = false;
       btn.click();
     }
  });

  console.log("Esperando url de sala...");
  await host.waitForURL('**/sala/**', { timeout: 10000 });
  const roomCode = host.url().split('/').pop();
  console.log("Sala: ", roomCode);

  await host.waitForTimeout(2000);

  // Host should now be in lobby. 
  // Select UNO
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  
  await host.waitForTimeout(1000);

  // Add 3 bots
  await host.evaluate(() => {
     const btn = document.querySelector('button[title="Añadir Bot"]');
     if(btn) {
       btn.click();
       setTimeout(() => btn.click(), 200);
       setTimeout(() => btn.click(), 400);
     }
  });

  await host.waitForTimeout(1500);
  
  // Click Empezar Partida
  await host.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Empezar Partida'));
     if (btn) btn.click();
  });
  
  console.log("Esperando interfaz de juego...");
  await host.waitForURL('**/sala/**/uno', { timeout: 10000 });
  
  // Wait for initial dealing animations (usually ~3s)
  await host.waitForTimeout(4000);
  
  // Full desktop screenshot
  await host.screenshot({ path: 'qa-uno-desktop-force.png' });
  console.log("Desktop guardado");

  // Mobile screenshot
  await host.setViewportSize({ width: 390, height: 844 });
  await host.waitForTimeout(1000);
  await host.screenshot({ path: 'qa-uno-mobile-force.png' });
  console.log("Mobile guardado");

  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
