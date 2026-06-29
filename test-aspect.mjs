import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile context
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`file://${path.resolve('test-table-aspect.html')}`);
  await mobilePage.screenshot({ path: 'qa-test-mobile-aspect2.png' });
  await mobileContext.close();
  
  // iPad context
  const ipadContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const ipadPage = await ipadContext.newPage();
  await ipadPage.goto(`file://${path.resolve('test-table-aspect.html')}`);
  await ipadPage.screenshot({ path: 'qa-test-ipad-aspect2.png' });
  await ipadContext.close();

  await browser.close();
}
run().catch(console.error);
