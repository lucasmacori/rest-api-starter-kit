import dotenv from 'dotenv'
import chai from 'chai'
import chaiHttp from 'chai-http'

dotenv.config()
const port = process.env.PORT || 8000
chai.use(chaiHttp)

describe('GET /v1/task', () => {
    it('should return a json response containing a list of tasks', () => chai.request(`http://localhost:${port}`)
        .get('/api/v1/task')
        .then(response => {
            chai.expect(response).to.have.status(200)
            chai.expect(response).to.be.json
            // Status
            chai.expect(response.body.status).to.be.a('string')
            chai.expect(response.body.status).to.be.equal('Success')
            // Task
            chai.expect(response.body.tasks).to.be.an('array')
            chai.expect(response.body.tasks).to.have.length.greaterThanOrEqual(1)
            chai.expect(response.body.tasks[0].id).to.be.a('number')
            chai.expect(response.body.tasks[0].name).to.be.a('string')
            chai.expect(response.body.tasks[0].done).to.be.a('boolean')
            chai.expect(response.body.tasks[0].creationDate).to.be.a('string')
            chai.expect(response.body.tasks[0].lastUpdateDate).to.be.a('string')
        })
    )
})