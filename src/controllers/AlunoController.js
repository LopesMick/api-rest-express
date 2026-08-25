import alunoRepository from '../repositories/AlunoRepository.js'

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
    const { nome, curso } = req.body

    const aluno = await alunoRepository.create({ nome, curso })

    res
      .status(201)
      .location(`/alunos/${aluno.id}`)
      .json(aluno)
  }

  async update(req, res) {
    const id = Number(req.params.id)
    const { nome, curso } = req.body

    const aluno = await alunoRepository.update(id, { nome, curso })

    if (!aluno) {
      return res.status(404).json({
        mensagem: 'Aluno não encontrado'
      })
    }

    res.status(200).json(aluno)
  }

  async delete(req, res) {
    const id = Number(req.params.id)

    const removido = await alunoRepository.delete(id)

    if (!removido) {
      return res.status(404).json({
        mensagem: 'Aluno não encontrado'
      })
    }

    res.status(204).send()
  }
}

export default new AlunoController()
