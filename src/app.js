import express from 'express'

const app = express()

app.use(express.json())

const lista = [
  { id: 1, nome: 'Bruno', curso: 'ADS' },
  { id: 2, nome: 'Maria', curso: 'ADS' },
  { id: 3, nome: 'João', curso: 'SI' },
  { id: 4, nome: 'Ana', curso: 'ADS' }
]

function buscarIndexPorId(id) {
  return lista.findIndex((item) => item.id === id)
}

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API REST funcionando'
  })
})

// CREATE
app.post('/lista', (req, res) => {
  const novoAluno = req.body

  lista.push(novoAluno)

  res.status(201).json(novoAluno)
})

// READ
app.get('/lista', (req, res) => {
  res.status(200).json(lista)
})

// READ BY ID
app.get('/lista/:id', (req, res) => {
  const id = Number(req.params.id)

  const aluno = lista.find((item) => item.id === id)

  if (!aluno) {
    return res.status(404).json({
      mensagem: 'Aluno não encontrado'
    })
  }

  res.status(200).json(aluno)
})

// UPDATE
app.put('/lista/:id', (req, res) => {
  const id = Number(req.params.id)

  const index = buscarIndexPorId(id)

  if (index === -1) {
    return res.status(404).json({
      mensagem: 'Aluno não encontrado'
    })
  }

  const alunoAtualizado = {
    id,
    nome: req.body.nome,
    curso: req.body.curso
  }

  lista[index] = alunoAtualizado

  res.status(200).json(alunoAtualizado)
})

// DELETE
app.delete('/lista/:id', (req, res) => {
  const id = Number(req.params.id)

  const index = buscarIndexPorId(id)

  if (index === -1) {
    return res.status(404).json({
      mensagem: 'Aluno não encontrado'
    })
  }

  const alunoRemovido = lista.splice(index, 1)

  res.status(200).json({
    mensagem: 'Aluno removido com sucesso',
    aluno: alunoRemovido[0]
  })
})

export default app