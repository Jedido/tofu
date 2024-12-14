<template>
  <div id="squaredle" class="select-none text-amber-900 text-center flex flex-col">
    <p class="text-3xl mb-4">Squaredle</p>
    <div class="flex justify-between mb-2 mx-auto px-4" :style="`width:${boardWidth}px;`">
      <span class="text-xl">{{ this.foundWords.length }} / {{ Object.keys(this.allWords).length }} words</span>
      <span v-if="lastGuess" class="text-l">
        <span v-if="guessType === 'valid'">✔️</span>
        <span v-if="guessType === 'bonus'">✨</span>
        <span v-if="guessType === 'invalid'">❌</span>
        {{ this.lastGuess }}
      </span>
    </div>
    <div
      :class="[
        status,
        'grid mx-auto w-full box-border p-3 relative bg-amber-100 text-center font-bold',
      ]"
      :style="{
        'grid-template-rows': `repeat(${size}, 1fr)`,
        'grid-template-columns': `repeat(${size}, 1fr)`,
        fontSize: `${cellSize * 1.2}px`,
        lineHeight: `${cellSize * 1.2}px`,
        height: `${boardWidth - 24}px`,
        width: `${boardWidth - 24}px`,
        gap: `${cellSize / 10}px`
      }"
    >
      <button
        v-for="(cell, index) in board"
        class="relative border-2 rounded"
        :class="[highlightedIndexes.includes(index) ? 'bg-amber-900 text-amber-200 border-amber-200' : (cell.instances ? 'bg-amber-200 hover:bg-amber-300 border-amber-300' : 'bg-gray-300 border-gray-400 text-gray-400')]"
      >
        {{ cell.letter }}
        <p v-if="cell.starts && completionRate > 0.3" class="absolute bottom-0 left-0 text-emerald-500" :style="{ fontSize: `${cellSize / 2}px`, lineHeight: `${cellSize / 2}px`, marginLeft: `${cellSize / 10}px` }">
          {{ cell.starts }}
        </p>
        <p v-if="cell.instances && completionRate > 0.45" class="absolute bottom-0 right-0 text-gray-400" :style="{ fontSize: `${cellSize / 2}px`, lineHeight: `${cellSize / 2}px`, marginRight: `${cellSize / 10}px` }">
          {{ cell.instances }}
        </p>
      </button>
    </div>
    <input
      class="
        my-4
        mx-auto
        px-4
        text-lg
        w-4/6
        text-center
        rounded
        border-2 border-gray-300
        focus:outline-none
        disabled:bg-gray-200
        uppercase
      "
      type="text"
      v-model="answer"
      @keypress="updateAnswer"
      @keydown="inputKeydown"
      focus
      :disabled="!size"
    />
    <div v-if="board.length > 0" class="p-4 rounded bg-white text-left">
      <p class="text-xl text-center">Word Bank</p>
      <div v-for="([len, list]) in Object.entries(wordsByLength)" class="mb-2">
        <div class="font-bold">{{ len }}-letter words:</div>
        <div class="grid grid-cols-4">
          <template v-for="word in list">
            <div v-if="foundWords.includes(word)">{{ word }}</div>
            <div v-else-if="completionRate > 0.6">{{ obscure(word) }}</div>
          </template>
        </div>
        <div v-if="completionRate <= 0.6" class="mb-1 text-amber-600">
          {{ unknownWords(len) }}
        </div>
      </div>
      <p class="text-xl text-center">Bonus Words</p>
      <div class="grid grid-cols-4">
        <p v-for="word in bonusWords">{{ word }}</p>
      </div>
    </div>
    <div class="grid grid-cols-6 p-3 my-2 gap-2">
        <div class="col-span-4 flex flex-col py-2">
          <div>Board Size: {{ boardSize }}</div>
          <input
            v-model="boardSize"
            type="range"
            min="3"
            max="9"
            class="slider"
          />
        </div>
        <button class="bg-emerald-600 border-2 border-emerald-800 text-amber-50 rounded col-span-2" @click="emit('init', { size: boardSize })">
          New Game
        </button>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"

export default {
  name: "SquaredleGame",
  mixins: [socket],
  props: {
    gameWidth: Number,
  },
  data() {
    return {
      board: [],
      foundWords: [],
      allWords: {},
      wordsByLength: {},
      bonusWords: [],
      highlightedIndexes: [],
      boardSize: 4,
      size: 4,
      answer: "",
      lastGuess: "",
      guessType: ""
    }
  },
  mounted() {
    this.on("board", ({ board, foundWords, allWords }) => {
      this.foundWords = foundWords
      this.allWords = allWords
      this.wordsByLength = {}
      this.size = board.length
      for (const word of Object.keys(allWords)) {
        const len = word.length
        if (!this.wordsByLength[len]) {
          this.wordsByLength[len] = []
        }
        this.wordsByLength[len].push(word)
      }
      for (const list of Object.values(this.wordsByLength)) {
        list.sort()
      }
      this.board = board.reduce((acc, cur) => acc.concat(cur), [])
      console.log(this.board)
    })
    this.on("reveal-word", (word) => {
      if (!this.foundWords.includes(word)) {
        this.foundWords.push(word)
        const letters = this.allWords[word]
        this.board[letters[0][0] * this.size + letters[0][1]].starts--
        for (const [x, y] of letters) {
          this.board[this.boardIndex(x, y)].instances--
        }
      }
    })
    this.on("bonus-word", (word) => {
      if (!this.bonusWords.includes(word)) {
        this.bonusWords.push(word)
        this.bonusWords.sort()
      }
    })
    this.on("guess-response", (word, guessType) => {
      this.lastGuess = word
      this.guessType = guessType
    })
    this.emit("get")
  },
  methods: {
    inputKeydown(e) {
      if (e.keyCode === 13) {
        if (this.answer.length < 4) {
          this.guessType = "invalid"
          this.lastGuess = "too short"
        } else if (this.foundWords.includes(this.answer.toUpperCase())) {
          this.guessType = "valid"
          this.lastGuess = `${this.answer} already found`
        } else if (this.bonusWords.includes(this.answer.toUpperCase())) {
          this.guessType = "bonus"
          this.lastGuess = `${this.answer} already found`
        } else {
          this.emit("submit", this.answer)
        }
        this.answer = ""
        this.highlightedIndexes = []
      }
      if (e.keyCode === 8) {
        this.highlightedIndexes.pop()
      }
    },
    updateAnswer(e) {
      const c = String.fromCharCode(e.keyCode)
      const potentialString = `${this.answer}${c}`
      if (this.highlightWord(potentialString)) {
        return true
      } else {
        e.preventDefault()
      }
    },
    highlightWord(word) {
      const wordIndexes = this.findWord(word)
      if (wordIndexes.length === 0) {
        return false
      }
      this.highlightedIndexes = wordIndexes
      return true
    },
    findWord(word) {
      const stack = []
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          stack.push([x, y, word.toUpperCase(), []])
        }
      }
      let found = false
      while (!found && stack.length > 0) {
        const [x, y, charsLeft, seen] = stack.pop()
        const index = this.boardIndex(x, y)
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || seen.includes(index) || charsLeft.charAt(0) !== this.board[index].letter) {
          continue
        }
        seen.push(index)
        if (charsLeft.length === 1) {
          return seen
        }
        const chars = charsLeft.substring(1)
        stack.push([x + 1, y, chars, seen.slice()])
        stack.push([x - 1, y, chars, seen.slice()])
        stack.push([x, y + 1, chars, seen.slice()])
        stack.push([x, y - 1, chars, seen.slice()])
        stack.push([x + 1, y + 1, chars, seen.slice()])
        stack.push([x - 1, y - 1, chars, seen.slice()])
        stack.push([x + 1, y - 1, chars, seen.slice()])
        stack.push([x - 1, y + 1, chars, seen.slice()])
      }
      return []
    },
    obscure(word) {
      if (word.length < 6) {
        return `${word.charAt(0)}${"*".repeat(word.length - 1)}`
      } else if (word.length == 6) {
        return `${word.substring(0, 2)}****`
      } else if (word.length < 9) {
        return `${word.substring(0, 2)}****${word.substring(6)}`
      } else {
        return `${word.substring(0, 2)}${"*".repeat(word.length - 4)}${word.substring(word.length - 2)}`
      }
    },
    unknownWords(length) {
      let count = 0
      for (const word of this.wordsByLength[length]) {
        if (!this.foundWords.includes(word)) {
          count++
        }
      }
      if (count === 0) {
        return ''
      }
      if (count === 1) {
        return "(Only 1 word left!)"
      }
      return `(there are ${count} words left to go)`
    },
    boardIndex(x, y) {
      return x * this.size + y
    }
  },
  computed: {
    boardWidth() {
      return Math.max(Math.min(this.gameWidth, 600), 300)
    },
    cellSize() {
      return (this.boardWidth / 2 - 48) / this.size - 4
    },
    completionRate() {
      return this.foundWords.length / Object.keys(this.allWords).length
    }
  }
}
</script>

<style scoped>
.slider {
  margin-top: 8px;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #f3f4f6;
  border: 1px solid #9ca3af;
  outline: none;
  transition: background-color 0.2s;
}

.slider:hover {
  background: #e5e7eb;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}
</style>
