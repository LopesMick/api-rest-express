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

    return {
      id: result.insertId,
      nome,
      curso
    }
  }

  async update(id, { nome, curso }) {
    const [result] = await pool.execute(
      'UPDATE alunos SET nome = ?, curso = ? WHERE id = ?',
      [nome, curso, id]
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
