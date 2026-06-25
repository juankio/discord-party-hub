import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 12']; // 390x844

  console.log("🚀 Verificando Centrado Vertical de Parchís en Móvil...");

  const hostContext = await browser.newContext(iPhone);
  const host = await hostContext.newPage();

  console.log("📱 Host abriendo la aplicación...");
  await host.goto('http://localhost:3000');
  
  // Login as Host
  await host.fill('input[placeholder="Ej: Impostor"]', 'HostParchis');
  await host.waitForTimeout(1000); 
  await host.click('button:has-text("Crear Sala")', { force: true });
  await host.waitForTimeout(2000);
  console.log("✅ Sala creada.");

  // Cambiar a Parchís primero en el Host (solo necesitas 1 para test visual del tablero de parche de CSS)
  console.log("🎲 Cambiando a Parchís...");
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const parchisBtn = elements.find(el => el.textContent.includes('PARCHÍS'));
     if (parchisBtn) parchisBtn.click();
  });
  
  await host.waitForTimeout(1000); 

  // Forzaremos el inicio del juego vía el dom para hacer visible el .parchis-board-container
  console.log(`🚀 Forzando renderizado de la mesa de 8 brazos usando mock local...`);
  await host.evaluate(() => {
    window.__MOCK_BOARD_SIZE__ = 8;
    const parchisStore = window.__NUXT__?.pinia?.state?.value?.parchis;
    if (parchisStore) {
      parchisStore.gameState = 'PLAYING';
      parchisStore.rules = { parchisBoardSize: 8 };
      parchisStore.players = [
        { userId: '1', color: 'red', tokens: [] },
        { userId: '2', color: 'blue', tokens: [] }
      ];
    }
  });
  
  // Esperar a que renderice
  await host.waitForTimeout(2000);

  // Take screenshot
  await host.screenshot({ path: `qa-parchis-centered.png` });
  console.log(`📸 Captura guardada como qa-parchis-centered.png. Comprueba si está bien centrado.`);

  await browser.close();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
