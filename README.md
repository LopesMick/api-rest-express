# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido de forma incremental, por etapas versionadas em branches. Esta etapa, correspondente à branch `branch_20260821`, implementa o **Tutorial 4 — CRUD com Routes, Controllers e Repositories**.

O CRUD de alunos deixa de ficar concentrado em `src/app.js` e passa a seguir a separação **Route → Controller → Repository → MySQL**, com persistência real na tabela `alunos`.

**Importante:** por enquanto **não há camada Service** — ainda não existe regra de negócio suficiente para justificar essa camada. Ela poderá ser introduzida em uma etapa futura, se necessário.

---

# 2. Evolução do Projeto

| Branch | Etapa |
| --- | --- |
| `branch_20260804` | API REST com CRUD de alunos em array em memória (Tutorial 1) |
| `branch_20260811` | MySQL 8.4 via Docker Compose, independente da API (Tutorial 2) |
| `branch_20260818` | Conexão Express ↔ MySQL via `mysql2`/pool, com `SELECT 1` (Tutorial 3) |
| `branch_20260821` | CRUD real via Route → Controller → Repository → MySQL (Tutorial 4 — esta branch) |

Esta branch **não usa mais array em memória** para o CRUD. Todos os dados de `/alunos` vêm e voltam do MySQL.

---

# 3. Arquitetura Atual

```text
Requisição HTTP
      ↓
    Route
      ↓
 Controller
      ↓
 Repository
      ↓
    MySQL
```

## Responsabilidade de cada camada

**Route** (`src/routes/alunos.routes.js`)
- define método HTTP + URL;
- encaminha a requisição para o Controller;
- não contém SQL nem regra de persistência.

**Controller** (`src/controllers/AlunoController.js`)
- conhece `req` e `res`;
- define o status HTTP da resposta;
- lê `req.params` e `req.body`;
- chama o Repository;
- transforma o resultado do Repository em resposta HTTP.

**Repository** (`src/repositories/AlunoRepository.js`)
- conhece SQL e o banco de dados;
- utiliza o `pool` de conexões;
- **não conhece** `req`/`res`;
- **não define** status HTTP — apenas retorna dados ou `null`/`boolean`.

Nesta etapa **não existe camada Service** — a lógica é simples o suficiente para o Controller chamar o Repository diretamente.

---

# 4. Tecnologias Utilizadas

- **Node.js** (recursos nativos `--watch` e `--env-file`);
- **Express** (com `express.Router()`);
- **JavaScript**, **ES Modules**;
- **mysql2/promise** (driver MySQL com `async`/`await` e *prepared statements*);
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
│   ├── controllers/
│   │   └── AlunoController.js
│   ├── database/
│   │   └── pool.js
│   ├── repositories/
│   │   └── AlunoRepository.js
│   ├── routes/
│   │   └── alunos.routes.js
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

---

# 6. Pré-requisitos

- Node.js (versão com suporte a `--watch` e `--env-file`);
- npm;
- Git;
- Docker e Docker Compose (para o banco de dados MySQL).

---

# 7. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`), com `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` — os mesmos valores usados desde a branch `branch_20260818`. O `.env` está no `.gitignore` e nunca é versionado; o `.env.example` traz a mesma estrutura sem as credenciais.

---

# 8. Instalação e Execução

```bash
git clone https://github.com/LopesMick/api-rest-express.git
cd api-rest-express
git switch branch_20260821
npm install
docker compose up -d
```

Crie o `.env` (baseado no `.env.example`) e inicie a aplicação:

```bash
npm run dev
```

Resultado esperado:

```text
Conexão com o MySQL estabelecida
Servidor rodando em http://localhost:3000
```

---

# 9. Repository (`src/repositories/AlunoRepository.js`)

```js
import pool from '../database/pool.js'

class AlunoRepository {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, nome, curso FROM alunos ORDER BY id'
    )
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, curso FROM alunos WHERE id = ?',
      [id]
    )
    return rows[0] ?? null
  }

  async create({ nome, curso }) {
    const [result] = await pool.execute(
      'INSERT INTO alunos (nome, curso) VALUES (?, ?)',
      [nome, curso]
    )
    return { id: result.insertId, nome, curso }
  }

  async update(id, { nome, curso }) {
    const [result] = await pool.execute(
      'UPDATE alunos SET nome = ?, curso = ? WHERE id = ?',
      [nome, curso, id]
    )
    if (result.affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM alunos WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}

export default new AlunoRepository()
```

## 9.1 Prepared Statements

Todo dado vindo da requisição (`id`, `nome`, `curso`) é passado como **parâmetro** (`?`), nunca concatenado diretamente na string SQL:

```js
// CORRETO
pool.execute('SELECT id, nome, curso FROM alunos WHERE id = ?', [id])

// INCORRETO (nunca usado neste projeto)
`SELECT * FROM alunos WHERE id = ${id}`
```

Isso é aplicado em `SELECT` por ID, `INSERT`, `UPDATE` e `DELETE`, prevenindo SQL Injection.

## 9.2 `insertId` e `affectedRows`

- `result.insertId` — ID gerado pelo MySQL (`AUTO_INCREMENT`) em um `INSERT`, usado para montar a resposta do `create()`.
- `result.affectedRows` — quantidade de linhas afetadas por `UPDATE`/`DELETE`; usado para decidir se o registro existia (`0` → não existia).

---

# 10. Controller (`src/controllers/AlunoController.js`)

O Controller lê `req.params`/`req.body`, chama o Repository correspondente e traduz o resultado em resposta HTTP (status + JSON). Ele **não contém SQL**.

Resumo das respostas:

| Método | Situação | Status | Corpo |
| --- | --- | --- | --- |
| `index` | sempre | `200` | array de alunos |
| `show` | encontrado | `200` | objeto do aluno |
| `show` | não encontrado | `404` | `{ "mensagem": "Aluno não encontrado" }` |
| `store` | sempre | `201` + header `Location: /alunos/{id}` | objeto criado |
| `update` | encontrado | `200` | objeto atualizado |
| `update` | não encontrado | `404` | `{ "mensagem": "Aluno não encontrado" }` |
| `delete` | removido | `204` | sem corpo |
| `delete` | não encontrado | `404` | `{ "mensagem": "Aluno não encontrado" }` |

---

# 11. Routes (`src/routes/alunos.routes.js`)

```js
import { Router } from 'express'
import alunoController from '../controllers/AlunoController.js'

const router = Router()

router.post('/', alunoController.store.bind(alunoController))
router.get('/', alunoController.index.bind(alunoController))
router.get('/:id', alunoController.show.bind(alunoController))
router.put('/:id', alunoController.update.bind(alunoController))
router.delete('/:id', alunoController.delete.bind(alunoController))

export default router
```

Registrada em `src/app.js` com prefixo `/alunos`:

```js
app.use('/alunos', alunosRoutes)
```

---

# 12. Endpoints

| Método | Endpoint | Descrição | Status |
| --- | --- | --- | --- |
| GET | `/` | Verifica se a API está funcionando | `200` |
| POST | `/alunos` | Cadastra um aluno | `201` |
| GET | `/alunos` | Lista todos os alunos | `200` |
| GET | `/alunos/:id` | Busca um aluno pelo ID | `200` ou `404` |
| PUT | `/alunos/:id` | Atualiza nome e curso | `200` ou `404` |
| DELETE | `/alunos/:id` | Exclui um aluno | `204` ou `404` |

Exemplo de cadastro:

```http
POST /alunos
Content-Type: application/json

{
  "nome": "Pedro",
  "curso": "ADS"
}
```

Resposta `201`, com `Location: /alunos/{id}`:

```json
{
  "id": 5,
  "nome": "Pedro",
  "curso": "ADS"
}
```

O `id` é sempre gerado pelo MySQL (`AUTO_INCREMENT`); o cliente nunca o envia.

---

# 13. Relação HTTP → Controller → Repository → SQL

| Verbo HTTP | Controller | Repository | SQL |
| --- | --- | --- | --- |
| `POST /alunos` | `store` | `create` | `INSERT INTO alunos (nome, curso) VALUES (?, ?)` |
| `GET /alunos` | `index` | `findAll` | `SELECT id, nome, curso FROM alunos ORDER BY id` |
| `GET /alunos/:id` | `show` | `findById` | `SELECT id, nome, curso FROM alunos WHERE id = ?` |
| `PUT /alunos/:id` | `update` | `update` | `UPDATE alunos SET nome = ?, curso = ? WHERE id = ?` |
| `DELETE /alunos/:id` | `delete` | `delete` | `DELETE FROM alunos WHERE id = ?` |

---

# 14. Persistência Real no MySQL

Diferente das etapas com array em memória, os dados agora sobrevivem:

- **ao reiniciar apenas o processo Node.js** — os dados estão no MySQL, não no processo Express;
- **a um `docker compose down` seguido de `docker compose up -d`** — o Docker Volume (`mysql_data`, criado na branch `branch_20260811`) preserva os arquivos do banco entre execuções do container.

Ambos os cenários foram testados nesta etapa: alunos cadastrados via `POST /alunos` continuaram aparecendo em `GET /alunos` após o reinício do Node e após o ciclo `docker compose down` / `up -d`.

---

# 15. Exercícios Realizados

1. **CRUD completo** — os cinco endpoints (`POST`, `GET`, `GET /:id`, `PUT`, `DELETE`) testados com sucesso em `/alunos`.
2. **Persistência ao reiniciar o Node** — 3 alunos cadastrados via `POST /alunos`; após reiniciar somente o processo Node, `GET /alunos` continuou retornando os mesmos registros (dados vivem no MySQL, não no processo).
3. **Persistência com Docker Volume** — `docker compose down` seguido de `docker compose up -d`; após o MySQL voltar, `GET /alunos` confirmou que os dados continuaram existindo, graças ao volume Docker.
4. **`GET /alunos/999` → `404`** — o `AlunoRepository.findById` retorna `null` quando a linha não existe; é o `AlunoController.show` quem decide transformar esse `null` em `HTTP 404`, pois **status HTTP é responsabilidade do Controller, não do Repository**.
5. **Análise de segurança — DELETE sem WHERE** — foi analisado (sem executar) o efeito de `DELETE FROM alunos` sem a cláusula `WHERE id = ?`: esse comando apagaria **todos os registros da tabela** de uma só vez. O `AlunoRepository.delete` mantém `WHERE id = ?`, restrito ao ID recebido.

---

# 16. Próxima Etapa

Não há camada Service nesta branch, pois ainda não há regra de negócio que a justifique. Etapas futuras podem introduzir validação de entrada, tratamento de erros centralizado e, se necessário, a camada Service.

---

# 17. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_20260821`
