const axios = require("axios");
const config = require("../config");

const URL_API = `https://api.telegram.org/bot${config.telegram.token}`;

async function enviarMensagem(texto) {
  try {
    await axios.post(`${URL_API}/sendMessage`, {
      chat_id: config.telegram.chatId,
      text: texto,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem no Telegram:", err.message);
  }
}

module.exports = { enviarMensagem };
