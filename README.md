# API REST Express

**API REST Express**

API RESTful desenvolvida durante a Unidade Curricular de **Programação Web II — Senac RJ**.

---

# 1. Descrição

Projeto acadêmico desenvolvido para praticar a criação de uma API REST com CRUD de alunos. Nesta etapa, correspondente à branch `branch_20260811`, o projeto passa a contar com um banco de dados **MySQL 8.4** executado em container Docker, com persistência via volume.

**Importante:** a API Express **ainda utiliza o array em memória** (herdado da branch `branch_20260804`) e **ainda não está conectada ao MySQL**. O banco de dados existe e funciona de forma independente nesta etapa. A conexão Node.js ↔ MySQL (com `mysql2`) é o objetivo da próxima etapa do curso.

---

# 2. Funcionalidades

- listar todos os alunos;
- buscar um aluno por ID;
- cadastrar um aluno;
- atualizar nome e curso de um aluno;
- excluir um aluno;
- retornar erro `404` ao buscar, atualizar ou excluir um ID inexistente;
- gerar automaticamente o ID quando ele não for enviado no cadastro;
- banco de dados MySQL 8.4 rodando em container Docker, com tabela `alunos` e persistência via volume (ainda não conectado à API).

---

# 3. Tecnologias Utilizadas

- **Node.js**;
- **Express**;
- **JavaScript**;
- **Nodemon**;
- **ES Modules**;
- **Docker** e **Docker Compose**;
- **MySQL 8.4**;
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
├── docker-compose.yml
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── server.js
```

O arquivo `server.js` inicia o servidor. O arquivo `src/app.js` configura o Express, mantém o mock de alunos e define as rotas. O arquivo `docker-compose.yml` sobe um container MySQL 8.4 usado nesta etapa, de forma independente da API.

Infraestrutura desta etapa:

```text
Computador
│
├── Node.js
│      ↓
│   API Express (array em memória)
│
└── Docker
       ↓
    Container mysql-api-rest
       ↓
    MySQL 8.4
       ↓
    banco api_rest
       ↓
    tabela alunos
```

Express e MySQL permanecem separados nesta branch — a integração fica para a próxima etapa.

---

# 5. Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js;
- npm;
- Git;
- Docker e Docker Compose (para o banco de dados MySQL desta etapa).

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

# 11. Docker e MySQL

Nesta etapa (branch `branch_20260811`) o projeto ganha um banco de dados **MySQL 8.4**, executado em container Docker via Docker Compose, de forma **independente** da API Express.

## 11.1 Subir o banco de dados

```bash
docker compose up -d
```

Verificar se o container está em execução:

```bash
docker ps
docker compose ps
```

O container esperado é `mysql-api-rest`.

## 11.2 Configuração do `docker-compose.yml`

| Item | Valor |
| --- | --- |
| Imagem | `mysql:8.4` |
| Container | `mysql-api-rest` |
| Porta (host) | `3306` |
| Banco criado automaticamente | `api_rest` |
| Usuário da aplicação | `api_user` |
| Senha do usuário da aplicação | `api123` |
| Senha do usuário `root` | `root123` |
| Volume | `mysql_data` (persistência dos dados) |

**Nota:** `MYSQL_ROOT_PASSWORD` não estava definida em nenhum material anterior do projeto; o valor `root123` foi escolhido nesta etapa como senha didática, seguindo o mesmo padrão do usuário `api_user`.

## 11.3 Parar, iniciar e remover o ambiente

```bash
docker compose stop      # para o container, mantém tudo (dados incluídos)
docker compose start     # reinicia o container parado
docker compose down      # remove container e rede, mas MANTÉM o volume (dados preservados)
docker compose down -v   # remove container, rede e o VOLUME (dados perdidos)
docker volume ls         # lista os volumes Docker existentes
```

---

# 12. Banco de Dados e Tabela `alunos`

Ao acessar o MySQL como `root`:

```bash
docker exec -it mysql-api-rest mysql -u root -p
```

O banco `api_rest` já existe automaticamente (criado pela variável `MYSQL_DATABASE` do `docker-compose.yml`):

```sql
SHOW DATABASES;
USE api_rest;
```

A tabela `alunos` é criada manualmente:

```sql
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    curso VARCHAR(100) NOT NULL
);
```

Validação da estrutura:

```sql
SHOW TABLES;
DESCRIBE alunos;
```

Inserção dos registros iniciais (o `id` não é enviado, pois é gerado automaticamente por `AUTO_INCREMENT`):

```sql
INSERT INTO alunos (nome, curso) VALUES ('Bruno', 'ADS');
INSERT INTO alunos (nome, curso) VALUES ('Maria', 'ADS');
INSERT INTO alunos (nome, curso) VALUES ('João', 'Sistemas de Informação');
INSERT INTO alunos (nome, curso) VALUES ('Ana', 'ADS');
```

---

# 13. Comandos SQL — CRUD Básico

```sql
-- READ (todos)
SELECT * FROM alunos;

-- READ (por ID)
SELECT * FROM alunos WHERE id = 1;

-- UPDATE
UPDATE alunos
SET nome = 'Bruno Nascimento',
    curso = 'ADS'
WHERE id = 1;

-- DELETE
DELETE FROM alunos WHERE id = 4;
```

Cada comando foi validado com um `SELECT` posterior para confirmar o efeito.

---

# 14. Relação CRUD / HTTP / SQL

| Operação CRUD | Verbo HTTP | Comando SQL |
| --- | --- | --- |
| CREATE | `POST /lista` | `INSERT` |
| READ | `GET /lista` | `SELECT *` |
| READ (por ID) | `GET /lista/:id` | `SELECT ... WHERE id = ?` |
| UPDATE | `PUT /lista/:id` | `UPDATE ... WHERE id = ?` |
| DELETE | `DELETE /lista/:id` | `DELETE ... WHERE id = ?` |

**Importante:** esta tabela é apenas documentação da relação conceitual entre a API e o banco. Nesta branch, o Express **ainda não executa** nenhum desses comandos SQL — ele continua operando sobre o array em memória.

---

# 15. Usuário da Aplicação e Configuração de Conexão

O usuário `api_user` é o que será usado futuramente pelo Node.js para se conectar ao MySQL. Ele foi validado nesta etapa:

```bash
docker exec -it mysql-api-rest mysql -u api_user -p
```

```sql
USE api_rest;
SELECT * FROM alunos;
```

Dados de conexão (apenas documentados, ainda não utilizados em código):

| Parâmetro | Valor |
| --- | --- |
| Host | `localhost` |
| Porta | `3306` |
| Banco | `api_rest` |
| Usuário | `api_user` |
| Senha | `api123` |

Nenhuma dependência de conexão (`mysql2`) foi instalada nesta branch.

---

# 16. Persistência com Docker Volume

Foi validado que:

- `docker compose stop` / `docker compose start` preserva o container e os dados;
- `docker compose down` remove container e rede, **mas mantém o volume** — ao subir novamente com `docker compose up -d`, a tabela `alunos` e seus registros continuam existindo;
- `docker compose down -v` remove também o **volume** — ao subir novamente, o banco `api_rest` é recriado (pela variável de ambiente do Compose), porém **vazio**, sem a tabela `alunos` e sem os registros, pois eles existiam apenas no volume removido.

Após o teste de remoção do volume, o ambiente foi restaurado (tabela recriada e registros iniciais reinseridos) para que a disciplina possa continuar normalmente.

---

# 17. Exercícios Realizados — Docker e MySQL

1. `docker compose up -d` e confirmação do container `mysql-api-rest` com `docker ps`;
2. acesso como `root` e `SHOW DATABASES;`;
3. `USE api_rest;` e criação da tabela `alunos`;
4. cadastro de cinco alunos com `INSERT INTO alunos ...`;
5. listagem com `SELECT * FROM alunos;`;
6. busca de um aluno específico com `SELECT ... WHERE id = ...`;
7. atualização de um aluno com `UPDATE` e validação com `SELECT`;
8. exclusão de um aluno com `DELETE` e validação com `SELECT`;
9. `docker compose down` seguido de `docker compose up -d`, confirmando que o volume preservou os dados;
10. `docker compose down -v` seguido de `docker compose up -d`, confirmando que o banco é recriado vazio (sem tabela `alunos`) quando o volume é removido.

---

# 18. Próxima Etapa

O MySQL está funcionando de forma independente da aplicação. A próxima etapa da disciplina será conectar o Node.js/Express ao MySQL usando o driver `mysql2`, substituindo gradualmente o array em memória por consultas ao banco de dados.

---

# 19. Autoria

**Autor:** Mickael Lopes de Souza

**Disciplina:** Programação Web II — Senac RJ

**Branch:** `branch_20260811`
