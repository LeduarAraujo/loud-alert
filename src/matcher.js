const dayjs = require("dayjs");
const config = require("./config");
const { getSchedule } = require("./services/api");
const { sendMessage } = require("./services/telegram");

const notifiedMatches = new Set();

function eventId(event) {
  const codes = event.match.teams.map((t) => t.code).join("-");
  return `${event.startTime}_${codes}`;
}

function buildAlert(teamA, teamB, league, startTime, minutes) {
  const date = dayjs(startTime);
  const weekday = date.format("ddd").toUpperCase();
  const dateStr = date.format("DD/MM");
  const timeStr = date.format("HH:mm");

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
    `  \u{1F4C5}  ${weekday}, ${dateStr}  \u2022  ${timeStr}`,
    `  \u23F0  Come\u00E7a em <b>${minutes} minutos</b>`,
    "",
    line,
  ].join("\n");
}

async function notify(event, minutesUntilStart) {
  const id = eventId(event);
  if (notifiedMatches.has(id)) return;
  notifiedMatches.add(id);

  const teamA = event.match.teams[0]?.code ?? "TBD";
  const teamB = event.match.teams[1]?.code ?? "TBD";
  const league = event.league?.name ?? "";
  const message = buildAlert(teamA, teamB, league, event.startTime, minutesUntilStart);

  console.log(`[alerta] ${teamA} vs ${teamB} (${league}) \u2014 ${minutesUntilStart}min`);
  await sendMessage(message);
}

async function checkMatches() {
  const events = await getSchedule();
  const now = dayjs();

  for (const event of events) {
    const start = dayjs(event.startTime);
    const diff = start.diff(now, "minute");

    if (diff >= 0 && diff <= config.alertThresholdMinutes) {
      await notify(event, diff);
    }
  }
}

module.exports = { checkMatches };
