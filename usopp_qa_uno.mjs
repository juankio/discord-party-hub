import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Create an iPad context
  const ipadContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const ipadPage = await ipadContext.newPage();
  
  console.log("iPad: Going to localhost...");
  await ipadPage.goto('http://localhost:3002');
  
  await ipadPage.waitForSelector('input[placeholder="Ej: Impostor"]', { timeout: 15000 });
  
  console.log("iPad: Setting name...");
  await ipadPage.fill('input[placeholder="Ej: Impostor"]', 'LuffyIPad');
  
  await ipadPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Crear Sala'));
     if(btn) { btn.disabled = false; btn.click(); }
  });
  
  await ipadPage.waitForURL('**/sala/**', { timeout: 10000 });
  await ipadPage.waitForTimeout(1500);
  
  console.log("iPad: Selecting UNO...");
  await ipadPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('UNO'));
     if(btn) btn.click();
  });
  await ipadPage.waitForTimeout(1000);

  console.log("iPad: Adding 7 bots...");
  await ipadPage.evaluate(() => {
     const btn = document.querySelector('button[title="Añadir Bot"]');
     if(btn) {
       for(let i=0; i<7; i++) {
           setTimeout(() => btn.click(), i * 150);
       }
     }
  });
  await ipadPage.waitForTimeout(2000);

  console.log("iPad: Empezar Partida...");
  await ipadPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Empezar Partida'));
     if(btn) btn.click();
  });
  
  await ipadPage.waitForURL('**/sala/**/uno', { timeout: 10000 });
  await ipadPage.waitForTimeout(4000); // Deal animation
  
  await ipadPage.screenshot({ path: 'qa-uno-ipad-perfect.png' });
  console.log("iPad screenshot saved.");

  // Mobile screenshot directly by resizing
  await ipadPage.setViewportSize({ width: 390, height: 844 });
  await ipadPage.waitForTimeout(1000);
  await ipadPage.screenshot({ path: 'qa-uno-mobile-perfect.png' });
  console.log("Mobile screenshot saved.");

  await browser.close();
}

run().catch(console.error);
