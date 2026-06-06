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
    
    /* Background Pattern */
    .bg-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.08;
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
    }

    /* Pool Table Glow */
    .glow {
      position: absolute;
      width: 900px;
      height: 450px;
      background: #22c55e;
      filter: blur(120px);
      opacity: 0.15;
      z-index: 1;
    }

    /* Pool Table */
    .pool-table {
      position: relative;
      width: 1000px;
      height: 500px;
      background-color: #b87333;
      border-radius: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      box-sizing: border-box;
      box-shadow: 0 40px 80px rgba(0,0,0,0.9), inset 0 5px 15px rgba(255,255,255,0.2);
      z-index: 10;
    }

    /* Green Felt */
    .felt {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #109041;
      border-radius: 70px;
      border: 8px solid #0a662c;
      box-shadow: inset 0 0 80px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* Pockets */
    .pocket {
      position: absolute;
      width: 70px;
      height: 70px;
      background-color: #111;
      border-radius: 50%;
      box-shadow: inset 0 10px 20px rgba(0,0,0,1), 0 0 5px rgba(0,0,0,0.5);
    }
    .p-tl { top: -20px; left: -20px; }
    .p-tr { top: -20px; right: -20px; }
    .p-bl { bottom: -20px; left: -20px; }
    .p-br { bottom: -20px; right: -20px; }
    .p-tc { top: -25px; left: 50%; transform: translateX(-50%); width: 80px; height: 60px; border-radius: 40px; }
    .p-bc { bottom: -25px; left: 50%; transform: translateX(-50%); width: 80px; height: 60px; border-radius: 40px; }

    /* Clean Typography (No glass box) */
    .title {
      font-weight: 900;
      font-size: 72px;
      color: #ffffff;
      margin: 0 0 15px 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-shadow: 0 6px 15px rgba(0,0,0,0.8);
      text-align: center;
      line-height: 1;
      z-index: 30;
    }

    .title span {
      color: #f97316;
    }

    .subtitle {
      font-weight: 800;
      font-size: 26px;
      color: #bbf7d0; /* Light green */
      margin: 0;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      text-shadow: 0 4px 10px rgba(0,0,0,0.9);
      background-color: rgba(0,0,0,0.4);
      padding: 12px 36px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.15);
      z-index: 30;
    }

    /* Avatars overlapping table */
    .avatar {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #1a1a1a;
      border: 6px solid;
      box-shadow: 0 15px 30px rgba(0,0,0,0.8);
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-inner {
      width: 70px;
      height: 70px;
      background-color: #2a2a2a;
      border-radius: 50%;
      position: relative;
      box-shadow: inset 0 5px 10px rgba(0,0,0,0.5);
    }
    .avatar-eyes {
      position: absolute;
      top: 30%;
      left: 15%;
      right: 15%;
      height: 15%;
      background: #111;
      border-radius: 10px;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
    }
    .eye { width: 12px; height: 12px; background: #fff; border-radius: 50%; }

    .a1 { top: 30px; left: 180px; border-color: #ef4444; }
    .a2 { bottom: 30px; left: 280px; border-color: #3b82f6; }
    .a3 { top: 30px; right: 180px; border-color: #22c55e; }
    .a4 { bottom: 30px; right: 280px; border-color: #eab308; }

  </style>
</head>
<body>
  <div class="bg-pattern"></div>
  <div class="glow"></div>

  <div class="pool-table">
    <div class="felt">
      <div class="pocket p-tl"></div>
      <div class="pocket p-tr"></div>
      <div class="pocket p-bl"></div>
      <div class="pocket p-br"></div>
      <div class="pocket p-tc"></div>
      <div class="pocket p-bc"></div>

      <h1 class="title">DISCORD <span>PARTY</span> HUB</h1>
      <p class="subtitle">¡Entra a jugar wacho!</p>
    </div>
  </div>
  
  <div class="avatar a1"><div class="avatar-inner"><div class="avatar-eyes"><div class="eye"></div><div class="eye"></div></div></div></div>
  <div class="avatar a2"><div class="avatar-inner"><div class="avatar-eyes"><div class="eye"></div><div class="eye"></div></div></div></div>
  <div class="avatar a3"><div class="avatar-inner"><div class="avatar-eyes"><div class="eye"></div><div class="eye"></div></div></div></div>
  <div class="avatar a4"><div class="avatar-inner"><div class="avatar-eyes"><div class="eye"></div><div class="eye"></div></div></div></div>

</body>
</html>
`;

(async () => {
  console.log("Iniciando Playwright para banner Limpio...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2
  });
  
  await page.setContent(html);
  
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  
  console.log("Tomando screenshot limpio...");
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
