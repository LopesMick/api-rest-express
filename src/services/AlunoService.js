import alunoRepository from '../repositories/AlunoRepository.js'

const LIMITE_ALUNOS_POR_CURSO = 5

export class AlunoJaCadastradoError extends Error {
  constructor(nome, curso) {
    super(`Aluno "${nome}" já cadastrado no curso "${curso}"`)
    this.name = 'AlunoJaCadastradoError'
  }
}

export class CursoLotadoError extends Error {
  constructor(curso) {
    super(`Curso "${curso}" atingiu o limite de ${LIMITE_ALUNOS_POR_CURSO} alunos`)
    this.name = 'CursoLotadoError'
  }
}

export class UltimoAlunoDoCursoError extends Error {
  constructor(curso) {
    super(`Não é possível remover o último aluno do curso "${curso}"`)
    this.name = 'UltimoAlunoDoCursoError'
  }
}

class AlunoService {
  async create({ nome, curso }) {
    const alunoExistente = await alunoRepository.findByNomeCurso(nome, curso)

    if (alunoExistente) {
      throw new AlunoJaCadastradoError(nome, curso)
    }

    const totalNoCurso = await alunoRepository.countByCurso(curso)

    if (totalNoCurso >= LIMITE_ALUNOS_POR_CURSO) {
      throw new CursoLotadoError(curso)
    }

    return alunoRepository.create({ nome, curso })
  }

  async update(id, { nome, curso }) {
    const alunoExistente = await alunoRepository.findByNomeCursoExcetoId(nome, curso, id)

    if (alunoExistente) {
      throw new AlunoJaCadastradoError(nome, curso)
    }

    return alunoRepository.update(id, { nome, curso })
  }

  async delete(id) {
    const aluno = await alunoRepository.findById(id)

    if (!aluno) {
      return false
    }

    const totalNoCurso = await alunoRepository.countByCurso(aluno.curso)

    if (totalNoCurso <= 1) {
      throw new UltimoAlunoDoCursoError(aluno.curso)
    }

    return alunoRepository.delete(id)
  }
}

export default new AlunoService()
