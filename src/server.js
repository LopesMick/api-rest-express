import app from './app.js'
import pool from './database/pool.js'

const port = Number(process.env.PORT) || 3000

async function startServer() {
  try {
    await pool.query('SELECT 1')

    console.log('Conexão com o MySQL estabelecida')

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados')
    console.error(error.message)

    process.exit(1)
  }
}

startServer()
