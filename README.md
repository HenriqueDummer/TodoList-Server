# TodoList Server

API backend para um aplicativo de lista de tarefas. O projeto foi criado com
NestJS, usa Prisma como ORM, MySQL/MariaDB como banco de dados e Firebase
Authentication para autenticar os usuários.

Cada usuário autenticado pode cadastrar suas próprias categorias e tarefas. As
rotas protegidas sempre usam o usuário identificado pelo token Firebase enviado
no header `Authorization`.

## Tecnologias

- NestJS
- TypeScript
- Prisma
- MySQL/MariaDB
- Firebase Admin SDK
- Jest

## Requisitos

- Node.js
- npm
- Banco MySQL ou MariaDB
- Projeto Firebase com uma conta de serviço configurada

## Configuração

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
FIREBASE_PROJECT_ID="seu-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@seu-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=3000
```

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Inicie a aplicação em modo desenvolvimento:

```bash
npm run start:dev
```

Por padrão, a API fica disponível em:

```text
http://localhost:3000
```

## Autenticação

As rotas protegidas esperam um token de ID do Firebase no header:

```http
Authorization: Bearer <firebase_id_token>
```

Antes de criar tarefas ou categorias, o usuário precisa existir na base local.
Para isso, chame `POST /users` com um token Firebase válido.

## Modelo de Dados

### User

Representa o usuário local vinculado ao Firebase.

Campos principais:

- `id`
- `firebaseId`
- `email`
- `name`
- `createdAt`
- `updatedAt`

### Category

Representa uma categoria de tarefas do usuário.

Campos principais:

- `id`
- `name`
- `icon`
- `color`
- `userId`
- `createdAt`
- `updatedAt`

### Task

Representa uma tarefa do usuário.

Campos principais:

- `id`
- `title`
- `description`
- `completed`
- `priority`: `low`, `medium` ou `high`
- `dueDate`
- `userId`
- `categoryId`
- `createdAt`
- `updatedAt`

## Endpoints

### Health

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | Não | Verifica se a API está online. |

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-06-26T20:00:00.000Z"
}
```

### Usuários

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | Sim | Cria o usuário local a partir do token Firebase. Se já existir, retorna o usuário existente. |
| `GET` | `/users/me` | Sim | Retorna os dados do usuário autenticado. |

Body de `POST /users`:

```json
{
  "name": "Maria"
}
```

### Categorias

Todas as rotas de categorias exigem autenticação.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/categories` | Cria uma categoria para o usuário autenticado. |
| `GET` | `/categories` | Lista as categorias do usuário autenticado. |
| `PATCH` | `/categories/:id` | Atualiza uma categoria do usuário autenticado. |
| `DELETE` | `/categories/:id` | Remove uma categoria do usuário autenticado. |

Body de `POST /categories`:

```json
{
  "name": "Trabalho",
  "icon": "briefcase",
  "color": "#0ea5e9"
}
```

Body de `PATCH /categories/:id`:

```json
{
  "name": "Estudos",
  "icon": "book",
  "color": "#22c55e"
}
```

Todos os campos do `PATCH` são opcionais.

### Tarefas

Todas as rotas de tarefas exigem autenticação.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/tasks` | Cria uma tarefa para o usuário autenticado. |
| `GET` | `/tasks` | Lista as tarefas do usuário autenticado. |
| `PATCH` | `/tasks/:id` | Atualiza uma tarefa do usuário autenticado. |
| `DELETE` | `/tasks/:id` | Remove uma tarefa do usuário autenticado. |

Body de `POST /tasks`:

```json
{
  "title": "Finalizar relatório",
  "description": "Enviar a versão final até o fim do dia",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-06-30T18:00:00.000Z",
  "categoryId": "uuid-da-categoria"
}
```

Campos obrigatórios em `POST /tasks`:

- `title`
- `priority`
- `dueDate`

Campos opcionais:

- `description`
- `completed`
- `categoryId`

Body de `PATCH /tasks/:id`:

```json
{
  "title": "Finalizar relatório revisado",
  "completed": true,
  "priority": "medium",
  "dueDate": "2026-07-01T18:00:00.000Z",
  "categoryId": null
}
```

Todos os campos do `PATCH` são opcionais. Para remover a categoria de uma
tarefa, envie `categoryId` como `null`.

Filtros de `GET /tasks`:

| Query param | Valores | Descrição |
| --- | --- | --- |
| `status` | `completed` ou `pending` | Filtra tarefas concluídas ou pendentes. |
| `categoryId` | UUID da categoria | Filtra tarefas por categoria. |

Exemplos:

```http
GET /tasks?status=pending
GET /tasks?categoryId=uuid-da-categoria
GET /tasks?status=completed&categoryId=uuid-da-categoria
```

## Validações e Erros

A aplicação usa `ValidationPipe` global com:

- remoção de campos não definidos nos DTOs;
- transformação automática de query params e body;
- erro quando campos extras são enviados.

Erros comuns:

- `401 Unauthorized`: token ausente, inválido ou fora do formato `Bearer`.
- `404 Not Found`: usuário local, tarefa ou categoria não encontrada.
- `400 Bad Request`: dados inválidos no body ou query params.


## Estrutura Principal

```text
src/
  common/prisma/       Configuração do Prisma
  modules/auth/        Autenticação com Firebase
  modules/users/       Cadastro e consulta do usuário local
  modules/categories/  CRUD de categorias
  modules/tasks/       CRUD e filtros de tarefas
  modules/health/      Health check da API
prisma/
  schema.prisma        Schema do banco
  migrations/          Migrações do Prisma
```
