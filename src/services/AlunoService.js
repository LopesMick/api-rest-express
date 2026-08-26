import alunoRepository from '../repositories/AlunoRepository.js'
import cursoRepository from '../repositories/CursoRepository.js'

export class CursoNaoEncontradoError extends Error {
  constructor() {
    super('Curso não encontrado')
    this.name = 'CursoNaoEncontradoError'
  }
}

export class CursoInativoError extends Error {
  constructor() {
    super('Curso não está disponível para matrícula')
    this.name = 'CursoInativoError'
  }
}

export class CursoSemVagasError extends Error {
  constructor() {
    super('Curso sem vagas disponíveis')
    this.name = 'CursoSemVagasError'
  }
}

export class AlunoJaMatriculadoError extends Error {
  constructor() {
    super('Aluno já matriculado neste curso')
    this.name = 'AlunoJaMatriculadoError'
  }
}

export class UltimoAlunoDoCursoError extends Error {
  constructor() {
    super('Não é possível remover o último aluno do curso')
    this.name = 'UltimoAlunoDoCursoError'
  }
}

class AlunoService {
  async create({ nome, cursoId }) {
    const curso = await cursoRepository.findById(cursoId)

    if (!curso) {
      throw new CursoNaoEncontradoError()
    }

    if (!curso.ativo) {
      throw new CursoInativoError()
    }

    const matriculados = await cursoRepository.countAlunos(cursoId)

    if (matriculados >= curso.vagas) {
      throw new CursoSemVagasError()
    }

    const alunoExistente = await alunoRepository.findByNomeCursoId(nome, cursoId)

    if (alunoExistente) {
      throw new AlunoJaMatriculadoError()
    }

    return alunoRepository.create({ nome, cursoId })
  }

  async update(id, { nome, cursoId }) {
    const alunoAtual = await alunoRepository.findById(id)

    if (!alunoAtual) {
      return null
    }

    const curso = await cursoRepository.findById(cursoId)

    if (!curso) {
      throw new CursoNaoEncontradoError()
    }

    if (!curso.ativo) {
      throw new CursoInativoError()
    }

    const alunoExistente = await alunoRepository.findByNomeCursoIdExcetoId(nome, cursoId, id)

    if (alunoExistente) {
      throw new AlunoJaMatriculadoError()
    }

    if (alunoAtual.curso.id !== cursoId) {
      const matriculados = await cursoRepository.countAlunos(cursoId)

      if (matriculados >= curso.vagas) {
        throw new CursoSemVagasError()
      }
    }

    return alunoRepository.update(id, { nome, cursoId })
  }

  async delete(id) {
    const aluno = await alunoRepository.findById(id)

    if (!aluno) {
      return false
    }

    const totalNoCurso = await cursoRepository.countAlunos(aluno.curso.id)

    if (totalNoCurso <= 1) {
      throw new UltimoAlunoDoCursoError()
    }

    return alunoRepository.delete(id)
  }
}

export default new AlunoService()
