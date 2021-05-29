const BOMB = -10
const FLAG = -20
const HIDDEN = -30
const BLANK = -40
const BOOM = -50

class MinesweeperService {
    constructor() {
        this.field = []
        this.revealed = []
        this.gameStatus = 'ongoing'
        this.spaces = 0
        this.numBombs = 0
    }

    revealBoard() {
        let size = this.field.length
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (this.revealed[x][y] === HIDDEN) {
                    this.revealed[x][y] = this.field[x][y]
                }
            }
        }
    }

    increment(field, x, y) {
        if (this.verify(field, x, y) && field[x][y] !== BOMB) {
            field[x][y]++
        }
    }

    verify(field, x, y) {
        let size = field.length
        return x >= 0 && x < size && y >= 0 && y < size
    }

    register(app) {
        app.get('/minesweeper/board', (req, res) => {
            res.send(JSON.stringify({
                'status': this.gameStatus,
                'size': this.revealed.length,
                'mines': this.numBombs,
                'board': this.revealed
            }))
        })
        app.post('/minesweeper/init', (req, res) => {
            const { size, bombs } = req.body
            this.gameStatus = 'ongoing'
            this.field = []
            this.revealed = []
            for (let x = 0; x < size; x++) {
                let row = []
                let rev = []
                for (let y = 0; y < size; y++) {
                    row[y] = 0
                    rev[y] = HIDDEN
                }
                this.field[x] = row
                this.revealed[x] = rev
            }
            this.numBombs = bombs
            let bombsLeft = bombs
            let spacesLeft = size * size
            this.spaces = size * size
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    if (bombsLeft / spacesLeft > Math.random()) {
                        this.field[x][y] = BOMB
                        this.increment(this.field, x + 1, y + 1)
                        this.increment(this.field, x + 1, y)
                        this.increment(this.field, x + 1, y - 1)
                        this.increment(this.field, x, y + 1)
                        this.increment(this.field, x, y - 1)
                        this.increment(this.field, x - 1, y + 1)
                        this.increment(this.field, x - 1, y)
                        this.increment(this.field, x - 1, y - 1)
                        bombsLeft--
                        this.spaces--
                    }
                    spacesLeft--
                }
            }
            res.sendStatus(200)
        })
        app.post('/minesweeper/reveal', (req, res) => {
            const { x, y } = req.body
            if (this.revealed[x][y] !== FLAG) {
                if (this.field[x][y] === BOMB) {
                    this.revealBoard()
                    this.revealed[x][y] = BOOM
                    this.gameStatus = 'lose'
                } else {
                    let queue = []
                    queue.push([x, y])
                    while (queue.length > 0) {
                        let next = queue.shift()
                        let a = parseInt(next[0])
                        let b = parseInt(next[1])
                        if (this.verify(this.field, a, b)) {
                            let reveal = this.revealed[a][b]
                            if (reveal === HIDDEN) {
                                let val = this.field[a][b]
                                this.spaces--
                                if (val === 0) {
                                    queue.push([a + 1, b + 1])
                                    queue.push([a + 1, b])
                                    queue.push([a + 1, b - 1])
                                    queue.push([a, b + 1])
                                    queue.push([a, b - 1])
                                    queue.push([a - 1, b + 1])
                                    queue.push([a - 1, b])
                                    queue.push([a - 1, b - 1])
                                    this.revealed[a][b] = BLANK
                                } else {
                                    this.revealed[a][b] = val
                                }
                            }
                        }
                    }
                    if (this.spaces === 0) {
                        this.revealBoard()
                        this.gameStatus = 'win'
                    }
                }
            }
            res.sendStatus(200)
        })
        app.post('/minesweeper/flag', (req, res) => {
            const { x, y } = req.body
            if (this.revealed[x][y] === FLAG) {
                this.revealed[x][y] = HIDDEN
            } else if (this.revealed[x][y] === HIDDEN) {
                this.revealed[x][y] = FLAG
            }
            res.sendStatus(200)
        })
    }
}

module.exports = MinesweeperService
