const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
require("dotenv").config({ quiet: true });

const url = process.env.URL;

// console.log(process.env.HOST_PROXY);

const nano = async () => {
  const { page, browser } = await connect({
    args: ["--start-maximized"],
    headless: false,
    turnstile: true,
    // disableXvfb: true,
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
    const arquivos = ["address.txt", "address_2.txt", "address_3.txt", "address_4.txt", "address_5.txt"];
    const add = arquivos[Math.floor(Math.random() * arquivos.length)];
    const arq = fs.readFileSync(add, "utf-8").split("\n");
    const nanoAddress = arq[Math.floor(Math.random() * arq.length)];

    await page.goto(url, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 5000));
    await page.waitForSelector("#textinput_nano");
    await page.type("#textinput_nano", nanoAddress, { delay: 20 });
    await new Promise((r) => setTimeout(r, 5000));
    await page.waitForSelector("#button_send");
    await page.click("#button_send");
    await new Promise((r) => setTimeout(r, 8000));

    const sucesso = await page.evaluate(() => {
      return document.querySelector("#span_text").textContent;
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




