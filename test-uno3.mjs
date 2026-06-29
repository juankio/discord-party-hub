import { chromium, devices } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  const host = await desktopContext.newPage();
  
  await host.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // Set Pinia store state directly and create room via evaluate
  await host.evaluate(async () => {
     const playerStore = window.__NUXT__?.pinia?.state?.value?.player;
     if (playerStore) {
        playerStore.nickname = 'Luffy';
        playerStore.avatarId = 1;
        playerStore.userId = 'luffy-123';
        playerStore.isLoggedIn = true;
     }
  });

  // Since it's a bit tricky to navigate, let's just use the API to create a room.
  const roomRes = await host.evaluate(async () => {
      const res = await fetch('http://localhost:3001/api/rooms/create', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: 'luffy-123' })
      }).then(r => r.json());
      return res;
  });
  
  const roomCode = roomRes.data.roomId;
  console.log("Room created: ", roomCode);
  
  // Now navigate to the room directly
  await host.goto(`http://localhost:3000/sala/${roomCode}`);
  
  // Create rivals
  const rivals = [
      { id: 'zoro-123', name: 'Zoro', avatarId: 2 },
      { id: 'sanji-123', name: 'Sanji', avatarId: 3 },
      { id: 'nami-123', name: 'Nami', avatarId: 4 }
  ];
  
  const pages = [];
  for(let r of rivals) {
      const p = await desktopContext.newPage();
      await p.goto(`http://localhost:3000`);
      await p.evaluate((rival) => {
         const playerStore = window.__NUXT__?.pinia?.state?.value?.player;
         if (playerStore) {
            playerStore.nickname = rival.name;
            playerStore.avatarId = rival.avatarId;
            playerStore.userId = rival.id;
            playerStore.isLoggedIn = true;
         }
      }, r);
      await p.goto(`http://localhost:3000/sala/${roomCode}`);
      await p.waitForTimeout(1000);
      pages.push(p);
  }

  // Switch to UNO game on Host
  await host.bringToFront();
  await host.waitForTimeout(1000);
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  
  await host.waitForTimeout(1000);
  
  // Start UNO
  await host.click('button:has-text("Empezar")');
  await host.waitForTimeout(3000); // Wait for cards to deal
  
  await host.screenshot({ path: `qa-uno-desktop-real.png` });
  console.log("Screenshot host desktop taken");
  
  // Mobile test
  const iPhone = devices['iPhone 12'];
  const mobileContext = await browser.newContext(iPhone);
  const mobilePage = await mobileContext.newPage();
  
  await mobilePage.goto(`http://localhost:3000`);
  await mobilePage.evaluate(() => {
         const playerStore = window.__NUXT__?.pinia?.state?.value?.player;
         if (playerStore) {
            playerStore.nickname = 'Usopp';
            playerStore.avatarId = 5;
            playerStore.userId = 'usopp-123';
            playerStore.isLoggedIn = true;
         }
  });
  // Usopp is a spectator? Or he joins? The game already started. UNO doesn't allow joining mid-game usually.
  // Actually, we just want to see how the UI looks on mobile. So let's look at one of the existing players on mobile size!
  await pages[0].setViewportSize({ width: 390, height: 844 }); // Zoro on mobile
  await pages[0].waitForTimeout(1000);
  await pages[0].screenshot({ path: `qa-uno-mobile-real.png` });
  console.log("Screenshot rival mobile taken");

  await browser.close();
}
runTests();
