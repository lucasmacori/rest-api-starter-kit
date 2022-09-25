import { Pool, QueryResult } from 'pg'

const pool = new Pool()

export default module.exports = {
    query: (queryText: string, params: Array<any>): Promise<QueryResult> => {
        return pool.query(queryText, params)
    }
}