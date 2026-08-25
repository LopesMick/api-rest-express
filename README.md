# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido de forma incremental, por etapas versionadas em branches. Esta etapa, correspondente à branch `branch_20260811`, implementa o **Tutorial 3 — Conectando Node.js e Express ao MySQL**.

A aplicação Express passa a carregar variáveis de ambiente, criar um **pool de conexões MySQL** (via `mysql2/promise`) e validar essa conexão com `SELECT 1` antes de iniciar o servidor HTTP.

**Importante:** esta etapa estabelece apenas a **conexão** com o banco. O CRUD completo via SQL (rotas consultando/alterando a tabela `alunos`) ainda **não** foi implementado — isso pertence ao próximo tutorial.

---

# 2. Evolução do Projeto

| Branch | Etapa |
| --- | --- |
| `branch_20260804` | API REST com CRUD de alunos em array em memória (Tutorial 1) |
| `branch_20260811` | MySQL 8.4 via Docker Compose, independente da API (Tutorial 2) |
| `branch_20260818` | Conexão Express ↔ MySQL via `mysql2`/pool, com `SELECT 1` (Tutorial 3 — esta branch) |

Nesta branch, a rota `GET /` (verificação simples da API) é a única disponível em `src/app.js` — o CRUD em memória das etapas anteriores foi removido intencionalmente, conforme a estrutura do Tutorial 3, para não confundir com o CRUD via SQL que será implementado no próximo tutorial.

---

# 3. Arquitetura Atual

```text
HTTP
 ↓
Express
 ↓
mysql2
 ↓
Connection Pool
 ↓
MySQL
```

Ainda **não existe** nesta etapa:

```text
Route
 ↓
Controller
 ↓
Repository
 ↓
MySQL
```

Essa camada (routes/controllers/repositories e o CRUD SQL completo) pertence ao próximo tutorial.

---

# 4. Tecnologias Utilizadas

- **Node.js** (recursos nativos `--watch` e `--env-file`);
- **Express**;
- **JavaScript**, **ES Modules**;
- **mysql2/promise** (driver MySQL com suporte a `async`/`await`, sem callbacks);
- **Docker** e **Docker Compose**;
- **MySQL 8.4**;
- **Git** e **GitHub** para versionamento.

---

# 5. Estrutura do Projeto

```text
api-rest-express/
├── Bruno/
│   └── API ALINOS/
│       ├── DELETE - Excluir.yml
│       ├── GET - Buscar por ID.yml
│       ├── GET - Listar todos.yml
│       ├── POST - Cadastrar.yml
│       ├── PUT - Atualizar.yml
│       ├── Raiz.yml
│       └── opencollection.yml
├── src/
│   ├── database/
│   │   └── pool.js
│   ├── app.js
│   └── server.js
├── .env              (local, não versionado)
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── package.json
└── package-lock.json
```

- `src/app.js` — configura o Express e expõe `GET /`.
- `src/server.js` — carrega o `pool`, valida a conexão com `SELECT 1` e só então inicia o servidor HTTP.
- `src/database/pool.js` — cria o pool de conexões MySQL a partir das variáveis de ambiente.
- `.env` — credenciais locais (ignorado pelo Git).
- `.env.example` — modelo versionável das variáveis necessárias.

---

# 6. Pré-requisitos

- Node.js (versão com suporte a `--watch` e `--env-file`, usadas nos scripts do projeto);
- npm;
- Git;
- Docker e Docker Compose (para o banco de dados MySQL).

---

# 7. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=api_user
DB_PASSWORD=api123
DB_NAME=api_rest
```

O `.env.example` contém a mesma estrutura, sem as credenciais preenchidas, e é o único dos dois arquivos versionado no Git:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=api_rest
```

**Importante:**

- o `.env` está listado no `.gitignore` e nunca deve ser commitado;
- nenhuma credencial fica escrita diretamente no código — tudo é lido via `process.env`;
- as credenciais são as mesmas definidas no `docker-compose.yml` da branch anterior.

## 7.1 `DB_HOST`: `localhost` x `mysql`

- Quando o Node.js roda **fora do Docker** (como nesta etapa, direto na máquina) → `DB_HOST=localhost`.
- Quando a API e o MySQL estiverem **no mesmo `docker-compose.yml`**, rodando como serviços do mesmo Compose (etapa futura) → `DB_HOST=mysql` (nome do serviço, resolvido pela rede interna do Docker).

Nesta branch, o Node.js roda localmente, então `DB_HOST=localhost` é o valor correto e não deve ser alterado.

---

# 8. Instalação e Execução

Clone o repositório e acesse a branch do tutorial:

```bash
git clone https://github.com/LopesMick/api-rest-express.git
cd api-rest-express
git switch branch_20260818
```

Instale as dependências:

```bash
npm install
```

Suba o MySQL via Docker Compose:

```bash
docker compose up -d
```

Crie o `.env` (baseado no `.env.example`) com as credenciais da seção 7.

Inicie a aplicação:

```bash
npm run dev
```

Resultado esperado no terminal:

```text
Conexão com o MySQL estabelecida
Servidor rodando em http://localhost:3000
```

A API só inicia o servidor HTTP se a conexão com o MySQL for validada com sucesso (`SELECT 1`). Caso contrário, o processo é encerrado (`process.exit(1)`) com uma mensagem de erro.

---

# 9. Scripts npm

```json
"scripts": {
  "dev": "node --watch --env-file=.env src/server.js",
  "start": "node --env-file=.env src/server.js"
}
```

- `node --env-file=.env` carrega as variáveis do `.env` nativamente, sem precisar de bibliotecas como `dotenv`;
- `node --watch` reinicia o processo automaticamente a cada alteração de arquivo — substitui o Nodemon nesta etapa;
- `npm start` roda a aplicação sem watch, para uso mais próximo de produção.

---

# 10. Pool de Conexões (`src/database/pool.js`)

```js
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool
```

O pool não abre conexão manualmente (`connect()`) nem cria uma conexão por requisição — as conexões são gerenciadas automaticamente pelo `mysql2`, reaproveitadas entre requisições, com limite de 10 conexões simultâneas.

---

# 11. Validação de Conexão (`src/server.js`)

```js
import app from './app.js'
import pool from './database/pool.js'

const port = Number(process.env.PORT) || 3000

async function startServer() {
  try {
    await pool.query('SELECT 1')

    console.log('Conexão com o MySQL estabelecida')

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados')
    console.error(error.message)

    process.exit(1)
  }
}

startServer()
```

`SELECT 1` é usado apenas como teste de comunicação com o banco — não consulta nenhuma tabela da aplicação. Se a query falhar, o erro é logado e o processo é encerrado antes de o Express começar a escutar requisições.

---

# 12. Endpoint Disponível

| Método | Endpoint | Descrição | Resposta esperada |
| --- | --- | --- | --- |
| GET | `/` | Verifica se a API está funcionando | `200` |

```http
GET /
```

Resposta `200`:

```json
{
  "mensagem": "API REST funcionando"
}
```

Nesta etapa, nenhuma rota consulta ou altera a tabela `alunos` — isso será implementado no próximo tutorial, com routes/controllers/repositories dedicados.

---

# 13. Exercícios Realizados

## 13.1 Conexão bem-sucedida

`npm run dev` com as credenciais corretas exibe:

```text
Conexão com o MySQL estabelecida
Servidor rodando em http://localhost:3000
```

E `GET /` responde `200` com `{ "mensagem": "API REST funcionando" }`.

## 13.2 Exercício 1 — Senha incorreta

Alterando temporariamente `DB_PASSWORD` para um valor inválido, a aplicação encerra com:

```text
Não foi possível conectar ao banco de dados
Access denied for user 'api_user'@'...' (using password: YES)
```

## 13.3 Exercício 2 — Banco inexistente

Alterando temporariamente `DB_NAME` para um banco que não existe, a aplicação encerra com:

```text
Não foi possível conectar ao banco de dados
Access denied for user 'api_user'@'%' to database 'banco_inexistente'
```

## 13.4 Validação didática — porta incorreta

Alterando temporariamente `DB_PORT` para uma porta sem servidor MySQL escutando, a conexão falha com `error.code = 'ECONNREFUSED'` (mensagem de erro vazia, diferente dos casos de senha/banco incorretos, que retornam mensagem explicativa do MySQL).

Isso evidencia a diferença entre três tipos de falha:

- **credenciais inválidas** → o MySQL responde recusando o acesso (`Access denied`);
- **banco inexistente** → o MySQL responde recusando o acesso ao banco específico;
- **porta/servidor inacessível** → a conexão TCP nem chega a ser estabelecida (`ECONNREFUSED`).

Em todos os casos, as variáveis foram restauradas para os valores corretos ao final do teste.

## 13.5 Exercício 3 — SELECT temporário

Foi adicionado temporariamente em `src/server.js`, após o `SELECT 1`:

```js
const [rows] = await pool.query('SELECT * FROM alunos')
console.log(rows)
```

Ao rodar `npm run dev`, os 4 registros da tabela `alunos` (criada na branch `branch_20260811`) apareceram no terminal, confirmando que o pool consegue consultar dados reais. As duas linhas foram **removidas** em seguida — `src/server.js` permanece apenas com `SELECT 1` para teste de conexão.

---

# 14. Próxima Etapa

A conexão Express ↔ MySQL está validada. O próximo tutorial implementará o CRUD completo via SQL, organizando o código em routes, controllers e repositories, substituindo definitivamente o array em memória por consultas ao banco `api_rest`.

---

# 15. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_20260818`
