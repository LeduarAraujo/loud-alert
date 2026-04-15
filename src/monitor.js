const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
require("dayjs/locale/pt-br");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

const config = require("./config");
dayjs.tz.setDefault(config.fusoHorario);

const { buscarCalendario } = require("./services/lol-esports");
const { buscarPartidasVlr } = require("./services/vlr");
const { enviarMensagem } = require("./services/telegram");

const templateAlerta = fs.readFileSync(
  path.join(__dirname, "templates", "alert.html"),
  "utf-8",
);

const lolNotificados = new Set();
const vlrNotificados = new Set();

function gerarIdEvento(evento) {
  const codigos = evento.match.teams.map((t) => t.code).join("-");
  return `${evento.startTime}_${codigos}`;
}

function formatarLinhaData(data) {
  const local = data.tz(config.fusoHorario);
  return `  \u{1F4C5}  ${local.format("ddd").toUpperCase()}, ${local.format("DD/MM")}  \u2022  ${local.format("HH:mm")}`;
}

function formatarTempoRestante(minutos) {
  if (minutos <= 0) return "<b>Começa Agora! \u{1F534}</b>";
  if (minutos === 1) return "Começa em <b>1 minuto</b>";
  return `Começa em <b>${minutos} minutos</b>`;
}

function montarAlerta({ timeA, timeB, liga, linhaData, minutos }) {
  return templateAlerta
    .replace(/\{\{timeA\}\}/g, timeA)
    .replace(/\{\{timeB\}\}/g, timeB)
    .replace(/\{\{liga\}\}/g, liga)
    .replace(/\{\{linhaData\}\}/g, linhaData)
    .replace(/\{\{tempoRestante\}\}/g, formatarTempoRestante(minutos))
    .trim();
}

function montarAlertaLol(evento, minutos) {
  const data = dayjs.utc(evento.startTime);
  const timeA = evento.match.teams[0]?.code ?? "TBD";
  const timeB = evento.match.teams[1]?.code ?? "TBD";
  const liga = evento.league?.name ?? "";
  return montarAlerta({
    timeA,
    timeB,
    liga,
    linhaData: formatarLinhaData(data),
    minutos,
  });
}

function parsearDataVlr(dataLabel, horarioLabel) {
  if (!dataLabel && !horarioLabel) return null;

  const texto = [dataLabel, horarioLabel].filter(Boolean).join(" ");
  const nativa = new Date(texto);
  if (isNaN(nativa.getTime())) return null;

  const fmt = dayjs(nativa).format("YYYY-MM-DD HH:mm:ss");
  return dayjs.tz(fmt, config.fusoHorario);
}

function montarAlertaVlr(partida, minutos) {
  const liga =
    [partida.evento, partida.serie].filter(Boolean).join(" \u2014 ") ||
    "Valorant (VLR.gg)";
  const dataParsed = parsearDataVlr(partida.dataLabel, partida.horarioLabel);

  let linhaData;
  if (dataParsed) {
    linhaData = formatarLinhaData(dataParsed);
    minutos = Math.max(0, dataParsed.diff(dayjs.utc(), "minute"));
  } else {
    linhaData = `  \u{1F4C5}  Grade VLR.gg`;
  }

  return montarAlerta({
    timeA: partida.timeA,
    timeB: partida.timeB,
    liga,
    linhaData,
    minutos,
  });
}

async function notificarLol(evento, minutosRestantes) {
  const id = gerarIdEvento(evento);
  if (lolNotificados.has(id)) return;
  lolNotificados.add(id);

  const timeA = evento.match.teams[0]?.code ?? "TBD";
  const timeB = evento.match.teams[1]?.code ?? "TBD";
  const liga = evento.league?.name ?? "";
  const mensagem = montarAlertaLol(evento, minutosRestantes);

  console.log(`[alerta-lol] ${timeA} vs ${timeB} (${liga}) â€” ${minutosRestantes}min`);
  await enviarMensagem(mensagem);
}

async function notificarVlr(partida, minutosRestantes) {
  const id = partida.caminhoPartida || partida.urlPartida;
  if (!id || vlrNotificados.has(id)) return;
  vlrNotificados.add(id);

  const mensagem = montarAlertaVlr(partida, minutosRestantes);
  console.log(`[alerta-val] ${partida.timeA} vs ${partida.timeB} â€” ${minutosRestantes}min`);
  await enviarMensagem(mensagem);
}

async function verificarPartidas() {
  const agora = dayjs.utc();

  const eventosLol = await buscarCalendario();
  for (const evento of eventosLol) {
    const inicio = dayjs.utc(evento.startTime);
    const diferenca = inicio.diff(agora, "minute");
    if (diferenca >= 0 && diferenca <= config.limiteAlertaMinutos) {
      await notificarLol(evento, diferenca);
    }
  }

  const partidasVlr = await buscarPartidasVlr();
  for (const partida of partidasVlr) {
    const st = (partida.status || "").toLowerCase();
    if (st !== "upcoming") continue;
    const m = partida.etaMinutosAprox;
    if (m == null) continue;
    if (m >= 0 && m <= config.limiteAlertaMinutos) {
      await notificarVlr(partida, m);
    }
  }
}

module.exports = { verificarPartidas };
