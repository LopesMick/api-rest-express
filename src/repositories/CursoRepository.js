import pool from '../database/pool.js'

class CursoRepository {
  _map(row) {
    if (!row) return null

    return {
      id: row.id,
      nome: row.nome,
      sigla: row.sigla,
      vagas: row.vagas,
      ativo: Boolean(row.ativo)
    }
  }

  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, nome, sigla, vagas, ativo FROM cursos ORDER BY id'
    )

    return rows.map((row) => this._map(row))
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, sigla, vagas, ativo FROM cursos WHERE id = ?',
      [id]
    )

    return this._map(rows[0])
  }

  async findBySigla(sigla) {
    const [rows] = await pool.execute(
      'SELECT id, nome, sigla, vagas, ativo FROM cursos WHERE sigla = ? LIMIT 1',
      [sigla]
    )

    return this._map(rows[0])
  }

  async findBySiglaExcetoId(sigla, id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, sigla, vagas, ativo FROM cursos WHERE sigla = ? AND id != ? LIMIT 1',
      [sigla, id]
    )

    return this._map(rows[0])
  }

  async create({ nome, sigla, vagas, ativo }) {
    const [result] = await pool.execute(
      'INSERT INTO cursos (nome, sigla, vagas, ativo) VALUES (?, ?, ?, ?)',
      [nome, sigla, vagas, ativo]
    )

    return this.findById(result.insertId)
  }

  async update(id, { nome, sigla, vagas, ativo }) {
    const [result] = await pool.execute(
      'UPDATE cursos SET nome = ?, sigla = ?, vagas = ?, ativo = ? WHERE id = ?',
      [nome, sigla, vagas, ativo, id]
    )

    if (result.affectedRows === 0) {
      return null
    }

    return this.findById(id)
  }

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM cursos WHERE id = ?',
      [id]
    )

    return result.affectedRows > 0
  }

  async countAlunos(cursoId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM alunos WHERE curso_id = ?',
      [cursoId]
    )

    return Number(rows[0].total)
  }
}

export default new CursoRepository()
