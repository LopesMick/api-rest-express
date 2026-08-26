import pool from '../database/pool.js'

const SELECT_COM_CURSO = `
  SELECT
    alunos.id,
    alunos.nome,
    cursos.id AS curso_id,
    cursos.nome AS curso_nome,
    cursos.sigla AS curso_sigla
  FROM alunos
  JOIN cursos ON cursos.id = alunos.curso_id
`

class AlunoRepository {
  _map(row) {
    if (!row) return null

    return {
      id: row.id,
      nome: row.nome,
      curso: {
        id: row.curso_id,
        nome: row.curso_nome,
        sigla: row.curso_sigla
      }
    }
  }

  async findAll() {
    const [rows] = await pool.execute(`${SELECT_COM_CURSO} ORDER BY alunos.id`)

    return rows.map((row) => this._map(row))
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `${SELECT_COM_CURSO} WHERE alunos.id = ?`,
      [id]
    )

    return this._map(rows[0])
  }

  async findByNomeCursoId(nome, cursoId) {
    const [rows] = await pool.execute(
      'SELECT id, nome, curso_id FROM alunos WHERE nome = ? AND curso_id = ? LIMIT 1',
      [nome, cursoId]
    )

    return rows[0] ?? null
  }

  async findByNomeCursoIdExcetoId(nome, cursoId, id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, curso_id FROM alunos WHERE nome = ? AND curso_id = ? AND id != ? LIMIT 1',
      [nome, cursoId, id]
    )

    return rows[0] ?? null
  }

  async create({ nome, cursoId }) {
    const [result] = await pool.execute(
      'INSERT INTO alunos (nome, curso_id) VALUES (?, ?)',
      [nome, cursoId]
    )

    return this.findById(result.insertId)
  }

  async update(id, { nome, cursoId }) {
    const [result] = await pool.execute(
      'UPDATE alunos SET nome = ?, curso_id = ? WHERE id = ?',
      [nome, cursoId, id]
    )

    if (result.affectedRows === 0) {
      return null
    }

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
