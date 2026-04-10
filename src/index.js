const cron = require("node-cron");
const config = require("./config");
const { verificarPartidas } = require("./monitor");

console.log(`[init] Monitorando partidas da "${config.nomeTime.toUpperCase()}"`);
console.log(`[init] Intervalo: ${config.intervaloMinutos}min | Alerta: ${config.limiteAlertaMinutos}min antes`);

cron.schedule(`*/${config.intervaloMinutos} * * * *`, () => {
  console.log(`[cron] Verificando jogos...`);
  verificarPartidas();
});

verificarPartidas();
