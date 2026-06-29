import { chromium } from 'playwright';

(async () => {
  console.log('👑 [Usopp QA] ¡Iniciando mi gran script de pruebas visuales!');
  console.log('¡Con mis 8000 seguidores de Playwright, atacaremos el puerto 3000!');

  // Asegúrate de correr la app en otro terminal con: bun run dev
  const url = 'http://localhost:3000/sala/test-room/uno';

  console.log('Lanzando Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 1366 }, // iPad Pro dimensions
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  });
  
  const page = await context.newPage();

  console.log(`Navegando a ${url} ...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('¡Página cargada! Esperando a que el loader desaparezca si es que hay uno...');
    
    // Esperar a que la mesa se renderice (o un avatar/carta)
    await page.waitForSelector('.top-card-anim', { timeout: 15000 });
    console.log('¡La mesa está visible!');

    // Tomar el screenshot para evidencia visual
    await page.screenshot({ path: 'qa-ipad-view.png' });
    console.log('📸 ¡Foto tomada con mi Dial de Visión! (qa-ipad-view.png guardado)');

  } catch (error) {
    console.error('😱 ¡G-g-g-g-gasp! ¡Hubo un error cargando la página! ¿Será la enfermedad de "No-puedo-entrar-a-la-isla"?', error);
  } finally {
    await browser.close();
    console.log('🎯 Misión de script completada. (Browser cerrado)');
  }
})();
