import { chromium, devices } from 'playwright';
import fetch from 'node-fetch';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  // Create room directly via API
  const roomRes = await fetch('http://localhost:3001/api/rooms/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ userId: 'host-123' })
  }).then(r => r.json());
  
  const roomCode = roomRes.data.roomId;
  console.log("Sala creada por API:", roomCode);

  const host = await desktopContext.newPage();
  await host.goto('http://localhost:3000');
  
  // Set localStorage directly to bypass the setup modal
  await host.evaluate(() => {
     localStorage.setItem('partyhub_player', JSON.stringify({
         userId: 'host-123',
         nickname: 'Luffy',
         avatarId: 1,
         color: '#ff0000',
         isLoggedIn: false
     }));
  });
  
  // Now navigate to the room
  await host.goto(`http://localhost:3000/sala/${roomCode}`);
  
  console.log("Esperando interfaz de sala...");
  await host.waitForTimeout(2000); // give time for socket connection

  // Select UNO
  console.log("Seleccionando UNO...");
  await host.evaluate(() => {
     const elements = Array.from(document.querySelectorAll('.custom-scrollbar button'));
     const unoBtn = elements.find(el => el.textContent.includes('UNO'));
     if (unoBtn) unoBtn.click();
  });
  
  await host.waitForTimeout(1000);
  
  // Click "Añadir Bot" 3 times
  console.log("Añadiendo bots...");
  const btnBot = host.locator('button[title="Añadir Bot"]');
  await btnBot.click();
  await host.waitForTimeout(500);
  await btnBot.click();
  await host.waitForTimeout(500);
  await btnBot.click();
  
  await host.waitForTimeout(1000);

  // Start UNO
  console.log("Iniciando partida...");
  await host.click('button:has-text("Empezar Partida")');
  
  // Wait for game route
  console.log("Esperando interfaz de juego...");
  await host.waitForURL('**/sala/**/uno', { timeout: 10000 });
  await host.waitForTimeout(4000); // Wait for cards animation to settle
  
  // Screenshot desktop
  await host.screenshot({ path: `qa-uno-desktop-api.png` });
  console.log("Screenshot desktop tomado: qa-uno-desktop-api.png");

  // Screenshot mobile simulating viewport
  await host.setViewportSize({ width: 390, height: 844 });
  await host.waitForTimeout(1000); 
  await host.screenshot({ path: `qa-uno-mobile-api.png` });
  console.log("Screenshot mobile tomado: qa-uno-mobile-api.png");

  await browser.close();
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
