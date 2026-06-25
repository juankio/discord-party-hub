import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 12']; // 390x844

  console.log("🚀 Iniciando Verificación Definitiva de Parchís (4, 6 y 8) en Móvil...");

  for (const size of [4, 6, 8]) {
    console.log(`\n🔍 Probando tablero de ${size} Brazos...`);
    const hostContext = await browser.newContext(iPhone);
    const guestContext = await browser.newContext(iPhone);

    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    // Host
    await host.goto('http://localhost:3000');
    await host.fill('input[placeholder="Ej: Impostor"]', 'Host');
    await host.waitForTimeout(500);
    await host.click('button:has-text("Crear Sala")', {force: true});
    await host.waitForURL(/\/sala\/.+/);
    const roomId = host.url().split('/').pop();

    // Guest
    await guest.goto('http://localhost:3000');
    await guest.fill('input[placeholder="Ej: Impostor"]', 'Guest');
    await guest.waitForTimeout(500);
    await guest.click('button:has-text("Tengo Código")');
    await guest.fill('input[placeholder="CÓDIGO (5 LETRAS)"]', roomId);
    await guest.click('button:has-text("UNIRSE")');
    await guest.waitForURL(/\/sala\/.+/);
    
    // Esperar a que el host vea al guest
    await host.waitForSelector('text=Guest', { timeout: 10000 });

    // Host starts game
    await host.click('button:has-text("Parchís")');
    await host.waitForTimeout(1000); // UI transition

    await host.evaluate((s) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent.trim() === s.toString());
        if(b) b.click();
    }, size);
    
    await host.waitForTimeout(500);
    await host.click('button:has-text("Empezar Partida")');

    // Wait for board to render
    await host.waitForSelector('svg', { timeout: 10000 });
    await host.waitForTimeout(2000); // Let layout and anime.js settle

    const isOverflowing = await host.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (isOverflowing) {
        console.error(`❌ [${size}] FALLO: Scroll horizontal detectado.`);
        process.exit(1);
    } else {
        console.log(`✅ [${size}] Sin scroll horizontal.`);
    }

    const boardBox = await host.locator('svg').boundingBox();
    const hudBox = await host.locator('.max-w-\\[600px\\]').boundingBox();

    if (!boardBox || !hudBox) {
        console.error(`❌ [${size}] No se pudo medir la UI.`);
        process.exit(1);
    } else {
        const overlap = (boardBox.y + boardBox.height) - hudBox.y;
        if (overlap > 0) {
             console.error(`❌ [${size}] FALLO: El tablero se solapa con el HUD por ${overlap}px.`);
             process.exit(1);
        } else {
             console.log(`✅ [${size}] Perfectamente ubicado. Espacio libre entre tablero y controles: ${Math.abs(overlap).toFixed(2)}px.`);
        }
    }
    
    await host.screenshot({ path: `final-qa-${size}.png` });
    console.log(`📸 Evidencia guardada: final-qa-${size}.png`);

    await hostContext.close();
    await guestContext.close();
  }

  await browser.close();
  console.log("\n🏆 PRUEBA SUPERADA. JURAMENTO MANTENIDO.");
}

runTests().catch(e => {
  console.error("❌ ERROR CATASTRÓFICO:", e);
  process.exit(1);
});
