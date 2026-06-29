import { chromium } from 'playwright';
async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const host = await context.newPage();
  
  console.log("Going to localhost...");
  await host.goto('http://localhost:3002');
  console.log("Waiting...");
  await host.waitForTimeout(2000);

  console.log("Typing...");
  await host.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     if(input) {
       input.value = 'Capitan';
       input.dispatchEvent(new Event('input', { bubbles: true }));
     }
  });
  await host.waitForTimeout(500);

  console.log("Clicking Crear Sala...");
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Crear Sala'));
     if(btn) { btn.disabled = false; btn.click(); }
  });
  await host.waitForTimeout(2000);
  
  console.log("Current URL:", host.url());

  console.log("Clicking UNO...");
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('UNO'));
     if(btn) btn.click();
  });
  await host.waitForTimeout(1000);

  console.log("Adding Bots...");
  await host.evaluate(() => {
     const btn = document.querySelector('button[title="Añadir Bot"]');
     if(btn) {
       btn.click();
       setTimeout(() => btn.click(), 200);
       setTimeout(() => btn.click(), 400);
       setTimeout(() => btn.click(), 600); // 4 bots
     }
  });
  await host.waitForTimeout(1500);

  console.log("Clicking Empezar Partida...");
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Empezar Partida'));
     if(btn) btn.click();
  });
  console.log("Waiting for game...");
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
