import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  const host = await desktopContext.newPage();
  
  await host.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await host.waitForSelector('input[placeholder="Ej: Impostor"]', { state: 'visible' });
  
  // Fill input
  await host.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     input.value = 'Luffy';
     input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  await host.waitForTimeout(500);
  await host.click('button:has-text("Crear Sala")');
  
  console.log("Esperando sala...");
  await host.waitForURL('**/sala/**', { timeout: 10000 });
  const url = host.url();
  const roomCode = url.split('/').pop();
  console.log(`Sala creada: ${roomCode}`);

  await host.waitForTimeout(2000); // Wait for modal/animations
  
  // Select UNO
  console.log("Seleccionando UNO...");
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  
  await host.waitForTimeout(1000);
  
  // Click "Añadir Bot" 3 times
  console.log("Añadiendo bots...");
  const btnBot = host.locator('button[title="Añadir Bot"]');
  await btnBot.click();
  await host.waitForTimeout(500);
  await btnBot.click();
  await host.waitForTimeout(500);
  await btnBot.click();
  
  await host.waitForTimeout(1000);

  // Start UNO
  console.log("Iniciando partida...");
  await host.click('button:has-text("Empezar Partida")');
  
  // Wait for game route
  console.log("Esperando interfaz de juego...");
  await host.waitForURL('**/sala/**/uno', { timeout: 10000 });
  await host.waitForTimeout(3000); // Wait for animations
  
  // Screenshot desktop
  await host.screenshot({ path: `qa-uno-desktop-bots.png` });
  console.log("Screenshot desktop tomado: qa-uno-desktop-bots.png");

  // Screenshot mobile simulating viewport
  await host.setViewportSize({ width: 390, height: 844 });
  await host.waitForTimeout(1000); // give it time to resize
  await host.screenshot({ path: `qa-uno-mobile-bots.png` });
  console.log("Screenshot mobile tomado: qa-uno-mobile-bots.png");

  await browser.close();
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
