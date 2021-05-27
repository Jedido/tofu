class AnagramService {
    constructor() {
        this.settings = {}
        this.words = []
        this.reset()
    }

    register(app) {
        app.get('/anagram/game', (req, res) => {
            res.send('success')
        })
    }

    reset() {
        this.state = {}
        this.ciphers = []
    }
}

module.exports = AnagramService
