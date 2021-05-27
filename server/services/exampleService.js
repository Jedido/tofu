class ExampleService {
    constructor() {
        this.settings = {}
        this.words = []
        this.reset()
    }

    register(app) {
        app.get('/get-example', (req, res) => {
            res.send('success with params: ' + req.params)
        })
        app.post('/post-example', (req, res) => {
            res.send('success with body: ' + req.body)
        })
    }

    reset() {
        this.state = {}
        this.ciphers = []
    }
}

module.exports = ExampleService
