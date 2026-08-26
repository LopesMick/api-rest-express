# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido de forma incremental, por etapas versionadas em branches. A base deste README foi escrita na `branch_20260821` (Tutorial 4 — CRUD com Routes, Controllers e Repositories) e é preservada aqui; a branch atual, `branch_20260825_Extra`, adiciona os exercícios extras descritos nas seções 17 e 18.

O CRUD de alunos deixa de ficar concentrado em `src/app.js` e passa a seguir a separação **Route → Controller → Repository → MySQL**, com persistência real nas tabelas `alunos` e `cursos`.

Na `branch_20260821` ainda não havia camada Service, pois não existia regra de negócio que a justificasse. A `branch_20260825_Extra` introduz a primeira regra de negócio real (seção 17) e, em seguida, evolui o projeto com uma segunda entidade — `Cursos` — e um relacionamento real entre `Aluno` e `Curso` (seção 18).

---

# 2. Evolução do Projeto

| Branch | Etapa |
| --- | --- |
| `branch_20260804` | API REST com CRUD de alunos em array em memória (Tutorial 1) |
| `branch_20260811` | MySQL 8.4 via Docker Compose, independente da API (Tutorial 2) |
| `branch_20260818` | Conexão Express ↔ MySQL via `mysql2`/pool, com `SELECT 1` (Tutorial 3) |
| `branch_20260821` | CRUD real via Route → Controller → Repository → MySQL (Tutorial 4) |
| `branch_20260825` | Atividade principal de 25/08 (branch normal da aula, sem Service) |
| `branch_20260825_Extra` | Camada Service + regras de negócio + entidade `Cursos` (exercício extra — esta branch, criada a partir da `main` após o merge de `branch_20260821`) |

Desde a `branch_20260821`, o projeto **não usa mais array em memória** para o CRUD. Todos os dados vêm e voltam do MySQL.

`branch_20260825_Extra` é independente de `branch_20260825` — ambas nasceram da mesma `main`, mas seguem propósitos diferentes: uma é a entrega padrão da aula, a outra é a demonstração de Service + regras de negócio + nova entidade.

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
│   │   ├── AlunoController.js
│   │   └── CursoController.js
│   ├── database/
│   │   └── pool.js
│   ├── repositories/
│   │   ├── AlunoRepository.js
│   │   └── CursoRepository.js
│   ├── routes/
│   │   ├── alunos.routes.js
│   │   └── cursos.routes.js
│   ├── services/
│   │   ├── AlunoService.js
│   │   └── CursoService.js
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
git switch branch_20260825_Extra
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

> **Nota:** as seções 9 a 16 descrevem o estado do projeto como estava documentado até a `branch_20260821`/primeira parte da `branch_20260825_Extra` (curso como texto livre, sem entidade própria). A partir da migração para `Cursos` (seção 18), `alunos.curso` foi substituído por `alunos.curso_id`, e o comportamento **atual** do código é o descrito na seção 18. As seções abaixo permanecem como registro histórico da evolução.

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

Esta seção documenta a `branch_20260825_Extra`, criada a partir da `main` **depois** que a `branch_20260821` (Tutorial 4) foi concluída e mergeada. A `branch_20260821` permanece fiel ao escopo original do professor (Route → Controller → Repository); o conteúdo abaixo é um exercício extra, separado.

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

# 18. Branch Extra — Services, Regras de Negócio e Cursos

Esta seção documenta a segunda evolução da `branch_20260825_Extra`: a criação da entidade `Cursos` e o relacionamento real entre `Aluno` e `Curso`. Ela **substitui** partes da seção 17 — a regra de duplicidade por `nome + curso` (texto livre), o limite fixo de 5 alunos por curso (`LIMITE_ALUNOS_POR_CURSO`) e a checagem "último aluno do curso" baseada em string deixaram de existir tal como descritas ali. A seção 17 permanece como registro histórico de como a `AlunoService` nasceu; esta seção descreve o estado **atual** do código.

## 18.1 Por que Cursos não é "mais um CRUD"

Um `CursoController`/`CursoRepository` sozinhos, sem nenhuma regra associada, seriam só mais uma tabela. O que justifica a nova entidade é que ela **substitui um dado que antes era um texto solto** (`alunos.curso`, um `VARCHAR` livre) por um relacionamento real, e com isso passa a sustentar decisões que antes eram impossíveis de tomar corretamente:

- antes, `"SI"` e `"Sistemas de Informação"` eram dois valores de texto diferentes, tratados como cursos distintos — um bug estrutural do schema anterior;
- antes, o limite de alunos por curso era uma constante fixa no código (`LIMITE_ALUNOS_POR_CURSO = 5`), igual para todos os cursos, sem nenhuma relação com a realidade de cada curso;
- antes, não havia como um curso "não existir" (qualquer string era aceita) nem como um curso ficar temporariamente indisponível para matrícula.

Com `Cursos` como entidade própria, `vagas` e `ativo` passam a ser dados reais, geridos pelo próprio curso — não mais números fixos no código do `AlunoService`.

## 18.2 Migração do schema

`alunos.curso` (texto livre) foi substituído por `alunos.curso_id` (chave estrangeira para `cursos.id`). Antes de alterar o schema, os dados existentes foram inspecionados:

| `alunos.curso` (valor antigo) | Registros | Curso normalizado |
| --- | --- | --- |
| `ADS` | 6 | Análise e Desenvolvimento de Sistemas (ADS) |
| `Sistemas de Informação` | 1 | Sistemas de Informação (SI) |
| `SI` | 2 | Sistemas de Informação (SI) |
| `Engenharia de Software` | 4 | Engenharia de Software (ES) |

`SI` e `Sistemas de Informação` foram conscientemente unificados no mesmo curso — são o mesmo curso, só grafado de forma diferente no schema antigo. Nenhum dos 13 alunos existentes foi perdido.

Passos da migração (nessa ordem, sem `DROP TABLE`):

```sql
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    vagas INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO cursos (nome, sigla, vagas, ativo) VALUES
  ('Análise e Desenvolvimento de Sistemas', 'ADS', 30, TRUE),
  ('Sistemas de Informação', 'SI', 20, TRUE),
  ('Engenharia de Software', 'ES', 10, TRUE);

ALTER TABLE alunos ADD COLUMN curso_id INT NULL;

UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = 'ADS') WHERE curso = 'ADS';
UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = 'SI') WHERE curso IN ('Sistemas de Informação', 'SI');
UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = 'ES') WHERE curso = 'Engenharia de Software';

-- validado: 0 registros com curso_id NULL antes de prosseguir

ALTER TABLE alunos MODIFY curso_id INT NOT NULL;
ALTER TABLE alunos ADD CONSTRAINT fk_alunos_curso FOREIGN KEY (curso_id) REFERENCES cursos(id);
ALTER TABLE alunos DROP COLUMN curso;
```

A coluna `curso` só foi removida **depois** de confirmar que 100% dos registros tinham `curso_id` preenchido — nunca de forma silenciosa.

## 18.3 Estrutura de pastas

```text
src/
├── controllers/
│   ├── AlunoController.js
│   └── CursoController.js
├── database/
│   └── pool.js
├── repositories/
│   ├── AlunoRepository.js
│   └── CursoRepository.js
├── routes/
│   ├── alunos.routes.js
│   └── cursos.routes.js
├── services/
│   ├── AlunoService.js
│   └── CursoService.js
├── app.js
└── server.js
```

## 18.4 Arquitetura final

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

A `AlunoService` passa a depender de **dois** repositories, porque a regra de matrícula envolve as duas entidades:

```text
AlunoService
 ├── AlunoRepository (dados do aluno)
 └── CursoRepository (existência, status e vagas do curso)
```

## 18.5 `CursoRepository` e `CursoService`

`CursoRepository` só executa SQL — `findAll`, `findById`, `findBySigla`, `findBySiglaExcetoId`, `create`, `update`, `delete`, `countAlunos(cursoId)`. Nenhum desses métodos decide nada; `countAlunos`, por exemplo, só conta linhas.

`CursoService` concentra as regras de curso:

| Regra | Validação | Erro de domínio | HTTP |
| --- | --- | --- | --- |
| 1 | `vagas <= 0` | `VagasInvalidasError` | `400` |
| 2 | excluir curso com alunos matriculados | `CursoComAlunosError` | `409` |
| 3 (opcional) | `sigla` já cadastrada em outro curso | `SiglaJaCadastradaError` | `409` |

```js
async delete(id) {
  const curso = await cursoRepository.findById(id)
  if (!curso) return false

  const totalAlunos = await cursoRepository.countAlunos(id)
  if (totalAlunos > 0) {
    throw new CursoComAlunosError()
  }

  return cursoRepository.delete(id)
}
```

## 18.6 `CursoController` e `cursos.routes.js`

`CursoController` só traduz HTTP ↔ Service/Repository (sem SQL). `index`/`show` usam o Repository direto (não há regra de negócio em leitura); `store`/`update`/`delete` passam pela Service.

```text
POST   /cursos
GET    /cursos
GET    /cursos/:id
PUT    /cursos/:id
DELETE /cursos/:id
```

Registradas em `src/routes/cursos.routes.js` e montadas em `app.js`:

```js
app.use('/cursos', cursosRoutes)
```

## 18.7 Regras de matrícula (`AlunoService`)

`AlunoService.create({ nome, cursoId })` segue exatamente este fluxo, na ordem:

```text
1. CursoRepository.findById(cursoId)
     → não existe? CursoNaoEncontradoError (404)
2. curso.ativo === false?
     → CursoInativoError (409)
3. CursoRepository.countAlunos(cursoId) >= curso.vagas?
     → CursoSemVagasError (409)
4. AlunoRepository.findByNomeCursoId(nome, cursoId)
     → já existe? AlunoJaMatriculadoError (409)
5. AlunoRepository.create({ nome, cursoId })
```

`AlunoService.update(id, { nome, cursoId })` reaplica as mesmas checagens (existência/atividade do curso, duplicidade) e só valida vaga disponível se o aluno estiver de fato **trocando** de curso — evitar que um aluno já matriculado em um curso lotado seja bloqueado ao apenas corrigir o próprio nome.

`AlunoService.delete(id)` mantém a proteção "não remover o último aluno do curso", agora calculada via `CursoRepository.countAlunos(aluno.curso.id)` em vez de uma contagem por string.

## 18.8 Respostas HTTP

| Situação | Status | Corpo |
| --- | --- | --- |
| Curso inexistente | `404` | `{ "mensagem": "Curso não encontrado" }` |
| Curso inativo | `409` | `{ "mensagem": "Curso não está disponível para matrícula" }` |
| Curso sem vagas | `409` | `{ "mensagem": "Curso sem vagas disponíveis" }` |
| Matrícula duplicada | `409` | `{ "mensagem": "Aluno já matriculado neste curso" }` |
| Curso com vagas inválidas | `400` | `{ "mensagem": "Quantidade de vagas deve ser maior que zero" }` |
| Excluir curso com alunos | `409` | `{ "mensagem": "Não é possível excluir curso com alunos matriculados" }` |

## 18.9 `AlunoRepository` com JOIN

`findAll()` e `findById(id)` agora fazem `JOIN` com `cursos` e retornam o curso aninhado:

```json
{
  "id": 1,
  "nome": "Bruno",
  "curso": {
    "id": 1,
    "nome": "Análise e Desenvolvimento de Sistemas",
    "sigla": "ADS"
  }
}
```

`POST /alunos` e `PUT /alunos/:id` recebem `curso_id` no corpo da requisição (JSON em `snake_case`, convertido para `cursoId` já no Controller):

```json
{
  "nome": "Mickael",
  "curso_id": 1
}
```

## 18.10 Testes — Cursos

| Teste | Requisição | Resultado |
| --- | --- | --- |
| Cadastro válido | `POST /cursos` (nome, sigla, vagas, ativo) | `201 Created`, `Location: /cursos/{id}` |
| Vagas inválidas | `POST /cursos` com `vagas: 0` | `400`, `"Quantidade de vagas deve ser maior que zero"` |
| Sigla duplicada | `POST /cursos` com `sigla` já existente | `409`, `"Já existe um curso com a sigla ..."` |
| Listagem | `GET /cursos` | `200`, array de cursos |
| Busca por ID | `GET /cursos/999` | `404`, `"Curso não encontrado"` |
| Exclusão sem alunos | `DELETE /cursos/{id}` (curso vazio) | `204 No Content` |
| Exclusão com alunos | `DELETE /cursos/1` (ADS, com alunos) | `409`, `"Não é possível excluir curso com alunos matriculados"` |

## 18.11 Testes — Matrícula

| Teste | Cenário | Resultado |
| --- | --- | --- |
| 1 | Curso existente, ativo, com vaga | `201 Created`, corpo com `curso` aninhado |
| 2 | `curso_id` inexistente | `404`, `"Curso não encontrado"` |
| 3 | Curso inativo | `409`, `"Curso não está disponível para matrícula"` |
| 4 | Curso sem vagas (curso de teste com `vagas: 1`, já ocupado) | `409`, `"Curso sem vagas disponíveis"` |
| 5 | Mesmo aluno + mesmo curso | `409`, `"Aluno já matriculado neste curso"` |
| 6 | Mesmo aluno (mesmo nome) + curso diferente | `201 Created` — permitido |

## 18.12 Regressão

`GET /`, `GET /alunos`, `GET /alunos/:id`, `PUT /alunos/:id`, `DELETE /alunos/:id` (incluindo os casos `404` para ID inexistente e `409` para "último aluno do curso") foram revalidados após a migração e continuam com o comportamento esperado — apenas o corpo de `alunos` mudou, de `curso` (string) para `curso` (objeto aninhado).

## 18.13 Limitações desta etapa

- Cursos de teste (`Curso Descontinuado`, `Curso Lotado Teste`) foram criados via API para validar as regras de curso inativo e sem vagas, e permanecem no banco como evidência dos testes.
- Não há endpoint para "transferir" um aluno de curso além do `PUT` genérico (que já reaplica todas as regras de matrícula).
- Não há paginação, filtros, autenticação, ORM ou qualquer item listado como fora de escopo desta etapa.

---

# 19. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_20260825_Extra` (exercício extra, derivada de `main` após o merge de `branch_20260821`)
