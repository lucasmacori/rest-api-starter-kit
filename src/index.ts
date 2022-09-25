import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'
import swaggerui from 'swagger-ui-express'
import db from './db/index'

// Importing routes
import v1TestRouter from './v1/routes/test.routes'
import v1TaskRouter from './v1/routes/task.routes'

// Importing swagger files
import swaggerDocument from './../swagger.json'

async function startServer(): Promise<void> {
    try {
        dotenv.config()

        // Testing the database connection
        console.log('[INFO] Testing the database\'s connection...')
        const res = await db.query('SELECT TO_CHAR(NOW(), \'YYYY-MM-DD HH24:MM:SS\') AS current_date_time, 1 = $1 AS condition_test', [1])
        console.log(`[INFO] Current time given by the database: ${res.rows[0].current_date_time}`)
        console.log(`[SUCCESS] Tested database's connection succesfully !`)

        // Creating the app instance
        const app = express()

        // Reading config file (.env file)
        const port = process.env.PORT || 8000

        // Configuring the plugins
        app.use(morgan('combined')) // It is possible to log into files, which could be interesting in production
        app.use(helmet())
        app.use(express.json())
        app.use('/api/docs', swaggerui.serve, swaggerui.setup(swaggerDocument))

        // Implementing v1 routes
        app.use('/api/v1/test', v1TestRouter)
        app.use('/api/v1/task', v1TaskRouter)

        // Running the server
        await app.listen(port)
        console.log(`[SUCCESS] Server is now running at http://localhost:${port}`)
    } catch (err: unknown) {
        console.log(`[ERROR] An error occured when starting the server`)
        throw err
    }
}

startServer()
    .catch((err) => {
        throw err
    });