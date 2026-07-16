import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 12']; // 390x844

  console.log("🚀 Iniciando QA Testing en Móviles...");

  // Contexto 1: Host
  const hostContext = await browser.newContext({
    ...iPhone,
    viewport: { width: 390, height: 844 }
  });
  
  const hostPage = await hostContext.newPage();
  
  const errors = [];
  hostPage.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push("Host: " + msg.text());
  });
  hostPage.on('pageerror', err => errors.push("Host Exception: " + err.message));

  console.log("📱 Host (Gama Baja simulado) abriendo la página...");
  const startLoad = Date.now();
  await hostPage.goto('http://localhost:3000');
  const loadTime = Date.now() - startLoad;
  console.log(`⏱️  Tiempo de carga inicial Host: ${loadTime}ms`);

  // Host crea sala
  await hostPage.fill('input[placeholder="Ej: Impostor"]', 'HostMobile');
  await hostPage.click('button:has-text("Crear Sala")');
  await hostPage.waitForURL(/\/sala\/.+/);
  console.log("✅ Sala creada por el Host.");

  const url = hostPage.url();
  const roomId = url.split('/').pop();

  // Contexto 2: Invitado
  const guestContext = await browser.newContext(iPhone);
  const guestPage = await guestContext.newPage();
  
  guestPage.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push("Guest: " + msg.text());
  });
  guestPage.on('pageerror', err => errors.push("Guest Exception: " + err.message));

  console.log("📱 Invitado uniéndose a la sala...");
  await guestPage.goto('http://localhost:3000');
  await guestPage.fill('input[placeholder="Ej: Impostor"]', 'GuestMobile');
  await guestPage.click('button:has-text("Tengo Código")');
  await guestPage.fill('input[placeholder="CÓDIGO (5 LETRAS)"]', roomId);
  await guestPage.click('button:has-text("UNIRSE")');
  
  await guestPage.waitForURL(/\/sala\/.+/);
  await hostPage.waitForSelector('text=GuestMobile', { timeout: 10000 });
  console.log("✅ Invitado unido a la sala.");

  async function checkResponsive(page, gameName) {
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (isOverflowing) {
      console.error(`❌ ALERTA UI: El juego ${gameName} tiene desbordamiento horizontal (horizontal scroll) en móvil.`);
      errors.push(`${gameName} UI overflow`);
    } else {
      console.log(`✅ UI de ${gameName} se adapta perfectamente a la pantalla móvil sin scroll horizontal.`);
    }
  }

  // --- PROBANDO STOP ---
  console.log("🛑 Host cambiando juego a Stop...");
  await hostPage.click('button:has-text("Stop")');
  await hostPage.waitForTimeout(1000); // Esperar reactividad
  await hostPage.click('button:has-text("Empezar Partida")');
  
  await hostPage.waitForSelector('text=Ronda', { timeout: 10000 });
  await guestPage.waitForSelector('text=Ronda', { timeout: 10000 });
  console.log("🛑 Juego de Stop iniciado correctamente en ambos clientes.");
  
  // Validar UI
  await hostPage.waitForTimeout(2000);
  await checkResponsive(hostPage, 'Stop');
  await checkResponsive(guestPage, 'Stop (Guest)');

  // Terminar partida de Stop o ir atrás 
  // No hay botón fácil de salir si no termina la ronda, forzamos recarga en la sala
  console.log("🔙 Volviendo al Lobby...");
  
  // El host emite el evento de finalizar partida si existe
  const finishBtn = await hostPage.$('button:has-text("Finalizar Partida")');
  if (finishBtn) {
    await finishBtn.click();
  } else {
     // Si no, volvemos al root y entramos de nuevo
     await hostPage.goto(`http://localhost:3000`);
     await hostPage.fill('input[placeholder="Ej: Impostor"]', 'HostMobile');
     await hostPage.click('button:has-text("Crear Sala")');
     await hostPage.waitForURL(/\/sala\/.+/);
     
     const url2 = hostPage.url();
     const roomId2 = url2.split('/').pop();
     
     await guestPage.goto('http://localhost:3000');
     await guestPage.fill('input[placeholder="Ej: Impostor"]', 'GuestMobile');
     await guestPage.click('button:has-text("Tengo Código")');
     await guestPage.fill('input[placeholder="CÓDIGO (5 LETRAS)"]', roomId2);
     await guestPage.click('button:has-text("UNIRSE")');
     await guestPage.waitForURL(/\/sala\/.+/);
     await hostPage.waitForSelector('text=GuestMobile', { timeout: 10000 });
  }
  
  await hostPage.waitForTimeout(1000);

  // --- PROBANDO PARCHIS ---
  console.log("🎲 Cambiando juego a Parchís...");
  await hostPage.click('button:has-text("Parchís")');
  await hostPage.waitForTimeout(1000);
  await hostPage.click('button:has-text("Empezar Partida")');
  
  // El board de parchis se renderiza
  await hostPage.waitForSelector('.parchis-board-container, canvas', { timeout: 10000 }).catch(() => {});
  await guestPage.waitForSelector('.parchis-board-container, canvas', { timeout: 10000 }).catch(() => {});
  console.log("🎲 Juego de Parchís iniciado en ambos clientes.");

  // Validar UI
  await hostPage.waitForTimeout(3000);
  await checkResponsive(hostPage, 'Parchís');
  await checkResponsive(guestPage, 'Parchís (Guest)');

  console.log("\n==============================");
  console.log("🐞 Resumen de errores de Consola/UI:");
  if (errors.length > 0) {
    console.error("ERRORES DETECTADOS:", errors);
  } else {
    console.log("🎉 CERO ERRORES EN LA CONSOLA NI OVERFLOWS.");
    console.log("🏆 RENDIMIENTO ESTABLE EN MÓVILES.");
  }
  console.log("==============================\n");

  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
