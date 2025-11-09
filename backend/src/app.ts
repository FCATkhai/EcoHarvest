import express from 'express'
import cors from 'cors'
import router from './routes/index.routes'
import { errorHandler } from './middleware/error.middleware'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './utils/auth'

const app = express()
app.use(cors())
app.all('/api/auth/*splat', toNodeHandler(auth))
app.use(express.json())

app.use('/api', router)

// // route to manually trigger stats generation
// app.get('/api/debug/generate-stats', async (req, res) => {
//     await generateStats();
//     res.json({ message: 'Stats generation triggered manually' });
// });

// Use Middleware
app.use(errorHandler)

export default app
