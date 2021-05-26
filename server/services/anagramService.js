class AnagramService {
    constructor() {}
    register(app) {
        app.get('/api/anagram', (req, res) => {
            res.send('success')
        })
    }
}

module.exports = AnagramService
