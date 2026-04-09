const cron = require("node-cron");
const config = require("./config");
const { checkMatches } = require("./matcher");

console.log(`[init] Monitorando partidas da "${config.team.toUpperCase()}"`);
console.log(`[init] Intervalo: ${config.checkIntervalMinutes}min | Alerta: ${config.alertThresholdMinutes}min antes`);

cron.schedule(`*/${config.checkIntervalMinutes} * * * *`, () => {
  console.log(`[cron] Verificando jogos...`);
  checkMatches();
});

checkMatches();
