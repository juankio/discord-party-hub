import { chromium } from 'playwright';

console.log(`\n🦁 Iniciando automatización en vivo en Brave Browser...`);
console.log(`Observa tu pantalla: el bot automatizado jugará los turnos de Parchís de forma continua.\n`);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/brave',
    headless: false,
    slowMo: 450,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log('1. Cargando http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);

  // 1. Configurar Nickname
  const nicknameInput = page.locator('input[placeholder="Ej: Impostor"]').first();
  if (await nicknameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nicknameInput.fill('JuankioVIP');
    await page.waitForTimeout(400);
  }

  // 2. Crear Sala
  const createBtn = page.locator('button', { hasText: 'Crear Sala' }).first();
  if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('2. Creando sala...');
    await createBtn.click();
    await page.waitForURL(/\/sala\//, { timeout: 15000 });
    console.log('   Sala abierta en:', page.url());
  }

  await page.waitForTimeout(1500);

  // 3. Seleccionar Parchís en el estante
  console.log('3. Seleccionando Parchís...');
  const parchisBtn = page.locator('button', { hasText: 'Parchís' }).first();
  if (await parchisBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await parchisBtn.hover();
    await page.waitForTimeout(400);
    await parchisBtn.click();
  }

  await page.waitForTimeout(1000);

  // 4. Añadir bot rival
  console.log('4. Añadiendo bot rival...');
  const addBotBtn = page.locator('button', { hasText: 'Añadir Bot' }).first();
  if (await addBotBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addBotBtn.click();
  }

  await page.waitForTimeout(1200);

  // 5. Iniciar la partida
  console.log('5. Iniciando partida de Parchís...');
  const startBtn = page.locator('button', { hasText: 'Empezar Partida' }).first();
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForURL(/\/parchis/, { timeout: 15000 });
    console.log('   Entrando al tablero de Parchís...');
  }

  // 6. Bucle de Juego Autónomo Continuo
  console.log('\n🎲 Bucle de juego activo en Brave. Ejecutando turnos en vivo...\n');

  let active = true;
  page.on('close', () => { 
    active = false; 
    console.log('Ventana cerrada por el usuario.');
  });

  while (active) {
    try {
      // A. Fase: SELECCIONA TU FICHA
      const figureCard = page.locator('.figure-card').first();
      if (await figureCard.isVisible({ timeout: 400 }).catch(() => false)) {
        console.log('👉 Seleccionando figura para dominar el tablero...');
        await figureCard.click().catch(() => {});
        await page.waitForTimeout(1500);
      }

      // B. Fase: INICIATIVA (Tirar dados de orden)
      const rollInitBtn = page.locator('button', { hasText: 'TIRAR DADOS' }).first();
      const isInitModal = await page.locator('text=INICIATIVA').isVisible({ timeout: 400 }).catch(() => false);
      if (isInitModal && await rollInitBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        console.log('🎲 Tirando dados de iniciativa...');
        await rollInitBtn.click().catch(() => {});
        await page.waitForTimeout(2500);
      }

      // C. Fase: SELECCIÓN DE ASIENTO (Wedges en el tablero)
      const isChoosingSeats = await page.locator('.animate-float-token, text=territorio').first().isVisible({ timeout: 400 }).catch(() => false);
      if (isChoosingSeats) {
        // Clic directo en el polígono de territorio rojo o disponible
        const wedge = page.locator('polygon[fill="#ef4444"], g.cursor-pointer polygon, g.cursor-pointer').first();
        if (await wedge.isVisible({ timeout: 500 }).catch(() => false)) {
          console.log('🪑 ¡Eligiendo territorio en el tablero!');
          await wedge.click({ force: true }).catch(() => {});
          await page.waitForTimeout(1800);
        }
      }

      // D. Fase: JUEGO ACTIVO (PLAYING)
      // D1. Tirar dados si es mi turno
      const rollDiceBtn = page.locator('button:has-text("TIRAR DADOS")').first();
      if (await rollDiceBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        const isEnabled = await rollDiceBtn.isEnabled().catch(() => false);
        if (isEnabled) {
          console.log('🎲 ¡Es mi turno! Tirando dados en el HUD...');
          await rollDiceBtn.click().catch(() => {});
          await page.waitForTimeout(1500);
        }
      }

      // D2. Mover ficha si hay dados disponibles
      const hasMoves = await page.locator('text=MUEVE:').isVisible({ timeout: 400 }).catch(() => false);
      if (hasMoves) {
        console.log('♟️ ¡Tirada disponible! Seleccionando ficha para mover...');
        const tokenToMove = page.locator('.token-body.animate-pulse, .parchis-token').first();
        if (await tokenToMove.isVisible({ timeout: 500 }).catch(() => false)) {
          await tokenToMove.click({ force: true }).catch(() => {});
          await page.waitForTimeout(1500);
        }
      }

      await page.waitForTimeout(1000);
    } catch (e) {
      await page.waitForTimeout(1000);
    }
  }

  await browser.close().catch(() => {});
})();
