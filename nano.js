const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
const deploy = require("./deploy");
require("dotenv").config({ quiet: true });

const url = process.env.URL;
const proxy = process.env.PROXY || false;

const nano = async () => {
  let browser;
  let page;
  try {
    const puppeteer = await connect({
      args: ["--start-maximized"],
      turnstile: true,
      headless: false,
      proxy: proxy,
      disableXvfb: true,
      customConfig: {},
      connectOption: {
        defaultViewport: null,
      },
      plugins: [],
    });

    page = puppeteer.page;
    browser = puppeteer.browser;

    const arq = fs.readFileSync("address.txt", "utf-8").split("\n");
    const nanoAddress = arq[Math.floor(Math.random() * arq.length)];

    await page.goto(`${url}/?r=29554221350`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 5000));
    await page.goto(`${url}/nano-faucet`, { waitUntil: "networkidle2" });

    await new Promise((r) => setTimeout(r, 10000));
    await page.waitForSelector("#address");
    await page.type("#address", nanoAddress, { delay: 20 });
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
    if (browser) {
      await browser.close();
      await new Promise(r => setTimeout(r, 5000));
    }

    // Executa deploy de forma segura
    try {
      await deploy();
    } catch (err) {
      console.error("Erro ao executar deploy:", err);
    }
  }
};

// Loop por 20 minutos (opcional)
const runLoop = async (minutes = 20) => {
  const duration = minutes * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < duration) {
    await nano();
    console.log("Aguardando 10 segundos para próxima iteração...");
    await new Promise(r => setTimeout(r, 10000));
  }

  console.log(`⏰ Loop de ${minutes} minutos finalizado`);
};

runLoop().catch(err => console.error("Erro no loop:", err));
