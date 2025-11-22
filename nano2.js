const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
require("dotenv").config({ quiet: true });

const url = process.env.URL_2;

const nano = async () => {
  const { page, browser } = await connect({
    args: ["--start-maximized"],
    headless: false,
    turnstile: true,
    disableXvfb: true,
    proxy: {
      host: process.env.HOST_PROXY,
      port: process.env.PORT_PROXY,
      username: process.env.USER_PROXY,
      password: process.env.SENHA_PROXY,
    },
    customConfig: {},
    connectOption: {
      defaultViewport: null,
    },
    plugins: [],
  });

  try {
    const arquivos = ["address.txt", "address_2.txt", "address_3.txt"];
    const add = arquivos[Math.floor(Math.random() * arquivos.length)];
    const arq = fs.readFileSync(add, "utf-8").split("\n");
    const nanoAddress = arq[Math.floor(Math.random() * arq.length)];

    await page.goto(`${url}/?r=29554221350`, {
      waitUntil: "networkidle2",
    });
    await new Promise((r) => setTimeout(r, 5000));
    await page.goto(`${url}/nano-faucet`, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("#address");
    await page.type("#address", nanoAddress, { delay: 20 });
    // await new Promise((r) => setTimeout(r, 2000));
    try {
      await page.waitForSelector('button[type="submit"]');
      await page.click('button[type="submit"]');
    } catch (error) {}

    await new Promise((r) => setTimeout(r, 2000));

    const sucesso = await page.evaluate(() => {
      const suc = document.body.innerText;
      return suc.includes("Success !");
    });

    console.log(sucesso);

    await page.screenshot({ path: "screen.png" });
  } catch (error) {
    console.error(`Erro interno do servidor: ${error.message}`);
  } finally {
    await browser.close();
  }
};

// nano();
module.exports = nano;
