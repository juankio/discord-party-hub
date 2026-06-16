const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 [Usopp] ¡Capitán! ¡Iniciando el test del tablero de 8 brazos para 2 jugadores!');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    
    // Create Contexts
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    let hostErrors = 0;
    let guestErrors = 0;

    hostPage.on('console', msg => {
      console.log(`[HOST CONSOLE] ${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error' && !msg.text().includes('404')) hostErrors++;
    });
    hostPage.on('pageerror', err => {
      console.error(`[HOST PAGE ERROR] ${err}`);
      hostErrors++;
    });

    guestPage.on('console', msg => {
      console.log(`[GUEST CONSOLE] ${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error' && !msg.text().includes('404')) guestErrors++;
    });
    guestPage.on('pageerror', err => {
      console.error(`[GUEST PAGE ERROR] ${err}`);
      guestErrors++;
    });

    console.log('🎯 [Usopp] Navegando el Host a http://localhost:3000');
    await hostPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await hostPage.waitForTimeout(2000);
    
    console.log('📝 [Usopp] Host: Introduciendo nickname "HostUsopp"');
    await hostPage.locator('input[placeholder="Ej: Impostor"], input[type="text"]').first().click();
    await hostPage.keyboard.type('HostUsopp', { delay: 10 });
    
    console.log('⚔️ [Usopp] Host: Haciendo click en "Crear Sala"');
    await hostPage.locator('button', { hasText: 'Crear Sala' }).first().click({ force: true });
    
    console.log('⏳ [Usopp] Host: Esperando navegación a la sala...');
    await hostPage.waitForURL(/\/sala\/.+/, { timeout: 10000 });
    const roomUrl = hostPage.url();
    console.log(`✅ [Usopp] ¡Sala creada! URL: ${roomUrl}`);

    console.log('🎯 [Usopp] Guest: Navegando a la sala...');
    await guestPage.goto(roomUrl, { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(2000);

    console.log('📝 [Usopp] Guest: Introduciendo nickname "GuestChopper"');
    await guestPage.locator('input[placeholder="Ej: Impostor"], input[type="text"]').first().click();
    await guestPage.keyboard.type('GuestChopper', { delay: 10 });

    console.log('⚔️ [Usopp] Guest: Haciendo click en "Entrar a Jugar"');
    await guestPage.locator('button', { hasText: 'Entrar a Jugar' }).first().click({ force: true });

    // Esperar a que el guest entre y el host lo vea
    await guestPage.waitForSelector('text=Esperando al Host...', { timeout: 10000 });
    console.log(`✅ [Usopp] Guest dentro de la sala correctamente.`);

    console.log('🎲 [Usopp] === SELECCIONANDO PARCHÍS ===');
    // Parchis is index 1
    await hostPage.locator('.custom-scrollbar button').nth(1).click();
    await hostPage.waitForTimeout(1000);

    console.log('🐙 [Usopp] Host: Seleccionando tablero de "8 Brazos"');
    // En las reglas del lobby, hacer click en 8
    await hostPage.locator('button', { hasText: /^8$/ }).first().click();
    await hostPage.waitForTimeout(1000);

    console.log('⚔️ [Usopp] Host: Haciendo click en "Empezar Partida"');
    await hostPage.locator('button', { hasText: 'Empezar Partida' }).first().click();

    console.log('⏳ [Usopp] Esperando la pantalla de selección de fichas...');
    await hostPage.waitForSelector('.figure-btn', { timeout: 15000 });
    await guestPage.waitForSelector('.figure-btn', { timeout: 15000 });

    console.log('👇 [Usopp] Host y Guest seleccionan sus fichas...');
    await hostPage.locator('.figure-btn:not(.opacity-50)').first().click();
    await guestPage.waitForTimeout(1000);
    await guestPage.locator('.figure-btn:not(.opacity-50):not(.animate-pulse)').last().click();

    console.log('⏳ [Usopp] Esperando a que cargue el tablero 3D de Parchís...');
    await hostPage.waitForSelector('text=Abandonar Partida', { timeout: 15000 });
    await guestPage.waitForSelector('text=Abandonar Partida', { timeout: 15000 });
    console.log('✅ [Usopp] Tablero de Parchís cargado para ambos.');

    await hostPage.waitForTimeout(5000); // Wait for board generation and animations
    
    console.log('📸 [Usopp] Tomando captura de pantalla: parchis-8-board-2-players.png');
    await hostPage.screenshot({ path: '/home/juankio/parchis-8-board-2-players.png' });
    console.log('📸 [Usopp] parchis-8-board-2-players.png guardado.');

    if (hostErrors > 0 || guestErrors > 0) {
      console.error(`😱 [Usopp] ¡Detectados errores en consola! Host: ${hostErrors}, Guest: ${guestErrors}`);
      throw new Error("Errores detectados en la consola del navegador.");
    }

    console.log('⚔️ [Usopp] Host: Abandonando Parchís...');
    await hostPage.locator('button', { hasText: 'Abandonar Partida' }).first().click();
    
    console.log('✅ [Usopp] Test de Parchís completado (el host abandonó la partida y la sala).');

    await browser.close();
    console.log('🎉 [Usopp] ¡Test completado con ÉXITO absoluto! ¡Mi instinto de francotirador nunca falla!');
    process.exit(0);
  } catch (error) {
    console.error('😱 [Usopp] ¡AAAAAH! ¡ERROR MORTAL DURANTE EL TEST! ¡SÁLVENSE QUIEN PUEDA!', error);
    if (browser) {
      const contexts = browser.contexts();
      if (contexts.length > 0 && contexts[0].pages().length > 0) {
        const html = await contexts[0].pages()[0].content();
        fs.writeFileSync('/home/juankio/host-page-error.html', html);
        await contexts[0].pages()[0].screenshot({ path: '/home/juankio/qa-error-host.png', fullPage: true }).catch(() => {});
      }
      if (contexts.length > 1 && contexts[1].pages().length > 0) {
        await contexts[1].pages()[0].screenshot({ path: '/home/juankio/qa-error-guest.png', fullPage: true }).catch(() => {});
      }
      await browser.close();
    }
    process.exit(1);
  }
})();