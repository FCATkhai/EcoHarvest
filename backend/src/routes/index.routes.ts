import { Router } from 'express'

const router = Router()

router.use('/', (req, res) => {
    res.send('API is running...')
})

export default router
