const axios = require("axios");
const config = require("../config");

const BASE_URL = "https://esports-api.lolesports.com/persisted/gw/getEventList";

async function getSchedule() {
  try {
    const res = await axios.get(BASE_URL, {
      params: { hl: "pt-BR", teamId: config.team },
      headers: { "x-api-key": config.apiKey },
    });
    return res.data.data.esports.events;
  } catch (err) {
    console.error("Erro ao consultar API LoL Esports:", err.message);
    return [];
  }
}

module.exports = { getSchedule };
