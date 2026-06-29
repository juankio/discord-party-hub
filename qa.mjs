import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const host = await context.newPage();
  
  await host.goto('http://localhost:3002');
  await host.waitForTimeout(2000);

  // set name
  await host.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     if(input) {
       input.value = 'Capitan';
       input.dispatchEvent(new Event('input', { bubbles: true }));
     }
  });
  await host.waitForTimeout(500);

  // click create room
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Crear Sala'));
     if(btn) { btn.disabled = false; btn.click(); }
  });
  await host.waitForTimeout(2000);

  // select UNO
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('UNO'));
     if(btn) btn.click();
  });
  await host.waitForTimeout(1000);

  // add bots
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

  // click start
  await host.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Empezar Partida'));
     if(btn) btn.click();
  });
  await host.waitForTimeout(4000); // wait for deal animation

  // desktop shot
  await host.screenshot({ path: 'qa-uno-desktop-final.png' });

  // mobile shot
  await host.setViewportSize({ width: 390, height: 844 });
  await host.waitForTimeout(1000);
  await host.screenshot({ path: 'qa-uno-mobile-final.png' });

  await browser.close();
}
run().catch(console.error);
