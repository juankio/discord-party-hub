import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const host = await context.newPage();
  
  console.log("Going to localhost...");
  await host.goto('http://localhost:3002');
  await host.waitForTimeout(2000);

  console.log("Filling input...");
  await host.fill('input[placeholder="Ej: Impostor"]', 'Capitan');
  
  console.log("Clicking Crear Sala...");
  // Using exact text for Crear Sala
  await host.click('button:has-text("Crear Sala")');
  
  await host.waitForURL('**/sala/**', { timeout: 10000 });
  console.log("Current URL:", host.url());

  console.log("Clicking UNO...");
  await host.click('button:has-text("UNO")');
  await host.waitForTimeout(1000);

  console.log("Adding Bots...");
  for(let i=0; i<4; i++) {
    await host.click('button[title="Añadir Bot"]');
    await host.waitForTimeout(200);
  }
  
  console.log("Clicking Empezar Partida...");
  await host.click('button:has-text("Empezar Partida")');
  
  console.log("Waiting for game...");
  await host.waitForURL('**/sala/**/uno', { timeout: 10000 });
  await host.waitForTimeout(4000); // wait for deal animation
  console.log("Game URL:", host.url());

  console.log("Saving desktop...");
  await host.screenshot({ path: 'qa-uno-desktop-final.png' });

  console.log("Saving mobile...");
  await host.setViewportSize({ width: 390, height: 844 });
  await host.waitForTimeout(1000);
  await host.screenshot({ path: 'qa-uno-mobile-final.png' });

  await browser.close();
  console.log("Done.");
}
run().catch(console.error);
