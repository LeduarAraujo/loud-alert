const dayjs = require("dayjs");
const config = require("./config");
const { getSchedule } = require("./services/lol-esports-api");
const { getLoudMatchesFromVlrGg } = require("./services/vlr-valorant-api");
const { sendMessage } = require("./services/telegram");

const notifiedLolMatches = new Set();
const notifiedVlrMatches = new Set();

function eventId(event) {
  const codes = event.match.teams.map((t) => t.code).join("-");
  return `${event.startTime}_${codes}`;
}

function buildAlertCommon({ teamA, teamB, league, dateLine, minutes }) {
  const line = "========================";

  return [
    line,
    "     \u{1F6A8}  <b>LOUD ALERTA</b>  \u{1F6A8}",
    line,
    "",
    `      <b>${teamA}</b>  \u2694\uFE0F  <b>${teamB}</b>`,
    "",
    `          \u{1F3C6}  <i>${league}</i>`,
    "",
    dateLine,
    `  \u23F0  Come\u00E7a em <b>${minutes} minutos</b>`,
    "",
    line,
  ].join("\n");
}

function buildAlertLol(event, minutes) {
  const date = dayjs(event.startTime);
  const dateLine = `  \u{1F4C5}  ${date.format("ddd").toUpperCase()}, ${date.format("DD/MM")}  \u2022  ${date.format("HH:mm")}`;
  const teamA = event.match.teams[0]?.code ?? "TBD";
  const teamB = event.match.teams[1]?.code ?? "TBD";
  const league = event.league?.name ?? "";
  return buildAlertCommon({ teamA, teamB, league, dateLine, minutes });
}

function buildAlertVlr(match, minutes) {
  const league = [match.event, match.series].filter(Boolean).join(" \u2014 ") || "Valorant (VLR.gg)";
  const hint =
    match.scheduleDateLabel && match.timeLabel
      ? `${match.scheduleDateLabel} \u2022 ${match.timeLabel}`
      : match.timeLabel || match.scheduleDateLabel || "";
  const dateLine = hint ? `  \u{1F4C5}  ${hint}` : `  \u{1F4C5}  Grade VLR.gg`;
  return buildAlertCommon({
    teamA: match.teamA,
    teamB: match.teamB,
    league,
    dateLine,
    minutes,
  });
}

async function notifyLol(event, minutesUntilStart) {
  const id = eventId(event);
  if (notifiedLolMatches.has(id)) return;
  notifiedLolMatches.add(id);

  const teamA = event.match.teams[0]?.code ?? "TBD";
  const teamB = event.match.teams[1]?.code ?? "TBD";
  const league = event.league?.name ?? "";
  const message = buildAlertLol(event, minutesUntilStart);

  console.log(`[alerta-lol] ${teamA} vs ${teamB} (${league}) \u2014 ${minutesUntilStart}min`);
  await sendMessage(message);
}

async function notifyVlr(match, minutesUntilStart) {
  const id = match.matchPath || match.matchUrl;
  if (!id || notifiedVlrMatches.has(id)) return;
  notifiedVlrMatches.add(id);

  const message = buildAlertVlr(match, minutesUntilStart);
  console.log(`[alerta-val] ${match.teamA} vs ${match.teamB} \u2014 ${minutesUntilStart}min (ETA VLR)`);
  await sendMessage(message);
}

async function checkMatches() {
  const now = dayjs();

  const lolEvents = await getSchedule();
  for (const event of lolEvents) {
    const start = dayjs(event.startTime);
    const diff = start.diff(now, "minute");
    if (diff >= 0 && diff <= config.alertThresholdMinutes) {
      await notifyLol(event, diff);
    }
  }

  const vlrMatches = await getLoudMatchesFromVlrGg();
  for (const match of vlrMatches) {
    const st = (match.status || "").toLowerCase();
    if (st !== "upcoming") continue;
    const m = match.etaMinutesApprox;
    if (m == null) continue;
    if (m >= 0 && m <= config.alertThresholdMinutes) {
      await notifyVlr(match, m);
    }
  }
}

module.exports = { checkMatches };
