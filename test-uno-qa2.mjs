import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  
  // Create Desktop and Mobile contexts
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  console.log("🚀 Iniciando QA de UNO...");

  const host = await desktopContext.newPage();
  
  // 1. Host crea la sala
  await host.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await host.fill('input[placeholder="Ej: Impostor"]', 'Luffy');
  await host.click('button:has-text("Crear Sala")');
  await host.waitForTimeout(2000);
  
  // Obtener código de sala
  const url = host.url();
  const roomCode = url.split('/').pop();
  console.log(`✅ Sala creada: ${roomCode}`);

  // Cambiar a juego de UNO
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  await host.waitForTimeout(1000);

  // 2. Conectar 3 rivales en Desktop
  console.log("👥 Conectando rival 1...");
  const rival1 = await desktopContext.newPage();
  await rival1.goto(`http://localhost:3000/${roomCode}`, { waitUntil: 'domcontentloaded' });
  await rival1.fill('input[placeholder="Ej: Impostor"]', 'Zoro');
  await rival1.click('button:has-text("Unirse")');
  await rival1.waitForTimeout(1000);

  console.log("👥 Conectando rival 2...");
  const rival2 = await desktopContext.newPage();
  await rival2.goto(`http://localhost:3000/${roomCode}`, { waitUntil: 'domcontentloaded' });
  await rival2.fill('input[placeholder="Ej: Impostor"]', 'Sanji');
  await rival2.click('button:has-text("Unirse")');
  await rival2.waitForTimeout(1000);

  console.log("👥 Conectando rival 3...");
  const rival3 = await desktopContext.newPage();
  await rival3.goto(`http://localhost:3000/${roomCode}`, { waitUntil: 'domcontentloaded' });
  await rival3.fill('input[placeholder="Ej: Impostor"]', 'Nami');
  await rival3.click('button:has-text("Unirse")');
  await rival3.waitForTimeout(1000);

  // 3. Iniciar Juego desde el Host
  console.log("🎲 Iniciando el UNO...");
  await host.bringToFront();
  await host.waitForTimeout(1000);
  await host.click('button:has-text("Empezar")');
  await host.waitForTimeout(3000);

  // Screenshot de Desktop
  await host.screenshot({ path: `qa-uno-desktop.png` });
  console.log(`📸 Desktop guardado.`);

  // Mobile screenshot
  const iPhone = devices['iPhone 12'];
  const mobileContext = await browser.newContext({ ...iPhone });
  const mobilePage = await mobileContext.newPage();
  console.log("📱 Verificando vista en Móvil...");
  // Use rival1's session / just enter and watch
  // Wait, no session sharing unless using same context, so let's join as rival 4.
  await mobilePage.goto(`http://localhost:3000/${roomCode}`, { waitUntil: 'domcontentloaded' });
  await mobilePage.fill('input[placeholder="Ej: Impostor"]', 'Usopp');
  await mobilePage.click('button:has-text("Unirse")');
  await mobilePage.waitForTimeout(3000);
  await mobilePage.screenshot({ path: `qa-uno-mobile.png` });
  console.log(`📸 Móvil guardado.`);
  
  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
