import { chromium } from 'playwright';

console.log(`\n🦁 Iniciando automatización en vivo en Brave Browser...`);
console.log(`El bot jugará de forma autónoma para que puedas observar y evaluar el juego.\n`);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/brave',
    headless: false,
    slowMo: 400, // Pausa natural para que cada acción sea claramente visible
    args: ['--start-maximized']
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log('1. Cargando http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);

  // 1. Configurar Nickname
  const nicknameInput = page.locator('input[placeholder="Ej: Impostor"]').first();
  if (await nicknameInput.isVisible()) {
    await nicknameInput.fill('JuankioVIP');
    await page.waitForTimeout(400);
  }

  // 2. Crear Sala
  const createBtn = page.locator('button', { hasText: 'Crear Sala' }).first();
  if (await createBtn.isVisible()) {
    console.log('2. Creando sala...');
    await createBtn.click();
    await page.waitForURL(/\/sala\//, { timeout: 15000 });
    console.log('   Sala abierta en:', page.url());
  }

  await page.waitForTimeout(1500);

  // 3. Seleccionar Parchís en el cajón de juegos
  console.log('3. Seleccionando Parchís...');
  const parchisBtn = page.locator('button', { hasText: 'Parchís' }).first();
  if (await parchisBtn.isVisible()) {
    await parchisBtn.hover();
    await page.waitForTimeout(400);
    await parchisBtn.click();
  }

  await page.waitForTimeout(1000);

  // 4. Añadir 1 bot en el Lobby
  console.log('4. Añadiendo bot rival...');
  const addBotBtn = page.locator('button', { hasText: 'Añadir Bot' }).first();
  if (await addBotBtn.isVisible()) {
    await addBotBtn.click();
  }

  await page.waitForTimeout(1200);

  // 5. Iniciar la partida
  console.log('5. Iniciando partida de Parchís...');
  const startBtn = page.locator('button', { hasText: 'Empezar Partida' }).first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForURL(/\/parchis/, { timeout: 15000 });
    console.log('   Entrando a la mesa de Parchís...');
  }

  // 6. Bucle de Juego Inteligente en Vivo
  console.log('\n🎲 Bucle de juego autónomo activado. Observando y jugando turnos...\n');

  let active = true;
  page.on('close', () => { active = false; });

  while (active) {
    try {
      // A. Fase: SELECCIONA TU FICHA
      const figureCard = page.locator('.figure-card').first();
      if (await figureCard.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('👉 Seleccionando ficha para el tablero...');
        await figureCard.click().catch(() => {});
        await page.waitForTimeout(1500);
      }

      // B. Fase: INICIATIVA (Tirar dados para orden)
      const rollInitBtn = page.locator('button', { hasText: 'TIRAR DADOS' }).first();
      const isInitVisible = await page.locator('text=INICIATIVA').isVisible({ timeout: 500 }).catch(() => false);
      if (isInitVisible && await rollInitBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('🎲 Tirando dados de iniciativa...');
        await rollInitBtn.click().catch(() => {});
        await page.waitForTimeout(2500);
      }

      // C. Fase: SELECCIÓN DE ASIENTO (Wedges en el tablero)
      const isChoosingSeats = await page.evaluate(() => {
        return (window as any).$nuxt?.$pinia?.state?.value?.parchis?.gameState === 'CHOOSING_SEATS' || 
               document.body.innerText.includes('SELECCIONA TU ASIENTO');
      }).catch(() => false);

      if (isChoosingSeats) {
        console.log('🪑 Seleccionando territorio en el tablero...');
        // Buscar polígono de wedge clickeable
        const clickableWedge = page.locator('g.cursor-pointer polygon, g.cursor-pointer').first();
        if (await clickableWedge.isVisible({ timeout: 500 }).catch(() => false)) {
          await clickableWedge.click({ force: true }).catch(() => {});
        } else {
          // Fallback a cualquier g de wedge disponible
          const anyWedge = page.locator('svg polygon').nth(2);
          if (await anyWedge.isVisible().catch(() => false)) {
            await anyWedge.click({ force: true }).catch(() => {});
          }
        }
        await page.waitForTimeout(2000);
      }

      // D. Fase: JUEGO ACTIVO (PLAYING)
      // D1. ¿Es mi turno y puedo tirar dados?
      const rollDiceBtn = page.locator('button:has-text("TIRAR DADOS")').first();
      if (await rollDiceBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        const isEnabled = await rollDiceBtn.isEnabled().catch(() => false);
        if (isEnabled) {
          console.log('🎲 ¡Es mi turno! Tirando dados...');
          await rollDiceBtn.click().catch(() => {});
          await page.waitForTimeout(1500);
        }
      }

      // D2. ¿Hay fichas clickeables para mover?
      const clickableToken = page.locator('.parchis-token .animate-pulse, .parchis-token.cursor-pointer, .parchis-token').first();
      if (await clickableToken.isVisible({ timeout: 400 }).catch(() => false)) {
        // Verificar si tenemos movimientos disponibles
        const hasMoves = await page.evaluate(() => {
          const store = (window as any).$nuxt?.$pinia?.state?.value?.parchis;
          return (store?.availableMoves?.length || 0) > 0 && store?.isMyTurn;
        }).catch(() => false);

        if (hasMoves) {
          console.log('♟️ Moviendo ficha en el tablero...');
          // Buscar token pulsante o token del jugador
          const activeToken = page.locator('.token-body.animate-pulse, .parchis-token').first();
          if (await activeToken.isVisible({ timeout: 500 }).catch(() => false)) {
            await activeToken.click({ force: true }).catch(() => {});
            await page.waitForTimeout(1200);
          }
        }
      }

      // Espera antes del siguiente ciclo
      await page.waitForTimeout(1200);
    } catch (e) {
      // Ignorar errores transitorios de UI durante transiciones
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();
})();
