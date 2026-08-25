# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido para praticar a criação de uma API REST com CRUD de alunos. Nesta etapa, correspondente à branch `branch_20260804`, a aplicação usa JavaScript, Node.js e Express e mantém os dados somente em memória.

---

# 2. Funcionalidades

- listar todos os alunos;
- buscar um aluno por ID;
- cadastrar um aluno;
- atualizar nome e curso de um aluno;
- excluir um aluno;
- retornar erro `404` ao buscar, atualizar ou excluir um ID inexistente;
- gerar automaticamente o ID quando ele não for enviado no cadastro.

---

# 3. Tecnologias Utilizadas

- **Node.js**;
- **Express**;
- **JavaScript**;
- **Nodemon**;
- **ES Modules**;
- **Git** e **GitHub** para versionamento.

---

# 4. Arquitetura e Organização do Projeto

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
│   └── app.js
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── server.js
```

O arquivo `server.js` inicia o servidor. O arquivo `src/app.js` configura o Express, mantém o mock de alunos e define as rotas.

---

# 5. Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js;
- npm;
- Git.

---

# 6. Instalação e Execução

Clone o repositório e acesse a branch do tutorial:

```bash
git clone https://github.com/LopesMick/api-rest-express.git
cd api-rest-express
git switch branch_20260804
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor com Nodemon:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

---

# 7. Endpoints

| Método | Endpoint | Descrição | Resposta esperada |
| --- | --- | --- | --- |
| GET | `/` | Verifica se a API está funcionando | `200` |
| GET | `/lista` | Lista todos os alunos | `200` |
| GET | `/lista/:id` | Busca um aluno pelo ID | `200` ou `404` |
| POST | `/lista` | Cadastra um aluno | `201` |
| PUT | `/lista/:id` | Atualiza nome e curso | `200` ou `404` |
| DELETE | `/lista/:id` | Exclui um aluno | `200` ou `404` |

## 7.1 Verificar a API

```http
GET /
```

Resposta `200`:

```json
{
  "mensagem": "API REST funcionando"
}
```

## 7.2 Listar alunos

```http
GET /lista
```

Resposta `200`: array com todos os alunos armazenados em memória.

## 7.3 Buscar aluno por ID

```http
GET /lista/1
```

Resposta `200`:

```json
{
  "id": 1,
  "nome": "Bruno",
  "curso": "ADS"
}
```

Para um ID inexistente, como `/lista/100`, a resposta é `404`:

```json
{
  "mensagem": "Aluno não encontrado"
}
```

## 7.4 Cadastrar aluno

O ID pode ser informado pelo cliente, mantendo a implementação principal do tutorial:

```http
POST /lista
Content-Type: application/json
```

```json
{
  "id": 5,
  "nome": "Pedro",
  "curso": "ADS"
}
```

Resposta `201`: o JSON do aluno criado.

## 7.5 Atualizar aluno

```http
PUT /lista/5
Content-Type: application/json
```

```json
{
  "nome": "Pedro Silva",
  "curso": "Sistemas de Informação"
}
```

Resposta `200`:

```json
{
  "id": 5,
  "nome": "Pedro Silva",
  "curso": "Sistemas de Informação"
}
```

## 7.6 Excluir aluno

```http
DELETE /lista/5
```

Resposta `200`:

```json
{
  "mensagem": "Aluno removido com sucesso",
  "aluno": {
    "id": 5,
    "nome": "Pedro Silva",
    "curso": "Sistemas de Informação"
  }
}
```

---

# 8. Exercícios Realizados

Foram realizados os exercícios do Tutorial 1:

1. cadastro de três alunos distintos por meio de `POST /lista`;
2. listagem dos alunos cadastrados com `GET /lista`;
3. busca de um aluno existente com `GET /lista/:id`;
4. validação do status `404` para `GET /lista/100`;
5. atualização de nome e curso com `PUT /lista/:id` e confirmação por GET;
6. exclusão com `DELETE /lista/:id` e confirmação pela listagem;
7. geração automática de ID quando o cliente não o informa.

Os alunos usados nos testes não fazem parte do array inicial; eles são adicionados por requisições POST enquanto o servidor está ativo.

---

# 9. Desafio: geração automática de ID

Também é possível cadastrar sem informar o ID:

```json
{
  "nome": "Pedro",
  "curso": "ADS"
}
```

Nesse caso, a aplicação utiliza a solução didática proposta no tutorial:

```js
const novoId = lista.length + 1
```

Se o cliente informar um ID, esse valor é preservado. Isso mantém compatibilidade com o cadastro principal do tutorial.

**Limitação:** depois de excluir registros, `lista.length + 1` pode gerar um ID que já pertence a outro aluno. Esta solução é mantida intencionalmente por ser a abordagem introdutória da aula; não há UUID, banco de dados ou outro mecanismo avançado de geração de IDs.

---

# 10. Armazenamento em Memória e Limitações

O mock inicial possui exatamente quatro alunos e fica em um array no código. As operações POST, PUT e DELETE modificam esse array somente enquanto o processo Node.js está ativo.

Ao reiniciar o servidor, todas as alterações feitas pelas requisições são perdidas e os quatro alunos iniciais voltam a aparecer. Isso ocorre porque esta etapa do projeto ainda não utiliza banco de dados nem qualquer outra forma de persistência.

Limitações atuais:

- dados não persistem após reiniciar o servidor;
- a geração com `lista.length + 1` pode repetir IDs após exclusões;
- não há validação dos campos recebidos;
- não há autenticação;
- não há banco de dados.

---

# 11. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_20260804`
