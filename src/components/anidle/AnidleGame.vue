<template>
  <div id="anidle" class="overflow-x-hidden">
    <canvas class="hidden" id="text-canvas"></canvas>
    <div v-if="state === 'game'" class="pb-40">
      <div class="mt-4 bg-gray-800 text-amber-50 border-2 border-gray-600 px-6 py-3 rounded-lg min-w-80">
        <h2 class="text-2xl text-center">{{ loading ? "Finding an Anime..." : (revealed ? answer : '???') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
          <div class="mb-2">
            <div>
              <div class="font-semibold mb-1">Theme{{ revealed ? `: ${audioClue.track.title} (${audioClue.track.slug})` : "" }}</div>
              <AudioClue
                v-if="!loading"
                :track="audioClue.track.link"
                :start="audioClue.start"
              />
            </div>
            <div>
              <span class="font-semibold">Series:</span>
              <span v-if="revealedData.source" class="ml-2 text-emerald-400">{{ revealedData.source }}</span>
              <span v-else class="ml-2 text-amber-500">Unknown</span>
            </div>
            <div>
              <span class="font-semibold">Popularity:</span>
              <RangeHint
                :min="revealedData.popularityMin"
                :max="revealedData.popularityMax"
              />
            </div>
            <div>
              <span class="font-semibold">Rank:</span>
              <RangeHint
                :min="revealedData.rankMin"
                :max="revealedData.rankMax"
              />
            </div>
            <div>
              <span class="font-semibold">Score:</span>
              <RangeHint
                :min="revealedData.scoreMin"
                :max="revealedData.scoreMax"
              />
            </div>
            <div>
              <span class="font-semibold">Start Date:</span>
              <RangeHint
                :min="revealedData.airedStartMin"
                :max="revealedData.airedStartMax"
              />
            </div>
            <div>
              <span class="font-semibold">End Date:</span>
              <RangeHint
                :min="revealedData.airedEndMin"
                :max="revealedData.airedEndMax"
              />
            </div>
            <div>
              <span class="font-semibold">Genres:</span>
              <div class="ml-2 grid grid-cols-2" v-if="!loading">
                <ul v-if="revealedData.correctGenres.length > 0">
                  <li class="text-emerald-400" v-for="genre in revealedData.correctGenres">✓ {{ genre }}</li>
                </ul>
                <ul v-if="revealedData.incorrectGenres.length > 0">
                  <li class="text-error" v-for="genre in revealedData.incorrectGenres">✗ {{ genre }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h2 class="md:hidden text-center text-xl my-2">Synopsis</h2>
            <p class="text-sm leading-6">
              <RedactedWord
                v-for="(word, index) in synopsisProps"
                :key="index"
                :word="word.word"
                :unredact="word.unredact"
              />
            </p>
          </div>
        </div>        
        <div class="mt-4 relative">
          <input 
            type="text" 
            v-model="input"
            @keyup.enter="guess"
            placeholder="Search an Anime..."
            class="px-4 py-1 rounded bg-gray-500 focus:outline-none w-full"
            :disabled="loading"
          />
          <div class="text-error text-sm ml-2" v-if="errorMessage">{{ errorMessage }}</div>
          <ul class="absolute z-10 bg-gray-700 text-gray-200 opacity-90 w-full top-8 max-h-52 overflow-y-auto">
            <li
              v-for="suggestion in autocompleteSuggestions"
              :key="suggestion.mal_id"
              class="border-t border-gray-600 pl-3 py-1 hover:bg-gray-600 cursor-pointer"
              @click="selectAutocomplete(suggestion)"
            >
              <AutocompleteSuggestion
                :suggestion="suggestion.title"
                :current-input="input"
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-4">
        <h2 class="text-xl font-semibold mb-2">Guesses</h2>
        <ul class="flex flex-col-reverse">
          <GuessCard v-for="(guess, index) in guesses" :key="index" v-bind="guess" class="mb-2" />
        </ul>
      </div>
      <div class="mt-4" v-if="revealed">
        <button @click="startGame" class="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg">Start Game</button>
      </div>
    </div>
    <div v-else class="bg-white my-4 py-2 px-4">
      <h2 class="text-2xl font-semibold mb-2 text-center mt-1">Anidle</h2>
      <div>
        <div class="text-lg font-semibold mb-2">Instructions</div>
        <ol class="list-decimal ml-6">
          <li>Listen to the theme song and guess the anime that it's from.</li>
          <li>Anime data is sourced from MyAnimeList, and will be one of the top 300 most popular anime.</li>
          <li>Seasons are listed individually, so be specific.</li>
          <li>If you guess incorrectly, you will get hints based on the information of the guessed anime.</li>
          <li>Additionally, as you make more guesses, the synopsis will gradually be revealed.</li>
        </ol>
      </div>
      <div class="mt-4">
        <button @click="startGame" class="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg">Start Game</button>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from "canvas-confetti"

import socket from "@/mixins/socket.js"
import breakpoints from "@/mixins/breakpoints.js"
import RangeHint from "./RangeHint.vue"
import AudioClue from "./AudioClue.vue"
import GuessCard from "./GuessCard.vue"
import RedactedWord from "./RedactedWord.vue"
import AutocompleteSuggestion from "./AutocompleteSuggestion.vue"

export default {
  name: "AnidleGame",
  components: {
    AudioClue,
    RangeHint,
    GuessCard,
    RedactedWord,
    AutocompleteSuggestion
  },
  mixins: [socket, breakpoints],
  data() {
    return {
      state: "instructions",
      audioLoading: true,
      audioClue: {},
      answer: null,
      guesses: [],
      input: "",
      revealed: false,
      loading: false,
      revealedData: {},
      autocompleteOptions: [],
      autocompleteQuery: "",
      synopsis: "",
      revealedSynopsis: []
    }
  },
  mounted() {
    this.on("loading", () => {
      this.state = "game"
      this.loading = true
    })
    this.on("init-game", ({ synopsis, audioClue, revealedData }) => {
      this.state = "game"
      this.guesses = []
      this.loading = false
      this.revealed = false
      this.synopsis = synopsis
      this.revealedSynopsis = Array.from({ length: synopsis.split(" ").length }, () => false)
      this.audioClue = audioClue
      this.revealedData = revealedData
    })
    this.on("guess-start", this.guessStart)
    this.on("guess-result", this.guessResult)
    this.on("repeat-guess", this.repeatGuess)
    this.on("autocomplete-result", ({ options, query}) => {
      this.autocompleteOptions = options
      this.autocompleteOptions.sort((a, b) => a.aka.localeCompare(b.aka))
      this.autocompleteQuery = query
    })
    this.on("win", ({ title }) => {
      this.revealed = true
      this.answer = title
      this.confetti(5)
    })
  },
  methods: {
    startGame() {
      this.emit("start")
    },
    repeatGuess({ name }) {
      this.errorMessage = `${name} has already been guessed!`
    },
    guessStart(guess) {
      this.guesses.push(guess)
    },
    guessResult({ revealedData, guess, revealIndices }) {
      this.revealedData = revealedData

      const existingGuess = this.guesses.find(g => g.mal_id === guess.mal_id)
      if (existingGuess) {
        existingGuess.image_url = guess.image_url
        existingGuess.correct = guess.correct
      }

      revealIndices.forEach((index) => {
        this.revealedSynopsis[index] = true
      })
    },
    guess() {
      if (!this.input || !this.autocompleteSuggestions.length) {
        this.input = ""
        this.errorMessage = "Please enter a valid anime name!"
        return
      }
      const guess = this.autocompleteSuggestions[0]
      this.emit("guess", { title: guess.title, mal_id: guess.mal_id })
      this.input = ""
      this.autocompleteQuery = ""
      this.autocompleteOptions = []
    },
    selectAutocomplete(suggestion) {
      this.input = ''
      this.autocompleteQuery = ''
      this.autocompleteOptions = []
      this.emit('guess', { title: suggestion.title, mal_id: suggestion.mal_id })
    },
    confetti(times) {
      if (times > 0) {
        confetti({
          particleCount: 50,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.3 },
          startVelocity: 20
        })
        setTimeout(() => {
          this.confetti(times - 1)
        }, 250)
      }
    }
  },
  computed: {
    autocompleteSuggestions() {
      if (!this.autocompleteQuery) {
        return []
      }
      this.errorMessage = ""
      const suggestions = []
      for (const option of this.autocompleteOptions) {
        if (option.aka.toLowerCase().startsWith(this.input.toLowerCase()) && !suggestions.some(s => s.mal_id === option.mal_id)) {
          suggestions.push({
            title: option.aka,
            mal_id: option.mal_id
          })
        }
      }
      for (const option of this.autocompleteOptions) {
        if (option.aka.toLowerCase().includes(this.input.toLowerCase()) && !suggestions.some(s => s.mal_id === option.mal_id)) {
          suggestions.push({
            title: option.aka,
            mal_id: option.mal_id
          })
        }
      }
      return suggestions
    },
    synopsisProps() {
      if (this.loading) {
        return []
      }
      return this.synopsis.split(" ").map((word, index) => ({
        word: word.trim(),
        unredact: this.revealedSynopsis[index] || this.revealed
      }))
    }
  },
  watch: {
    input: {
      handler(input) {
        if (input.length > 2 && (!this.autocompleteQuery || input.toLowerCase().indexOf(this.autocompleteQuery) === -1)) {
          this.emit("autocomplete", input)
        } else if (input.length <= 2) {
          this.autocompleteQuery = ""
          this.autocompleteOptions = []
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
