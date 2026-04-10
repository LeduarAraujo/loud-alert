<p align="center">
  <h1 align="center">LOUD Alert</h1>
  <p align="center">
    Bot que monitora partidas da <strong>LOUD</strong> no <strong>LoL</strong> e <strong>VALORANT</strong>, enviando alertas em tempo real via <strong>Telegram</strong>.
  </p>
</p>

---

## Sobre

O **LOUD Alert** consulta periodicamente duas fontes de dados:

- **LoL** — API oficial do [LoL Esports](https://lolesports.com/)
- **VALORANT** — Scraping do [VLR.gg](https://www.vlr.gg/matches)

Quando detecta uma partida da LOUD prestes a começar, dispara uma notificação formatada no Telegram com data/hora em português (pt-BR).

### Principais recursos

- Monitoramento automático de partidas de **LoL** e **VALORANT**
- Alerta configurável (padrão: 5 minutos antes do início)
- Intervalo de verificação configurável (padrão: a cada 2 minutos)
- Datas e dias da semana em **português brasileiro**
- Cálculo preciso de minutos restantes a partir do horário real da partida
- Template de alerta em **arquivo HTML** editável
- Prevenção de notificações duplicadas
- Execução containerizada com Docker

## Estrutura do projeto

```
loud-alert/
├── src/
│   ├── config.js              # Configuração e validação de variáveis de ambiente
│   ├── index.js               # Entry point — inicializa o cron job
│   ├── monitor.js             # Lógica de verificação e notificação de partidas
│   ├── templates/
│   │   └── alert.html         # Template HTML do alerta enviado no Telegram
│   └── services/
│       ├── lol-esports.js     # Integração com a API do LoL Esports
│       ├── vlr.js             # Scraping de partidas do VLR.gg (VALORANT)
│       └── telegram.js        # Envio de mensagens via API do Telegram
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Um bot do Telegram criado via [@BotFather](https://t.me/BotFather)
- O Chat ID do Telegram onde as mensagens serão enviadas

> **Sem Docker?** Você só precisa do [Node.js](https://nodejs.org/) 18+.

## Início rápido

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/loud-alert.git
cd loud-alert
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
TELEGRAM_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
ESPORTS_API_KEY=sua_chave_aqui
```

### 3. Execute com Docker

```bash
docker compose up --build -d
```

Para acompanhar os logs em tempo real:

```bash
docker compose logs -f
```

Para parar:

```bash
docker compose down
```

## Execução local (sem Docker)

```bash
npm install
npm start
```

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `TELEGRAM_TOKEN` | Sim | — | Token do bot do Telegram |
| `TELEGRAM_CHAT_ID` | Sim | — | ID do chat que receberá os alertas |
| `ESPORTS_API_KEY` | Sim | — | Chave da API do LoL Esports |
| `TEAM_NAME` | Não | `loud` | Nome do time a ser monitorado |
| `CHECK_INTERVAL_MINUTES` | Não | `2` | Intervalo de verificação em minutos |
| `ALERT_THRESHOLD_MINUTES` | Não | `5` | Alertar quando faltar X minutos |

## Personalizando o alerta

O template da mensagem fica em `src/templates/alert.html`. Você pode editar livremente o layout sem mexer no código JavaScript. Os placeholders disponíveis são:

| Placeholder | Descrição |
|---|---|
| `{{timeA}}` | Nome/código do primeiro time |
| `{{timeB}}` | Nome/código do segundo time |
| `{{liga}}` | Nome da liga / evento |
| `{{linhaData}}` | Data e horário formatados |
| `{{minutos}}` | Minutos restantes para o início |

> A mensagem usa `parse_mode: "HTML"` do Telegram, então tags como `<b>`, `<i>`, `<a>` são suportadas.

## Tecnologias

| Dependência | Uso |
|---|---|
| [axios](https://github.com/axios/axios) | Requisições HTTP |
| [cheerio](https://github.com/cheeriojs/cheerio) | Scraping do VLR.gg (VALORANT) |
| [node-cron](https://github.com/node-cron/node-cron) | Agendamento de tarefas |
| [dayjs](https://github.com/iamkun/dayjs) | Manipulação de datas (locale pt-BR) |
| [dotenv](https://github.com/motdotla/dotenv) | Variáveis de ambiente |

## Licença

Este projeto é distribuído sob a licença [MIT](https://opensource.org/licenses/MIT).
