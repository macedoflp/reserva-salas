# Reserva de Salas API

API backend para gerenciamento de salas e reservas, com validação de capacidade, bloqueio de conflitos de horário e documentação interativa via Swagger.

## Visão Geral

O projeto permite cadastrar salas, criar reservas e consultar reservas por sala, status e ordenação. As regras críticas de negócio rodam no servidor:

- uma reserva não pode ultrapassar a capacidade da sala;
- reservas da mesma sala não podem ter horários sobrepostos;
- reservas que apenas encostam são permitidas;
- o status da reserva é calculado dinamicamente, sem ser salvo no banco.

## Stack Utilizada

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Neon PostgreSQL
- Swagger
- class-validator
- Jest

## Arquitetura do Projeto

O backend segue uma arquitetura em camadas por módulo:

```txt
src/
  common/
    errors/
    filters/
    responses/
  config/
  database/
    prisma.module.ts
    prisma.service.ts
  modules/
    rooms/
      controllers/
      dto/
      entities/
      repositories/
      services/
    reservations/
      controllers/
      dto/
      entities/
      repositories/
      services/
```

Responsabilidades principais:

- Controller: expõe endpoints HTTP e documentação Swagger.
- Service: concentra regras de negócio e validações críticas.
- Repository: concentra acesso ao banco via Prisma.
- DTO: valida entrada com class-validator e documenta payloads.
- Entity: documenta e modela respostas da API.
- GlobalExceptionFilter: padroniza respostas de erro.
- PrismaService: configura o Prisma Client com Neon PostgreSQL.

## Como Rodar Localmente

Pré-requisitos:

- Node.js 20 ou superior
- npm
- Banco Neon PostgreSQL configurado

Instale as dependências:

```bash
npm install
```

Configure o `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com a connection string real do Neon.

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Aplique as migrations:

```bash
npm run prisma:migrate:deploy
```

Rode em desenvolvimento:

```bash
npm run start:dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

## Configuração do `.env`

O projeto usa a variável `DATABASE_URL` para conectar no Neon PostgreSQL.

Exemplo seguro:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=verify-full&channel_binding=require"
```

Não commite o `.env`. O arquivo já está ignorado no `.gitignore`.

## Como Configurar o Banco no Neon

1. Crie uma conta ou acesse o Neon.
2. Crie um projeto PostgreSQL.
3. Copie a connection string do banco.
4. Garanta que a URL usa SSL:

```txt
sslmode=verify-full&channel_binding=require
```

5. Cole a URL real no `.env`, substituindo apenas o valor de `DATABASE_URL`.

Use a connection string PostgreSQL do Neon. Não use uma URL local ou temporária.

## Como Rodar Migrations

Para aplicar migrations já existentes no banco:

```bash
npm run prisma:migrate:deploy
```

Durante desenvolvimento, para criar uma nova migration após alterar o schema:

```bash
npm run prisma:migrate:dev -- --name nome-da-migration
```

Para regenerar o Prisma Client:

```bash
npm run prisma:generate
```

Para abrir o Prisma Studio:

```bash
npm run prisma:studio
```

## Como Rodar Testes

Rodar todos os testes:

```bash
npm test
```

Rodar em modo serial:

```bash
npm test -- --runInBand
```

Rodar cobertura:

```bash
npm run test:cov
```

## Swagger

Com a API rodando, acesse:

```txt
http://localhost:3000/docs
```

Também está disponível em:

```txt
http://localhost:3000/api/docs
```

Todos os endpoints possuem documentação com parâmetros, payloads e respostas principais.

## Endpoints Principais

Observação: a API usa prefixo global `/api` e versionamento por URI (`v1`).

### Health

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/health` | Verifica se a API está respondendo |

### Salas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/rooms` | Lista salas |
| GET | `/api/v1/rooms/:id` | Busca uma sala por id |
| POST | `/api/v1/rooms` | Cria uma sala |
| PATCH | `/api/v1/rooms/:id` | Atualiza uma sala |
| DELETE | `/api/v1/rooms/:id` | Remove uma sala |

Payload de criação de sala:

```json
{
  "name": "Sala Reuniao 1",
  "capacity": 8
}
```

### Reservas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/reservations` | Lista reservas |
| GET | `/api/v1/reservations/:id` | Busca uma reserva por id |
| POST | `/api/v1/reservations` | Cria uma reserva |
| PATCH | `/api/v1/reservations/:id` | Atualiza uma reserva |
| DELETE | `/api/v1/reservations/:id` | Remove uma reserva |

Query params da listagem:

| Parâmetro | Valores | Descrição |
| --- | --- | --- |
| `roomId` | UUID | Filtra reservas por sala |
| `status` | `upcoming`, `ongoing`, `finished` | Filtra pelo status calculado |
| `order` | `asc`, `desc` | Ordena por `startsAt` |

Payload de criação de reserva:

```json
{
  "roomId": "8a7f85d8-25c2-4d4e-9f33-e62dd16bda02",
  "title": "Planejamento semanal",
  "participants": 6,
  "startsAt": "2026-06-20T14:00:00.000Z",
  "endsAt": "2026-06-20T15:00:00.000Z"
}
```

## Formato de Erro

Erros são padronizados pelo filtro global:

```json
{
  "statusCode": 400,
  "message": "Mensagem clara do erro",
  "error": "Bad Request",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/reservations"
}
```

## Premissas Assumidas

- Reservas que encostam não são conflito.
- Não há autenticação nesta versão.
- Não há horário de funcionamento fixo.
- Reservas em fins de semana são permitidas.
- Capacidade da sala é uma regra rígida.
- Status da reserva é calculado dinamicamente.
- A checagem crítica de conflito roda no servidor.
- Banco utilizado: Neon PostgreSQL.

## Regra de Conflito

Duas reservas da mesma sala entram em conflito quando há sobreposição real de horário:

```txt
existing.startsAt < newEndsAt && existing.endsAt > newStartsAt
```

Reservas que apenas encostam não são conflito.

Exemplo permitido:

```txt
Reserva A: 13:00 até 14:00
Reserva B: 14:00 até 15:00
```

Na edição, a própria reserva é ignorada na checagem de conflito. Assim, atualizar título ou manter o mesmo horário não bloqueia a operação por conflito consigo mesma.

## Regra de Capacidade

Cada sala possui uma capacidade máxima (`capacity`). Cada reserva informa a quantidade de participantes (`participants`).

Se `participants` for maior que `capacity`, a API bloqueia a criação ou edição da reserva com:

```txt
A reserva excede a capacidade da sala.
```

## Status Derivados

O status da reserva não é persistido no banco. Ele é calculado dinamicamente a partir de `startsAt`, `endsAt` e o horário atual:

- `ongoing`: `startsAt <= now && endsAt > now`
- `upcoming`: `startsAt > now`
- `finished`: `endsAt <= now`

## Decisões Técnicas

- Prisma Client é gerado em `generated/prisma` e ignorado pelo Git.
- O banco oficial do projeto é Neon PostgreSQL.
- O `.env` fica fora do versionamento.
- O `.env.example` contém somente um exemplo seguro de `DATABASE_URL`.
- Regras críticas de reserva ficam no service.
- Repositories não contêm regra de negócio, apenas acesso ao banco.
- A API usa validação global com `ValidationPipe`.
- Erros são normalizados por `GlobalExceptionFilter`.
- Swagger fica disponível em `/docs` e `/api/docs`.

## Reservas Recorrentes

Para evoluir o sistema com reservas recorrentes, uma abordagem seria criar uma entidade `ReservationSeries`, contendo frequência, dia da semana, data inicial, data final e exceções.

A checagem de conflito teria que validar todas as ocorrências antes de criar a série. Se qualquer ocorrência conflitar com uma reserva existente, a criação da série deveria ser bloqueada ou exigir ajuste.

Também seria necessário permitir edição ou cancelamento de uma ocorrência específica ou da série inteira. Isso evita duplicar lógica e dá flexibilidade para tratar casos como feriados, remarcações e cancelamentos pontuais.

## Scripts Úteis

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Roda a API em modo desenvolvimento |
| `npm run build` | Gera Prisma Client e compila o projeto |
| `npm run start:prod` | Roda o build compilado |
| `npm run lint` | Executa ESLint com correção automática |
| `npm test` | Executa testes |
| `npm run test:cov` | Executa testes com cobertura |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate:deploy` | Aplica migrations existentes |
| `npm run prisma:migrate:dev` | Cria/aplica migration em desenvolvimento |
| `npm run prisma:studio` | Abre Prisma Studio |

## Preparação para GitHub

Antes de publicar:

```bash
npm run build
npm run lint
npm test -- --runInBand
```

Confira também:

- `.env` não deve aparecer no Git.
- `.env.example` deve permanecer sem credenciais reais.
- Migrations devem estar versionadas em `prisma/migrations`.
- Swagger deve abrir em `/docs` ou `/api/docs`.
