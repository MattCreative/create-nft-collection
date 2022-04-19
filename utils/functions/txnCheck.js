const basePath = process.cwd();
const {
  CHAIN,
} = require(`${basePath}/src/config.js`);

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function txnCheck(url) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
    await page.goto(url);
    await page.waitForSelector("#ContentPlaceHolder1_maintable");
    
    try {
      let row_offest = 3;
      if (CHAIN == "rinkeby") {
        row_offest = 4;
      }
      let cardText = await page.$eval(`#ContentPlaceHolder1_maintable .row:nth-child(${row_offest}) div:nth-child(2)`, (text) => text.textContent);
      await browser.close();
      console.log(cardText);
      resolve(cardText);
    } catch (error) {
      await browser.close();
      resolve("Unknown");
    }
  });
}

module.exports = { txnCheck };
