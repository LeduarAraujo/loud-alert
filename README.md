<p align="center">
  <h1 align="center">LOUD Alert</h1>
  <p align="center">
    Bot que monitora partidas da <strong>LOUD</strong> e envia alertas em tempo real via <strong>Telegram</strong>.
  </p>
</p>

---

## Sobre

O **LOUD Alert** consulta periodicamente a API de esports da LoL Esports e, quando detecta uma partida da LOUD prestes a começar, dispara uma notificação no Telegram.

### Principais recursos

- Monitoramento automático a cada 2 minutos (configurável)
- Alerta quando faltam 5 minutos ou menos para o início (configurável)
- Prevenção de notificações duplicadas
- Execução containerizada com Docker

## Estrutura do projeto

```
loud-alert/
|-- src/
|   |-- config.js            # Configuração e validação de variáveis de ambiente
|   |-- matcher.js            # Lógica de verificação e notificação de partidas
|   |-- index.js              # Entry point - inicializa o cron job
|   |-- services/
|       |-- api.js            # Integração com a API LoL Esports
|       |-- telegram.js       # Integração com a API do Telegram
|-- .dockerignore
|-- .env.example
|-- .gitignore
|-- docker-compose.yml
|-- Dockerfile
|-- package.json
|-- README.md
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
| `TELEGRAM_TOKEN` | Sim | - | Token do bot do Telegram |
| `TELEGRAM_CHAT_ID` | Sim | - | ID do chat que receberá os alertas |
| `TEAM_NAME` | Não | `loud` | Nome do time a ser monitorado |
| `CHECK_INTERVAL_MINUTES` | Não | `2` | Intervalo de verificação em minutos |
| `ALERT_THRESHOLD_MINUTES` | Não | `5` | Alertar quando faltar X minutos |

## Tecnologias

| Dependência | Uso |
|---|---|
| [axios](https://github.com/axios/axios) | Requisições HTTP |
| [node-cron](https://github.com/node-cron/node-cron) | Agendamento de tarefas |
| [dayjs](https://github.com/iamkun/dayjs) | Manipulação de datas |
| [dotenv](https://github.com/motdotla/dotenv) | Variáveis de ambiente |

## API

Este projeto utiliza a [LoL Esports API](https://lolesports.com/) para consultar o calendário de partidas.

## Licença

Este projeto é distribuído sob a licença [MIT](https://opensource.org/licenses/MIT).
