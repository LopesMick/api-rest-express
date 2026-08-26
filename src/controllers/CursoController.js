import cursoRepository from '../repositories/CursoRepository.js'
import cursoService, {
  VagasInvalidasError,
  SiglaJaCadastradaError,
  CursoComAlunosError
} from '../services/CursoService.js'

class CursoController {
  async index(req, res) {
    const cursos = await cursoRepository.findAll()

    res.status(200).json(cursos)
  }

  async show(req, res) {
    const id = Number(req.params.id)

    const curso = await cursoRepository.findById(id)

    if (!curso) {
      return res.status(404).json({
        mensagem: 'Curso não encontrado'
      })
    }

    res.status(200).json(curso)
  }

  async store(req, res) {
    const { nome, sigla, vagas, ativo } = req.body

    try {
      const curso = await cursoService.create({ nome, sigla, vagas: Number(vagas), ativo })

      res
        .status(201)
        .location(`/cursos/${curso.id}`)
        .json(curso)
    } catch (error) {
      if (error instanceof VagasInvalidasError) {
        return res.status(400).json({ mensagem: error.message })
      }

      if (error instanceof SiglaJaCadastradaError) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }

  async update(req, res) {
    const id = Number(req.params.id)
    const { nome, sigla, vagas, ativo } = req.body

    try {
      const curso = await cursoService.update(id, { nome, sigla, vagas: Number(vagas), ativo })

      if (!curso) {
        return res.status(404).json({
          mensagem: 'Curso não encontrado'
        })
      }

      res.status(200).json(curso)
    } catch (error) {
      if (error instanceof VagasInvalidasError) {
        return res.status(400).json({ mensagem: error.message })
      }

      if (error instanceof SiglaJaCadastradaError) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }

  async delete(req, res) {
    const id = Number(req.params.id)

    try {
      const removido = await cursoService.delete(id)

      if (!removido) {
        return res.status(404).json({
          mensagem: 'Curso não encontrado'
        })
      }

      res.status(204).send()
    } catch (error) {
      if (error instanceof CursoComAlunosError) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }
}

export default new CursoController()
