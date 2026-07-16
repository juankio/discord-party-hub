import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile context
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  
  console.log("Mobile: Going to localhost:3000...");
  await mobilePage.goto('http://localhost:3000');
  
  // Wait for the loader to disappear
  console.log("Mobile: Waiting for loader...");
  await mobilePage.waitForFunction(() => {
    const loader = document.querySelector('.app-loader');
    return !loader || window.getComputedStyle(loader).display === 'none' || window.getComputedStyle(loader).opacity === '0';
  }, { timeout: 15000 }).catch(() => console.log("Loader wait timeout, ignoring"));
  
  await mobilePage.waitForTimeout(2000);
  console.log("Mobile: Setting name...");
  await mobilePage.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     if(input) {
       input.value = 'LuffyMobile';
       input.dispatchEvent(new Event('input', { bubbles: true }));
     }
  });
  
  await mobilePage.waitForTimeout(1000);
  await mobilePage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Crear Sala'));
     if(btn) { btn.disabled = false; btn.click(); }
  });
  
  await mobilePage.waitForURL('**/sala/**', { timeout: 10000 }).catch(() => console.log("URL wait timeout, ignoring"));
  await mobilePage.waitForTimeout(1500);
  
  console.log("Mobile: Selecting UNO...");
  await mobilePage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('UNO'));
     if(btn) btn.click();
  });
  await mobilePage.waitForTimeout(1000);

  console.log("Mobile: Adding 7 bots...");
  await mobilePage.evaluate(() => {
     const btn = document.querySelector('button[title="Añadir Bot"]');
     if(btn) {
       for(let i=0; i<7; i++) {
           setTimeout(() => btn.click(), i * 150);
       }
     }
  });
  await mobilePage.waitForTimeout(2000);

  console.log("Mobile: Empezar Partida...");
  await mobilePage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Empezar Partida'));
     if(btn) btn.click();
  });
  
  await mobilePage.waitForURL('**/sala/**/uno', { timeout: 10000 }).catch(() => console.log("URL wait timeout, ignoring"));
  await mobilePage.waitForTimeout(4000); // Deal animation
  
  await mobilePage.screenshot({ path: 'qa-uno-mobile-vh.png' });
  console.log("Mobile screenshot saved.");

  await mobileContext.close();
  
  
  // iPad context
  const ipadContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const ipadPage = await ipadContext.newPage();
  
  console.log("iPad: Going to localhost:3000...");
  await ipadPage.goto('http://localhost:3000');
  
  // Wait for the loader to disappear
  console.log("iPad: Waiting for loader...");
  await ipadPage.waitForFunction(() => {
    const loader = document.querySelector('.app-loader');
    return !loader || window.getComputedStyle(loader).display === 'none' || window.getComputedStyle(loader).opacity === '0';
  }, { timeout: 15000 }).catch(() => console.log("Loader wait timeout, ignoring"));
  
  await ipadPage.waitForTimeout(2000);
  console.log("iPad: Setting name...");
  await ipadPage.evaluate(() => {
     const input = document.querySelector('input[placeholder="Ej: Impostor"]');
     if(input) {
       input.value = 'LuffyMobile';
       input.dispatchEvent(new Event('input', { bubbles: true }));
     }
  });
  
  await ipadPage.waitForTimeout(1000);
  await ipadPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('Crear Sala'));
     if(btn) { btn.disabled = false; btn.click(); }
  });
  
  await ipadPage.waitForURL('**/sala/**', { timeout: 10000 }).catch(() => console.log("URL wait timeout, ignoring"));
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
  
  await ipadPage.waitForURL('**/sala/**/uno', { timeout: 10000 }).catch(() => console.log("URL wait timeout, ignoring"));
  await ipadPage.waitForTimeout(4000); // Deal animation
  
  await ipadPage.screenshot({ path: 'qa-uno-ipad-vh.png' });
  console.log("iPad screenshot saved.");

  await browser.close();
}

run().catch(console.error);
