import { chromium } from 'playwright';
console.log("Starting...");
async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  console.log("Browser launched.");
  await browser.close();
}
run().catch(console.error);
