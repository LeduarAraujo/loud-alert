require("dotenv").config();

const obrigatorias = ["TELEGRAM_TOKEN", "TELEGRAM_CHAT_ID", "ESPORTS_API_KEY"];

for (const chave of obrigatorias) {
  if (!process.env[chave]) {
    console.error(`Variável de ambiente obrigatória não definida: ${chave}`);
    process.exit(1);
  }
}

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  nomeTime: process.env.TEAM_NAME || "loud",
  chaveApi: process.env.ESPORTS_API_KEY,
  intervaloMinutos: Number(process.env.CHECK_INTERVAL_MINUTES) || 2,
  limiteAlertaMinutos: Number(process.env.ALERT_THRESHOLD_MINUTES) || 5,
  fusoHorario: process.env.TZ || "America/Sao_Paulo",
};
