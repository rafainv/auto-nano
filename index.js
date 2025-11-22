const nano = require("./nano");
const nano2 = require("./nano2");
const nano3 = require("./nano3");
const { spawn } = require("child_process");

(async () => {
  const startTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutos em milissegundos
  
  while (Date.now() - startTime < fiveMinutes) {
    // Inicia o proxy em processo separado
    const proxyProcess = spawn("python", ["proxy.py"], { stdio: "inherit" });
    
    // Aguarda um tempo para o proxy iniciar
    await new Promise(r => setTimeout(r, 3000));
    
    await nano();
    await nano2();
    await nano3();
    
    // Encerra o proxy após cada ciclo
    proxyProcess.kill();
    
    console.log(`Tempo restante: ${Math.ceil((fiveMinutes - (Date.now() - startTime)) / 1000)}s`);
  }
  
  console.log("5 minutos completados!");
})();
