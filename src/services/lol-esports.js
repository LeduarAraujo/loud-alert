const axios = require("axios");
const config = require("../config");

const URL_BASE = "https://esports-api.lolesports.com/persisted/gw/getEventList";

async function buscarCalendario() {
  try {
    const res = await axios.get(URL_BASE, {
      params: { hl: "pt-BR", teamId: config.nomeTime },
      headers: { "x-api-key": config.chaveApi },
    });
    return res.data.data.esports.events;
  } catch (err) {
    console.error("Erro ao consultar API LoL Esports:", err.message);
    return [];
  }
}

module.exports = { buscarCalendario };
