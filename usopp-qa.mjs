import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  // Set viewport standard for testing
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  const host = await context.newPage();
  
  await host.goto('http://localhost:3000');
  
  await host.waitForFunction(() => window.__NUXT__ !== undefined);
  await host.waitForTimeout(1000);

  await host.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     if(input) {
         input.value = 'Usopp';
         input.dispatchEvent(new Event('input', { bubbles: true }));
     }
  });
  
  await host.waitForTimeout(500);

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

  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  
  await host.waitForTimeout(1000);

  await host.evaluate(() => {
     const btn = document.querySelector('button[title="Añadir Bot"]');
     if(btn) {
       btn.click();
       setTimeout(() => btn.click(), 200);
       setTimeout(() => btn.click(), 400);
     }
  });

  await host.waitForTimeout(1500);
  
  await host.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Empezar Partida'));
     if (btn) btn.click();
  });
  
  console.log("Esperando interfaz de juego...");
  await host.waitForURL('**/sala/**/uno', { timeout: 10000 });
  
  // Wait for initial dealing animations
  await host.waitForTimeout(5000);
  
  // Save screenshots
  await host.screenshot({ path: 'qa-mesa-compacta.png' });
  console.log("Mesa guardada (qa-mesa-compacta.png)");

  await host.screenshot({ path: 'qa-radial-corregido.png' });
  console.log("Radial guardado (qa-radial-corregido.png)");

  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
