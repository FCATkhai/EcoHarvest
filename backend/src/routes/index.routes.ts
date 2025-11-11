import { Router } from 'express'
import addressRoutes from './address.routes'

const router = Router()

router.use('/', (req, res) => {
    res.send('API is running...')
})

export default router
