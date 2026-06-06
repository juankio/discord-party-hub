import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Función para convertir SVG a Base64
function getBase64Image(filePath) {
  const svg = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const avatar1 = getBase64Image('discord-party-hub/public/avatars/avatar-6.svg');
const avatar2 = getBase64Image('discord-party-hub/public/avatars/avatar-2.svg');
const avatar3 = getBase64Image('discord-party-hub/public/avatars/avatar-4.svg');
const avatar4 = getBase64Image('discord-party-hub/public/avatars/avatar-1.svg');

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
    
    /* Background Pattern */
    .bg-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.08;
      background-image: 
        radial-gradient(#ffffff 2px, transparent 2px);
      background-size: 40px 40px;
      z-index: 1;
    }

    /* Glow behind table */
    .glow {
      position: absolute;
      width: 800px;
      height: 400px;
      background: #f97316;
      filter: blur(150px);
      opacity: 0.15;
      z-index: 1;
    }

    /* Pool Table Container */
    .player-table-container {
      position: relative;
      width: 1000px;
      height: 500px;
      z-index: 10;
    }

    /* Wood Edge */
    .table-surface {
      position: absolute;
      inset: 32px;
      background-color: #b87333;
      border-radius: 48px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.8);
      display: flex;
      padding: 20px;
      box-sizing: border-box;
    }

    /* Green Felt */
    .felt {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #109041;
      border-radius: 40px;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.5);
      border: 4px solid #0a662c;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    /* Pockets (Buchacas) */
    .pocket {
      position: absolute;
      width: 48px;
      height: 48px;
      background-color: #111;
      border-radius: 50%;
      box-shadow: inset 0 8px 15px rgba(0,0,0,0.9);
      border: 1px solid rgba(0,0,0,0.5);
    }
    
    .p-tl { top: -16px; left: -16px; }
    .p-tr { top: -16px; right: -16px; }
    .p-bl { bottom: -16px; left: -16px; }
    .p-br { bottom: -16px; right: -16px; }
    
    .p-tc { top: -20px; left: 50%; transform: translateX(-50%); }
    .p-bc { bottom: -20px; left: 50%; transform: translateX(-50%); }

    /* Clean Typography directly on the felt */
    .title {
      font-weight: 900;
      font-size: 76px;
      color: #ffffff;
      margin: 0 0 15px 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-shadow: 0 8px 16px rgba(0,0,0,0.6);
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
      text-shadow: 0 4px 10px rgba(0,0,0,0.8);
      background-color: rgba(0,0,0,0.4);
      padding: 14px 40px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 30;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    }

    /* Avatars - Made LARGER and no badges */
    .avatar-wrapper {
      position: absolute;
      width: 120px; /* Much larger than 80px */
      height: 120px;
      background-color: #000;
      border-radius: 50%;
      border: 6px solid; /* Thicker border */
      box-shadow: 0 15px 30px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -50%);
      z-index: 20;
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #151515;
      object-fit: contain;
    }

    /* Positions (Adjusted slightly for larger size so they don't break off the table completely) */
    .slot-0 { left: 50%; top: calc(100% - 30px); border-color: #f97316; } 
    .slot-2 { left: 180px; top: 30px; border-color: #ef4444; } 
    .slot-3 { left: calc(100% - 180px); top: 30px; border-color: #22c55e; } 
    .slot-4 { left: 180px; top: calc(100% - 30px); border-color: #3b82f6; } 

  </style>
</head>
<body>
  <div class="bg-pattern"></div>
  <div class="glow"></div>

  <div class="player-table-container">
    <div class="table-surface">
      <div class="felt">
        <div class="pocket p-tl"></div>
        <div class="pocket p-tc"></div>
        <div class="pocket p-tr"></div>
        <div class="pocket p-bl"></div>
        <div class="pocket p-bc"></div>
        <div class="pocket p-br"></div>

        <h1 class="title">DISCORD <span>PARTY</span> HUB</h1>
        <p class="subtitle">¡Entra a jugar wacho!</p>
      </div>
    </div>
    
    <!-- Player Avatars with real SVGs as Base64 -->
    <div class="avatar-wrapper slot-0">
      <img class="avatar-img" src="${avatar1}" />
    </div>
    
    <div class="avatar-wrapper slot-4">
      <img class="avatar-img" src="${avatar2}" />
    </div>
    
    <div class="avatar-wrapper slot-2">
      <img class="avatar-img" src="${avatar3}" />
    </div>
    
    <div class="avatar-wrapper slot-3">
      <img class="avatar-img" src="${avatar4}" />
    </div>
  </div>

</body>
</html>
`;

(async () => {
  console.log("Iniciando Playwright para banner 100% exacto y sin nombres...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2
  });
  
  await page.setContent(html);
  
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  
  console.log("Tomando screenshot...");
  await page.screenshot({ 
    path: 'discord-party-hub/public/banner.jpg', 
    type: 'jpeg', 
    quality: 90, 
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  
  await browser.close();
  
  const stats = fs.statSync('discord-party-hub/public/banner.jpg');
  console.log(`✅ Banner generado exitosamente: discord-party-hub/public/banner.jpg (${(stats.size / 1024).toFixed(2)} KB)`);
})();
