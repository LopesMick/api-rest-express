import alunoRepository from '../repositories/AlunoRepository.js'
import alunoService, {
  CursoNaoEncontradoError,
  CursoInativoError,
  CursoSemVagasError,
  AlunoJaMatriculadoError,
  UltimoAlunoDoCursoError
} from '../services/AlunoService.js'

class AlunoController {
  async index(req, res) {
    const alunos = await alunoRepository.findAll()

    res.status(200).json(alunos)
  }

  async show(req, res) {
    const id = Number(req.params.id)

    const aluno = await alunoRepository.findById(id)

    if (!aluno) {
      return res.status(404).json({
        mensagem: 'Aluno não encontrado'
      })
    }

    res.status(200).json(aluno)
  }

  async store(req, res) {
    const { nome, curso_id: cursoId } = req.body

    try {
      const aluno = await alunoService.create({ nome, cursoId: Number(cursoId) })

      res
        .status(201)
        .location(`/alunos/${aluno.id}`)
        .json(aluno)
    } catch (error) {
      if (error instanceof CursoNaoEncontradoError) {
        return res.status(404).json({ mensagem: error.message })
      }

      if (
        error instanceof CursoInativoError ||
        error instanceof CursoSemVagasError ||
        error instanceof AlunoJaMatriculadoError
      ) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }

  async update(req, res) {
    const id = Number(req.params.id)
    const { nome, curso_id: cursoId } = req.body

    try {
      const aluno = await alunoService.update(id, { nome, cursoId: Number(cursoId) })

      if (!aluno) {
        return res.status(404).json({
          mensagem: 'Aluno não encontrado'
        })
      }

      res.status(200).json(aluno)
    } catch (error) {
      if (error instanceof CursoNaoEncontradoError) {
        return res.status(404).json({ mensagem: error.message })
      }

      if (
        error instanceof CursoInativoError ||
        error instanceof CursoSemVagasError ||
        error instanceof AlunoJaMatriculadoError
      ) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }

  async delete(req, res) {
    const id = Number(req.params.id)

    try {
      const removido = await alunoService.delete(id)

      if (!removido) {
        return res.status(404).json({
          mensagem: 'Aluno não encontrado'
        })
      }

      res.status(204).send()
    } catch (error) {
      if (error instanceof UltimoAlunoDoCursoError) {
        return res.status(409).json({ mensagem: error.message })
      }

      throw error
    }
  }
}

export default new AlunoController()
