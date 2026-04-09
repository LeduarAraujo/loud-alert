/** Reexporta os serviços por jogo; prefira importar lol-esports-api ou vlr-valorant-api diretamente. */
module.exports = {
  ...require("./lol-esports-api"),
  ...require("./vlr-valorant-api"),
};
