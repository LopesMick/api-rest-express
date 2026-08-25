# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido de forma incremental, por etapas versionadas em branches. A base deste README foi escrita na `branch_20260821` (Tutorial 4 — CRUD com Routes, Controllers e Repositories) e é preservada aqui; a branch atual, `branch_Extra`, adiciona um exercício extra descrito na seção 17.

O CRUD de alunos deixa de ficar concentrado em `src/app.js` e passa a seguir a separação **Route → Controller → Repository → MySQL**, com persistência real na tabela `alunos`.

Na `branch_20260821` ainda não havia camada Service, pois não existia regra de negócio que a justificasse. A `branch_Extra` introduz a primeira regra de negócio real e, com ela, a camada Service (seção 17).

---

# 2. Evolução do Projeto

| Branch | Etapa |
| --- | --- |
| `branch_20260804` | API REST com CRUD de alunos em array em memória (Tutorial 1) |
| `branch_20260811` | MySQL 8.4 via Docker Compose, independente da API (Tutorial 2) |
| `branch_20260818` | Conexão Express ↔ MySQL via `mysql2`/pool, com `SELECT 1` (Tutorial 3) |
| `branch_20260821` | CRUD real via Route → Controller → Repository → MySQL (Tutorial 4) |
| `branch_Extra` | Camada Service + regra de negócio real (exercício extra — esta branch) |

Desde a `branch_20260821`, o projeto **não usa mais array em memória** para o CRUD. Todos os dados de `/alunos` vêm e voltam do MySQL.

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

# 17. Branch Extra — Service e Regra de Negócio

Esta seção documenta a `branch_Extra`, criada a partir da `main` **depois** que a `branch_20260821` (Tutorial 4) foi concluída e mergeada. A `branch_20260821` permanece fiel ao escopo original do professor (Route → Controller → Repository); o conteúdo abaixo é um exercício extra, separado.

## 17.1 Por que a Service foi adicionada agora

Até a `branch_20260821`, o Controller chamava o Repository diretamente porque não havia nenhuma decisão de domínio a ser tomada — apenas repassar dados entre HTTP e SQL. Criar uma Service naquele momento seria uma camada *pass-through* artificial, sem função real.

Agora existe uma **regra de negócio real**: não permitir cadastrar o mesmo aluno duas vezes no mesmo curso. Decidir isso não é responsabilidade de Route, Controller nem Repository — por isso a Service passa a existir.

## 17.2 Regra de negócio implementada

> Não é permitido cadastrar o mesmo aluno (mesmo `nome`) mais de uma vez no mesmo `curso`. O mesmo nome em um curso diferente continua permitido.

Fluxo em `AlunoService.create()`:

```text
AlunoService.create({ nome, curso })
        ↓
AlunoRepository.findByNomeCurso(nome, curso)
        ↓
   Existe?
   ├── SIM → lança AlunoJaCadastradoError
   └── NÃO → AlunoRepository.create({ nome, curso })
```

```js
// src/services/AlunoService.js
import alunoRepository from '../repositories/AlunoRepository.js'

export class AlunoJaCadastradoError extends Error {
  constructor(nome, curso) {
    super(`Aluno "${nome}" já cadastrado no curso "${curso}"`)
    this.name = 'AlunoJaCadastradoError'
  }
}

class AlunoService {
  async create({ nome, curso }) {
    const alunoExistente = await alunoRepository.findByNomeCurso(nome, curso)

    if (alunoExistente) {
      throw new AlunoJaCadastradoError(nome, curso)
    }

    return alunoRepository.create({ nome, curso })
  }
}

export default new AlunoService()
```

## 17.3 Por que a regra não pertence ao Repository

O `AlunoRepository` ganhou um novo método, `findByNomeCurso`, que apenas responde **"existe ou não existe?"** via SQL:

```js
async findByNomeCurso(nome, curso) {
  const [rows] = await pool.execute(
    'SELECT id, nome, curso FROM alunos WHERE nome = ? AND curso = ? LIMIT 1',
    [nome, curso]
  )

  return rows[0] ?? null
}
```

Ele **não decide** se essa duplicidade é aceitável ou não — isso é uma decisão de domínio, não uma característica do banco de dados. Se o Repository decidisse isso, qualquer outra regra futura (ex.: permitir duplicidade só para administradores) exigiria mexer na camada de acesso a dados, misturando persistência com regra de negócio.

## 17.4 Por que a regra não pertence à Route

A Route (`alunos.routes.js`) só sabe mapear verbo HTTP + URL para um método do Controller. Colocar a verificação de duplicidade ali misturaria roteamento com lógica de domínio e tornaria a regra invisível para quem só olha o Controller/Service.

## 17.5 Controller x Service x Repository

| Camada | Sabe sobre `req`/`res`? | Sabe SQL? | Decide regra de negócio? | Decide status HTTP? |
| --- | --- | --- | --- | --- |
| Controller | Sim | Não | Não | Sim |
| Service | Não | Não | Sim | Não |
| Repository | Não | Sim | Não | Não |

O `AlunoController.store()` chama `alunoService.create()` dentro de um `try/catch`. Se a Service lançar `AlunoJaCadastradoError`, o Controller — e só ele — decide que isso vira `HTTP 409`:

```js
async store(req, res) {
  const { nome, curso } = req.body

  try {
    const aluno = await alunoService.create({ nome, curso })

    res.status(201).location(`/alunos/${aluno.id}`).json(aluno)
  } catch (error) {
    if (error instanceof AlunoJaCadastradoError) {
      return res.status(409).json({
        mensagem: 'Aluno já cadastrado neste curso'
      })
    }

    throw error
  }
}
```

A Service nunca importa nada do Express e nunca recebe `req`/`res` — ela apenas lança um erro de domínio (`AlunoJaCadastradoError`), o que a mantém reutilizável fora de um contexto HTTP.

Os demais métodos do Controller (`index`, `show`, `update`, `delete`) continuam chamando o `AlunoRepository` diretamente — não há regra de negócio associada a eles ainda, então passar por uma Service seria uma camada artificial.

## 17.6 HTTP 409 Conflict

`409 Conflict` é o status usado quando a requisição é sintaticamente válida, mas conflita com o estado atual do recurso no servidor — exatamente o caso de um cadastro duplicado. Resposta:

```json
{
  "mensagem": "Aluno já cadastrado neste curso"
}
```

## 17.7 Estrutura de pastas

```text
src/
├── controllers/
│   └── AlunoController.js
├── database/
│   └── pool.js
├── repositories/
│   └── AlunoRepository.js
├── routes/
│   └── alunos.routes.js
├── services/
│   └── AlunoService.js
├── app.js
└── server.js
```

## 17.8 Arquitetura

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
MySQL
```

## 17.9 Testes realizados

| Teste | Requisição | Resultado |
| --- | --- | --- |
| A — cadastro válido | `POST /alunos { "nome": "Pedro", "curso": "ADS" }` | `201 Created` |
| B — duplicidade exata | mesmo `POST` repetido | `409 Conflict`, `{ "mensagem": "Aluno já cadastrado neste curso" }` |
| C — mesmo nome, curso diferente | `POST /alunos { "nome": "Pedro", "curso": "Sistemas de Informação" }` | `201 Created` |

Regressão do CRUD herdado da `branch_20260821` (`GET /alunos`, `GET /alunos/:id`, `PUT /alunos/:id`, `DELETE /alunos/:id`) validada sem quebras.

## 17.10 Regras de Negócio Adicionais

Depois da regra de duplicidade no cadastro, três novas regras foram adicionadas à `AlunoService`, todas reaproveitando o mesmo padrão: um erro de domínio lançado pela Service e traduzido em status HTTP pelo Controller.

### 17.10.1 Duplicidade também no `UPDATE`

A regra original de duplicidade (seção 17.2) só valia para `POST`. Um `PUT /alunos/:id` conseguia mudar `nome`/`curso` de um aluno para uma combinação que já pertencia a **outro** registro, reabrindo a mesma inconsistência que o `POST` bloqueava.

`AlunoRepository` ganhou `findByNomeCursoExcetoId(nome, curso, id)` — igual ao `findByNomeCurso`, mas excluindo o próprio registro da busca (`AND id != ?`), para não bloquear um `PUT` que apenas confirma os dados que o aluno já tinha:

```js
async findByNomeCursoExcetoId(nome, curso, id) {
  const [rows] = await pool.execute(
    'SELECT id, nome, curso FROM alunos WHERE nome = ? AND curso = ? AND id != ? LIMIT 1',
    [nome, curso, id]
  )
  return rows[0] ?? null
}
```

`AlunoService.update(id, { nome, curso })` usa esse método antes de delegar ao Repository; em caso de conflito, lança o mesmo `AlunoJaCadastradoError` da criação. `AlunoController.update` passou a chamar `alunoService.update` (antes chamava `alunoRepository.update` direto) e responde `409` no mesmo formato do `POST`.

### 17.10.2 Limite de vagas por curso

Regra: **cada curso comporta no máximo 5 alunos simultaneamente** (`LIMITE_ALUNOS_POR_CURSO`, constante na Service). Um `POST` que exceda o limite é rejeitado — mesmo que `nome`/`curso` não sejam duplicados.

`AlunoRepository.countByCurso(curso)` faz a contagem via SQL:

```sql
SELECT COUNT(*) AS total FROM alunos WHERE curso = ?
```

`AlunoService.create` chama esse método depois de checar duplicidade; se `total >= LIMITE_ALUNOS_POR_CURSO`, lança `CursoLotadoError`, traduzido pelo Controller em `409`:

```json
{
  "mensagem": "Curso \"Engenharia de Software\" atingiu o limite de 5 alunos"
}
```

Essa regra é qualitativamente diferente da duplicidade: não é "esse registro específico já existe", é "quantos registros já existem nesse grupo" — uma decisão de capacidade, não de unicidade. Por isso ela também não poderia viver no Repository (que só sabe contar, não decidir se a contagem é aceitável) nem na Route.

### 17.10.3 Impedir excluir o último aluno de um curso

Regra: um `DELETE` não pode deixar um curso **sem nenhum aluno matriculado**. Se o aluno a ser removido for o único com aquele `curso`, a exclusão é bloqueada.

`AlunoService.delete(id)` busca o aluno (`findById`), conta quantos alunos existem no mesmo curso (`countByCurso`) e, se o total for `1`, lança `UltimoAlunoDoCursoError` em vez de delegar ao `AlunoRepository.delete`:

```js
async delete(id) {
  const aluno = await alunoRepository.findById(id)
  if (!aluno) return false

  const totalNoCurso = await alunoRepository.countByCurso(aluno.curso)
  if (totalNoCurso <= 1) {
    throw new UltimoAlunoDoCursoError(aluno.curso)
  }

  return alunoRepository.delete(id)
}
```

`AlunoController.delete` passou a chamar `alunoService.delete` (antes chamava `alunoRepository.delete` direto) e responde `409`:

```json
{
  "mensagem": "Não é possível remover o último aluno do curso \"Sistemas de Informação\""
}
```

Essa regra mostra a Service **coordenando uma checagem antes de autorizar uma mutação** — decidir *quando* uma operação pode acontecer é regra de negócio tanto quanto decidir *o que* pode existir.

### 17.10.4 Testes realizados

| Regra | Cenário | Resultado |
| --- | --- | --- |
| Duplicidade no UPDATE | `PUT /alunos/2` (Maria) para `nome=Bruno, curso=ADS`, já existente no id 1 | `409 Conflict`, registro original preservado |
| Duplicidade no UPDATE | `PUT /alunos/2` para `Maria Nascimento/ADS` (sem conflito) | `200 OK` |
| Duplicidade no UPDATE | Repetir o mesmo `PUT` (aluno mantém seus próprios dados) | `200 OK` — não bloqueia contra si mesmo |
| Limite por curso | 5 cadastros em curso novo ("Engenharia de Software") | `201 Created` em todos |
| Limite por curso | 6º cadastro no mesmo curso | `409 Conflict`, `"Curso ... atingiu o limite de 5 alunos"` |
| Limite por curso | Cadastro em outro curso (`SI`) logo em seguida | `201 Created` — limite é por curso, não global |
| Último aluno do curso | `DELETE` do único aluno de "Sistemas de Informação" | `409 Conflict`, `"Não é possível remover o último aluno..."` |
| Último aluno do curso | `DELETE` de um aluno em curso com múltiplos alunos | `204 No Content` |
| Regressão | `GET /`, `GET /alunos`, `GET /alunos/:id`, `DELETE /alunos/999` | Comportamento inalterado (`200`/`404` conforme o caso) |

---

# 18. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_Extra` (exercício extra, derivada de `main` após o merge de `branch_20260821`)
