-- Migration: cria a tabela `cursos` e relaciona `alunos` a ela via `curso_id`.
--
-- Contexto: `alunos.curso` era um VARCHAR livre. Isso permitia inconsistências
-- (ex.: "SI" e "Sistemas de Informação" como valores diferentes para o mesmo
-- curso) e não sustentava regras de negócio como vagas ou curso ativo/inativo.
--
-- Idempotente na medida do razoável: pode ser executada mais de uma vez sem
-- duplicar dados nem falhar, desde que rode inteira a cada execução (não
-- executar blocos isolados fora de ordem). Cada ALTER TABLE é guardado por
-- uma checagem em information_schema (via SQL dinâmico com PREPARE/EXECUTE),
-- já que o MySQL não suporta `ADD COLUMN IF NOT EXISTS`/`DROP COLUMN IF EXISTS`
-- nativamente (isso é uma extensão do MariaDB, não do MySQL).

USE api_rest;

-- 1. Tabela cursos
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    vagas INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Carga inicial dos cursos (só insere se a sigla ainda não existir)
INSERT INTO cursos (nome, sigla, vagas, ativo)
SELECT 'Análise e Desenvolvimento de Sistemas', 'ADS', 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE sigla = 'ADS');

INSERT INTO cursos (nome, sigla, vagas, ativo)
SELECT 'Sistemas de Informação', 'SI', 20, TRUE
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE sigla = 'SI');

INSERT INTO cursos (nome, sigla, vagas, ativo)
SELECT 'Engenharia de Software', 'ES', 10, TRUE
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE sigla = 'ES');

-- 3. Coluna curso_id em alunos (nullable nesta etapa, para permitir o backfill)
SET @curso_id_col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'curso_id'
);
SET @sql = IF(@curso_id_col_exists = 0,
  'ALTER TABLE alunos ADD COLUMN curso_id INT NULL',
  'SELECT ''coluna curso_id ja existe'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Backfill: mapeia o texto livre antigo para o curso_id correspondente.
--    Só executa se a coluna antiga `curso` ainda existir (evita erro ao
--    reexecutar a migration depois que o passo 8 já a removeu).
SET @curso_col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'curso'
);

SET @sql = IF(@curso_col_exists > 0,
  'UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = ''ADS'') WHERE curso = ''ADS'' AND curso_id IS NULL',
  'SELECT ''coluna curso ja removida - backfill ADS ja aplicado'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@curso_col_exists > 0,
  'UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = ''SI'') WHERE curso IN (''Sistemas de Informação'', ''SI'') AND curso_id IS NULL',
  'SELECT ''coluna curso ja removida - backfill SI ja aplicado'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@curso_col_exists > 0,
  'UPDATE alunos SET curso_id = (SELECT id FROM cursos WHERE sigla = ''ES'') WHERE curso = ''Engenharia de Software'' AND curso_id IS NULL',
  'SELECT ''coluna curso ja removida - backfill ES ja aplicado'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Validação manual: se retornar > 0, PARE e investigue antes de continuar
--    (existe algum valor de `curso` fora do mapeamento acima).
SELECT COUNT(*) AS alunos_sem_curso_id FROM alunos WHERE curso_id IS NULL;

-- 6. NOT NULL (seguro reexecutar; falha alto e claro se a checagem acima
--    tivesse encontrado alunos_sem_curso_id > 0)
ALTER TABLE alunos MODIFY curso_id INT NOT NULL;

-- 7. Foreign key (guardada por existência do constraint)
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_alunos_curso'
);
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE alunos ADD CONSTRAINT fk_alunos_curso FOREIGN KEY (curso_id) REFERENCES cursos(id)',
  'SELECT ''fk_alunos_curso ja existe'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Remove a coluna antiga (texto livre) -- só depois de tudo confirmado acima
SET @sql = IF(@curso_col_exists > 0,
  'ALTER TABLE alunos DROP COLUMN curso',
  'SELECT ''coluna curso ja removida'' AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
