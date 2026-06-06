import { chromium } from 'playwright';
import fs from 'fs';

const html = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 1200px;
      height: 630px;
      background-color: #0A0A0A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    }
    
    /* Background Pattern (Doodles simulation) */
    .bg-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.05;
      background-image: 
        radial-gradient(#ffffff 1px, transparent 1px);
      background-size: 30px 30px;
      z-index: 1;
    }

    /* Pool Table */
    .pool-table {
      position: relative;
      width: 1050px;
      height: 520px;
      background-color: #b87333; /* Wood */
      border-radius: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
      z-index: 10;
    }

    /* Green Felt */
    .felt {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #109041;
      border-radius: 65px;
      border: 6px solid #0a662c;
      box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* Pockets */
    .pocket {
      position: absolute;
      background-color: #111;
      border-radius: 50%;
      box-shadow: inset 0 10px 20px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.5);
      border: 1px solid rgba(0,0,0,0.5);
    }
    .p-corner { width: 60px; height: 60px; }
    .p-tl { top: -15px; left: -15px; }
    .p-tr { top: -15px; right: -15px; }
    .p-bl { bottom: -15px; left: -15px; }
    .p-br { bottom: -15px; right: -15px; }
    
    .p-center { width: 70px; height: 50px; left: 50%; transform: translateX(-50%); border-radius: 35px; }
    .p-tc { top: -20px; }
    .p-bc { bottom: -20px; }

    /* Clean Typography */
    .title {
      font-weight: 900;
      font-size: 78px;
      color: #ffffff;
      margin: 0 0 15px 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-shadow: 0 8px 15px rgba(0,0,0,0.6);
      text-align: center;
      line-height: 1;
      z-index: 30;
    }

    .title span {
      color: #f97316;
    }

    .subtitle {
      font-weight: 800;
      font-size: 24px;
      color: #bbf7d0; /* Light green */
      margin: 0;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
      background-color: rgba(0,0,0,0.3);
      padding: 14px 40px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 30;
    }

    /* Avatars exactly like PlayerTable.vue */
    .avatar-wrapper {
      position: absolute;
      transform: translate(-50%, -50%);
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #151515;
      border: 5px solid;
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
      overflow: visible;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
    }
    
    .badge {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
      font-weight: 900;
      white-space: nowrap;
      padding: 4px 12px;
      border-radius: 8px;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      text-transform: uppercase;
      color: white;
    }

    /* Positions based on the 4-player layout in PlayerTable.vue */
    .slot-0 { left: 50%; top: calc(100% - 30px); }
    .slot-4 { left: 180px; top: calc(100% - 30px); }
    .slot-2 { left: 180px; top: 30px; }
    .slot-3 { left: calc(100% - 180px); top: 30px; }

  </style>
</head>
<body>
  <div class="bg-pattern"></div>

  <div class="pool-table">
    <div class="felt">
      <div class="pocket p-corner p-tl"></div>
      <div class="pocket p-corner p-tr"></div>
      <div class="pocket p-corner p-bl"></div>
      <div class="pocket p-corner p-br"></div>
      <div class="pocket p-center p-tc"></div>
      <div class="pocket p-center p-bc"></div>

      <h1 class="title">DISCORD <span>PARTY</span> HUB</h1>
      <p class="subtitle">¡Entra a jugar wacho!</p>
      
      <!-- Player 0 (Bottom Center) - Orange -->
      <div class="avatar-wrapper slot-0">
        <div class="avatar" style="border-color: #f97316; background-image: url('http://localhost:3000/avatars/avatar-6.svg');"></div>
      </div>
      
      <!-- Player 4 (Bottom Left) - Blue -->
      <div class="avatar-wrapper slot-4">
        <div class="avatar" style="border-color: #3b82f6; background-image: url('http://localhost:3000/avatars/avatar-2.svg');"></div>
      </div>
      
      <!-- Player 2 (Top Left) - Red -->
      <div class="avatar-wrapper slot-2">
        <div class="avatar" style="border-color: #ef4444; background-image: url('http://localhost:3000/avatars/avatar-4.svg');"></div>
      </div>
      
      <!-- Player 3 (Top Right) - Green -->
      <div class="avatar-wrapper slot-3">
        <div class="avatar" style="border-color: #22c55e; background-image: url('http://localhost:3000/avatars/avatar-1.svg');"></div>
      </div>

    </div>
  </div>
  
</body>
</html>
`;

(async () => {
  console.log("Iniciando Playwright para banner Limpio con SVG locales...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2
  });
  
  await page.setContent(html);
  
  await page.waitForTimeout(1500); // Wait for the network SVG avatars to load from localhost
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  
  console.log("Tomando screenshot...");
  await page.screenshot({ 
    path: 'public/banner.jpg', 
    type: 'jpeg', 
    quality: 90, 
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  
  await browser.close();
  
  const stats = fs.statSync('public/banner.jpg');
  console.log(`✅ Banner generado exitosamente: public/banner.jpg (${(stats.size / 1024).toFixed(2)} KB)`);
})();
