import { Router } from 'express'

import cursoController from '../controllers/CursoController.js'

const router = Router()

router.post('/', cursoController.store.bind(cursoController))

router.get('/', cursoController.index.bind(cursoController))

router.get('/:id', cursoController.show.bind(cursoController))

router.put('/:id', cursoController.update.bind(cursoController))

router.delete('/:id', cursoController.delete.bind(cursoController))

export default router
