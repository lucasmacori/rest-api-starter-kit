import { Router, Request, Response } from 'express'
import db from '../../db'
import Task from '../models/task.model'
import Joi from 'Joi'
const isNumeric = require('isnumeric')

const router = Router()

/**
 * GET /task
 * Fetches all tasks
 */
 router.get('/', async (req: Request, res: Response) => {
    try {
        // Querying the database to fetch the data
        const results = await db.query(`
            SELECT
                task_id,
                task_name,
                task_description,
                task_done,
                task_creation_date,
                task_last_update_date
            FROM task
        `, [])

        // Checking if a row was fetched
        if (results.rowCount === 0) {
            return res.status(204).send()
        }
        
        // Creating the data instance for each task and adding them to the list
        const tasks = new Array<Task>()
        for (let row of results.rows) {
            const task          = new Task()
            task.id             = row.task_id
            task.name           = row.task_name
            task.description    = row.task_description
            task.done           = row.task_done
            task.creationDate   = row.task_creation_date
            task.lastUpdateDate = row.task_last_update_date

            tasks.push(task)
        }

        return res.status(200).json({ status: 'Success', tasks: tasks })
    } catch (err) {
        return res.status(500).json({ status: 'Error', message: 'Unknown error' })
    }
})

/**
 * GET /task/:id
 * Fetches a specific task
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        // Checking that the id given is a number
        if (!isNumeric(req.params.id)) {
            return res.status(400).json({ status: 'Error', message: 'The given id is not a number' })
        }

        const id = parseInt(req.params.id)
        
        // Querying the database to fetch the data
        const results = await db.query(`
            SELECT
                task_id,
                task_name,
                task_description,
                task_done,
                task_creation_date,
                task_last_update_date
            FROM task
            WHERE task_id = $1
        `, [id])

        // Checking if a row was fetched
        if (results.rowCount === 0) {
            return res.status(404).json({ status: 'Error', message: 'The task does not exist' })
        }
        
        // Creating the data instance and returning it
        const task          = new Task()
        task.id             = results.rows[0].task_id
        task.name           = results.rows[0].task_name
        task.description    = results.rows[0].task_description
        task.done           = results.rows[0].task_done
        task.creationDate   = results.rows[0].task_creation_date
        task.lastUpdateDate = results.rows[0].task_last_update_date

        return res.status(200).json({ status: 'Success', task: task })
    } catch (err) {
        return res.status(500).json({ status: 'Error', message: 'Unknown error' })
    }
})

/**
 * PUT /task
 * Creates a new task
 */
router.put('/', async (req: Request, res: Response) => {
    try {
        // Checking if a body was given
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'Error', message: 'No task was given in the body of the request (JSON)' })
        }

        // Convert the request's body into an object
        const task = new Task()
        task.name = req.body.name
        task.description = req.body.description
        task.done = req.body.done ? req.body.done : task.done
        
        // Validating the task
        const validationResult: Joi.ValidationResult = task.validate()
        if (validationResult.error) {
            return res.status(400).json({ status: 'Error', message: validationResult.error.message })
        }

        // Saving the task
        const query = `
            INSERT INTO task (
                task_name,
                task_description,
                task_done,
                task_creation_date,
                task_last_update_date
            )
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING task_id, task_name, task_description, task_done, task_creation_date, task_last_update_date
        `
        console.log(`[DEBUG] Executing query: ${query}`)
        const results = await db.query(query, [ task.name, task.description, task.done ])

        // Checking if a line was created
        if (results.rowCount < 1) {
            return res.status(500).json({ status: 'Error', message: 'Task was not created because of an unknown error' })
        }

        // Creating a task object with the values created in the database
        const createdTask = new Task()
        createdTask.id = results.rows[0].task_id
        createdTask.name = results.rows[0].task_name
        createdTask.description = results.rows[0].task_description
        createdTask.done = results.rows[0].task_done
        createdTask.creationDate = results.rows[0].task_creation_date
        createdTask.lastUpdateDate = results.rows[0].task_last_update_date

        return res.status(201).json({ status: 'Success', task: createdTask })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'Error', message: 'Unknown error' + err })
    }
})

/**
 * PATCH /task/:id
 * Updates an existing task (only the given fields)
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        // Checking if a body was given
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'Error', message: 'No task was given in the body of the request (JSON)' })
        }

        // Checking that the id given is a number
        if (!isNumeric(req.params.id)) {
            return res.status(400).json({ status: 'Error', message: 'The given id is not a number' })
        }

        // Convert the request's body into an object
        // The id of the task is set so that Joi (the validation library) does not consider the name as a required field
        // The name may not be modified so it may be null
        const task = new Task()
        task.id = parseInt(req.params.id)
        task.name = req.body.name
        task.description = req.body.description
        task.done = req.body.done
        
        // Checking for changes
        if (!task.name && !task.description && !task.done) {
            return res.status(200).json({ status: 'Warning', message: 'No non-null values were given, therefore no changes have been made on the task' })
        }

        // Validating the task
        const validationResult: Joi.ValidationResult = task.validate()
        if (validationResult.error) {
            return res.status(400).json({ status: 'Error', message: validationResult.error.message })
        }

        // Preparing the query
        let params = [ '' + req.params.id ]
        let query = `
            UPDATE task
            SET task_last_update_date   = NOW()
            `
        
        // If the name was given in the request, adding it to UPDATE query
        if (task.name && task.name != '') {
            query = query + ', task_name = $' + (params.length + 1)
            params.push(task.name)
        }

        // If the description was given in the request, adding it to UPDATE query
        if (task.description && task.description != '') {
            query = query + ', task_description = $' + (params.length + 1)
            params.push(task.description)
        }

        // If the description was given in the request, adding it to UPDATE query
        if (task.done) {
            query = query + ', task_done = $' + (params.length + 1)
            params.push('' + task.done)
        }

        query = query + `
        WHERE task_id = $1
        RETURNING task_id, task_name, task_description, task_done, task_creation_date, task_last_update_date
        `
        console.log(`[DEBUG] Executing query: ${query}`)
        console.log(params)
        const results = await db.query(query, params)

        // Checking if a line was created
        if (results.rowCount < 1) {
            return res.status(404).json({ status: 'Error', message: 'The task does not exist' })
        }

        // Creating a task object with the values created in the database
        const createdTask = new Task()
        createdTask.id = results.rows[0].task_id
        createdTask.name = results.rows[0].task_name
        createdTask.description = results.rows[0].task_description
        createdTask.done = results.rows[0].task_done
        createdTask.creationDate = results.rows[0].task_creation_date
        createdTask.lastUpdateDate = results.rows[0].task_last_update_date

        return res.status(200).json({ status: 'Success', task: createdTask })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'Error', message: 'Unknown error' + err })
    }
})

/**
 * DELETE /task/:id
 * Deletes a task
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        // Checking that the id given is a number
        if (!isNumeric(req.params.id)) {
            return res.status(400).json({ status: 'Error', message: 'The given id is not a number' })
        }

        const id = parseInt(req.params.id)
        
        // Querying the database to fetch the data
        const results = await db.query(`
            DELETE
            FROM task
            WHERE task_id = $1
            RETURNING task_id
        `, [id])

        // Checking if a row was deleted
        if (results.rowCount === 0) {
            return res.status(404).json({ status: 'Error', message: 'The task does not exist' })
        }

        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ status: 'Error', message: 'Unknown error' })
    }
})

export default router