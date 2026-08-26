import express from 'express'

import alunosRoutes from './routes/alunos.routes.js'
import cursosRoutes from './routes/cursos.routes.js'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API REST funcionando'
  })
})

app.use('/alunos', alunosRoutes)
app.use('/cursos', cursosRoutes)

export default app
