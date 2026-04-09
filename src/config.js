require("dotenv").config();

const required = ["TELEGRAM_TOKEN", "TELEGRAM_CHAT_ID"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Vari\u00E1vel de ambiente obrigat\u00F3ria n\u00E3o definida: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  team: process.env.TEAM_NAME || "loud",
  apiKey: process.env.ESPORTS_API_KEY || "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z",
  checkIntervalMinutes: Number(process.env.CHECK_INTERVAL_MINUTES) || 2,
  alertThresholdMinutes: Number(process.env.ALERT_THRESHOLD_MINUTES) || 5,
};
