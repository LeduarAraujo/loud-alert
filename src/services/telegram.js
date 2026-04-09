const axios = require("axios");
const config = require("../config");

const API_URL = `https://api.telegram.org/bot${config.telegram.token}`;

async function sendMessage(text) {
  try {
    await axios.post(`${API_URL}/sendMessage`, {
      chat_id: config.telegram.chatId,
      text,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem no Telegram:", err.message);
  }
}

module.exports = { sendMessage };
