const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
require("dotenv").config({ quiet: true });

const url = process.env.URL;
const webProxy = process.env.WEB_PROXY;

const nano = async () => {
  const { page, browser } = await connect({
    args: ["--start-maximized"],
    headless: false,
    turnstile: true,
    // disableXvfb: true,
    // proxy: proxy
    customConfig: {},
    connectOption: {
      defaultViewport: null,
    },
    plugins: [],
  });

  try {
    const arq = fs.readFileSync("address.txt", "utf-8").split("\n");
    const nanoAddress = arq[Math.floor(Math.random() * arq.length)];

    await page.goto(webProxy, { waitUntil: "networkidle2" });
    await page.waitForSelector("#url");
    await page.type("#url", `${url}/?r=29554221350`, {
      delay: 20,
    });
    await page.waitForSelector("#requestSubmit");
    await page.click("#requestSubmit");
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 10000));

    const urlFaucet = page.url().replace("/?", "/nano-faucet?");
    await page.goto(urlFaucet, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 10000));
    await page.waitForSelector("#address");
    await page.type("#address", nanoAddress, { delay: 20 });
    // await new Promise((r) => setTimeout(r, 5000));
    await page.waitForSelector('button[type="submit"]');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 5000));

    const sucesso = await page.evaluate(() => {
      const ver = document.body.innerText.includes("Success !");
      if (ver) {
        return document.querySelector(".ant-descriptions-item-content")
          .innerText;
      }
      return null;
    });

    await page.screenshot({ path: "screen.png" });
    const res = sucesso ? `Saque solicitado: ${sucesso}` : "Falha no saque";
    console.log(res);

  } catch (error) {
    console.error(`Erro interno do servidor: ${error.message}`);
  } finally {
    await browser.close();
  }
};

nano();
