const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../config");

const VLR_MATCHES_URL = "https://www.vlr.gg/matches";
const VLR_ORIGIN = "https://www.vlr.gg";

const VLR_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  referer: "https://www.vlr.gg/team/6961/loud",
};

function cleanText(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function teamNameMatchesConfigTeam(name) {
  const n = cleanText(name);
  const q = cleanText(config.team || "loud");
  if (!q) return false;
  return new RegExp(`\\b${escapeRegex(q)}\\b`, "i").test(n);
}

/** Converte texto do VLR (ex.: "2d 4h", "35m", "1h 5m") em minutos totais; null se não der para interpretar. */
function parseVlrEtaToMinutes(eta) {
  if (!eta || typeof eta !== "string") return null;
  const s = eta.trim().toLowerCase();
  let total = 0;
  let any = false;
  const d = s.match(/(\d+)\s*d\b/);
  const h = s.match(/(\d+)\s*h\b/);
  const m = s.match(/(\d+)\s*m\b/);
  if (d) {
    total += parseInt(d[1], 10) * 24 * 60;
    any = true;
  }
  if (h) {
    total += parseInt(h[1], 10) * 60;
    any = true;
  }
  if (m) {
    total += parseInt(m[1], 10);
    any = true;
  }
  return any ? total : null;
}

/**
 * Busca partidas listadas em vlr.gg/matches envolvendo o time configurado (TEAM_NAME / config.team).
 * Extrai status (.ml-status), tempo restante aproximado (.ml-eta) e campos úteis para e-mail.
 */
async function getLoudMatchesFromVlrGg() {
  try {
    const res = await axios.get(VLR_MATCHES_URL, {
      headers: VLR_HEADERS,
      timeout: 25000,
      responseType: "text",
    });
    const $ = cheerio.load(res.data);
    const matches = [];

    $("a.wf-module-item.match-item").each((_, el) => {
      const $a = $(el);
      const teams = [];
      $a.find(".match-item-vs-team-name .text-of").each((__, t) => {
        teams.push(cleanText($(t).text()));
      });
      if (teams.length < 2) return;
      if (!teams.some(teamNameMatchesConfigTeam)) return;

      const status = cleanText($a.find(".ml-status").first().text()) || null;
      const eta = cleanText($a.find(".ml-eta").first().text()) || null;
      const timeLabel = cleanText($a.find(".match-item-time").first().text()) || null;
      const series = cleanText($a.find(".match-item-event-series").first().text()) || null;

      const $eventBlock = $a.find(".match-item-event").first().clone();
      $eventBlock.find(".match-item-event-series").remove();
      const event = cleanText($eventBlock.text()) || null;

      const href = $a.attr("href") || "";
      const matchUrl = href.startsWith("http") ? href : `${VLR_ORIGIN}${href}`;

      const $card = $a.closest(".wf-card");
      let scheduleDateLabel = null;
      if ($card.length) {
        const $dayLabel = $card.prev(".wf-label.mod-large");
        if ($dayLabel.length) {
          scheduleDateLabel = cleanText(
            $dayLabel.text().replace(/\bToday\b/gi, "").replace(/\bYesterday\b/gi, ""),
          );
        }
      }

      const etaMinutesApprox = parseVlrEtaToMinutes(eta);

      const [teamA, teamB] = teams;
      const tag = cleanText(config.team || "LOUD").toUpperCase();
      const emailSubject = `[${tag}] ${teamA} vs ${teamB} — ${status || "?"}${eta ? ` (${eta})` : ""}`;
      const emailBody = [
        `${teamA} vs ${teamB}`,
        `Status: ${status ?? "—"}`,
        eta ? `Tempo restante (site): ${eta}` : "Tempo restante (site): —",
        timeLabel ? `Horário na grade: ${timeLabel}` : null,
        series ? `Fase / série: ${series}` : null,
        event ? `Evento: ${event}` : null,
        `Link: ${matchUrl}`,
      ]
        .filter(Boolean)
        .join("\n");

      matches.push({
        teamA,
        teamB,
        status,
        eta,
        etaMinutesApprox,
        scheduleDateLabel,
        timeLabel,
        series,
        event,
        matchPath: href,
        matchUrl,
        emailSubject,
        emailBody,
      });
    });

    return matches;
  } catch (err) {
    console.error("Erro ao consultar VLR.gg:", err.message);
    return [];
  }
}

module.exports = { getLoudMatchesFromVlrGg, parseVlrEtaToMinutes };
