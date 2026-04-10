const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../config");

const URL_PARTIDAS = "https://www.vlr.gg/matches";
const ORIGEM_VLR = "https://www.vlr.gg";

const HEADERS_VLR = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  referer: "https://www.vlr.gg/team/6961/loud",
};

function limparTexto(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nomeCorrespondeAoTime(nome) {
  const n = limparTexto(nome);
  const q = limparTexto(config.nomeTime || "loud");
  if (!q) return false;
  return new RegExp(`\\b${escaparRegex(q)}\\b`, "i").test(n);
}

/**
 * Converte texto de ETA do VLR (ex.: "2d 4h", "35m", "1h 5m")
 * em minutos totais. Retorna null se não conseguir interpretar.
 */
function parsearEtaEmMinutos(eta) {
  if (!eta || typeof eta !== "string") return null;
  const s = eta.trim().toLowerCase();
  let total = 0;
  let encontrou = false;

  const d = s.match(/(\d+)\s*d\b/);
  const h = s.match(/(\d+)\s*h\b/);
  const m = s.match(/(\d+)\s*m\b/);

  if (d) { total += parseInt(d[1], 10) * 24 * 60; encontrou = true; }
  if (h) { total += parseInt(h[1], 10) * 60; encontrou = true; }
  if (m) { total += parseInt(m[1], 10); encontrou = true; }

  return encontrou ? total : null;
}

/**
 * Busca partidas do VLR.gg que envolvam o time configurado.
 * Retorna array de objetos com dados de cada partida encontrada.
 */
async function buscarPartidasVlr() {
  try {
    const res = await axios.get(URL_PARTIDAS, {
      headers: HEADERS_VLR,
      timeout: 25000,
      responseType: "text",
    });
    const $ = cheerio.load(res.data);
    const partidas = [];

    $("a.wf-module-item.match-item").each((_, el) => {
      const $a = $(el);
      const times = [];
      $a.find(".match-item-vs-team-name .text-of").each((__, t) => {
        times.push(limparTexto($(t).text()));
      });
      if (times.length < 2) return;
      if (!times.some(nomeCorrespondeAoTime)) return;

      const status = limparTexto($a.find(".ml-status").first().text()) || null;
      const eta = limparTexto($a.find(".ml-eta").first().text()) || null;
      const horarioLabel = limparTexto($a.find(".match-item-time").first().text()) || null;
      const serie = limparTexto($a.find(".match-item-event-series").first().text()) || null;

      const $blocoEvento = $a.find(".match-item-event").first().clone();
      $blocoEvento.find(".match-item-event-series").remove();
      const evento = limparTexto($blocoEvento.text()) || null;

      const href = $a.attr("href") || "";
      const urlPartida = href.startsWith("http") ? href : `${ORIGEM_VLR}${href}`;

      const $card = $a.closest(".wf-card");
      let dataLabel = null;
      if ($card.length) {
        const $labelDia = $card.prev(".wf-label.mod-large");
        if ($labelDia.length) {
          dataLabel = limparTexto(
            $labelDia.text().replace(/\bToday\b/gi, "").replace(/\bYesterday\b/gi, ""),
          );
        }
      }

      const etaMinutosAprox = parsearEtaEmMinutos(eta);
      const [timeA, timeB] = times;

      partidas.push({
        timeA,
        timeB,
        status,
        eta,
        etaMinutosAprox,
        dataLabel,
        horarioLabel,
        serie,
        evento,
        caminhoPartida: href,
        urlPartida,
      });
    });

    return partidas;
  } catch (err) {
    console.error("Erro ao consultar VLR.gg:", err.message);
    return [];
  }
}

module.exports = { buscarPartidasVlr, parsearEtaEmMinutos };
