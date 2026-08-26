import cursoRepository from '../repositories/CursoRepository.js'

export class VagasInvalidasError extends Error {
  constructor() {
    super('Quantidade de vagas deve ser maior que zero')
    this.name = 'VagasInvalidasError'
  }
}

export class SiglaJaCadastradaError extends Error {
  constructor(sigla) {
    super(`Já existe um curso com a sigla "${sigla}"`)
    this.name = 'SiglaJaCadastradaError'
  }
}

export class CursoComAlunosError extends Error {
  constructor() {
    super('Não é possível excluir curso com alunos matriculados')
    this.name = 'CursoComAlunosError'
  }
}

class CursoService {
  async create({ nome, sigla, vagas, ativo }) {
    if (!(vagas > 0)) {
      throw new VagasInvalidasError()
    }

    const cursoExistente = await cursoRepository.findBySigla(sigla)

    if (cursoExistente) {
      throw new SiglaJaCadastradaError(sigla)
    }

    return cursoRepository.create({
      nome,
      sigla,
      vagas,
      ativo: ativo ?? true
    })
  }

  async update(id, { nome, sigla, vagas, ativo }) {
    if (!(vagas > 0)) {
      throw new VagasInvalidasError()
    }

    const cursoExistente = await cursoRepository.findBySiglaExcetoId(sigla, id)

    if (cursoExistente) {
      throw new SiglaJaCadastradaError(sigla)
    }

    return cursoRepository.update(id, { nome, sigla, vagas, ativo })
  }

  async delete(id) {
    const curso = await cursoRepository.findById(id)

    if (!curso) {
      return false
    }

    const totalAlunos = await cursoRepository.countAlunos(id)

    if (totalAlunos > 0) {
      throw new CursoComAlunosError()
    }

    return cursoRepository.delete(id)
  }
}

export default new CursoService()
