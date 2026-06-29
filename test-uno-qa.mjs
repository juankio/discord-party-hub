import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  
  // Create Desktop and Mobile contexts
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const mobileContext = await browser.newContext(devices['iPhone 12']);

  console.log("🚀 Iniciando QA de UNO...");

  const host = await desktopContext.newPage();
  
  // 1. Host crea la sala
  await host.goto('http://localhost:3000');
  await host.fill('input[placeholder="Ej: Impostor"]', 'Luffy');
  await host.click('button:has-text("Crear Sala")');
  await host.waitForTimeout(2000);
  
  // Obtener código de sala
  const url = host.url();
  const roomCode = url.split('/').pop();
  console.log(`✅ Sala creada: ${roomCode}`);

  // Cambiar a juego de UNO (por defecto suele estar en Parchís o ninguno, voy a forzar a UNO)
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  await host.waitForTimeout(1000);

  // 2. Conectar 3 rivales en Desktop (para ver desktop full UI)
  const rival1 = await desktopContext.newPage();
  await rival1.goto(`http://localhost:3000/${roomCode}`);
  await rival1.fill('input[placeholder="Ej: Impostor"]', 'Zoro');
  await rival1.click('button:has-text("Unirse")');
  
  const rival2 = await desktopContext.newPage();
  await rival2.goto(`http://localhost:3000/${roomCode}`);
  await rival2.fill('input[placeholder="Ej: Impostor"]', 'Sanji');
  await rival2.click('button:has-text("Unirse")');
  
  const rival3 = await desktopContext.newPage();
  await rival3.goto(`http://localhost:3000/${roomCode}`);
  await rival3.fill('input[placeholder="Ej: Impostor"]', 'Nami');
  await rival3.click('button:has-text("Unirse")');

  await host.waitForTimeout(2000);

  // 3. Iniciar Juego desde el Host
  console.log("🎲 Iniciando el UNO...");
  await host.click('button:has-text("Empezar")');
  await host.waitForTimeout(3000); // Esperar animación de cartas

  // Screenshot de Desktop
  await host.screenshot({ path: `qa-uno-desktop.png` });
  console.log(`📸 Desktop guardado.`);

  // 4. Ver qué pasa en Mobile con un quinto jugador? O usar la misma sala con un móvil
  const mobileRival = await mobileContext.newPage();
  await mobileRival.goto(`http://localhost:3000/${roomCode}`);
  await mobileRival.waitForTimeout(2000); // Ya empezó el juego, si recargo o entro ¿me deja mirar como espectador o me asume?
  // O simplemente hago un reload en movil de una sesión de un rival.
  
  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
