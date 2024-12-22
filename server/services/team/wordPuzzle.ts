import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, WordPuzzleSolution } from "./types"

const fs = require("fs")
const { randomItem, shuffle, getRandomWeightedLetter, generateName } = require("../../utils/util.js")

interface WordPuzzlePI extends PanelInfo {
  words: string[],
  name: string
}
interface WordKeyPI extends PanelInfo {
  letters: string,
  name: string
}


export class WordPuzzle extends Puzzle {
  static wordPools: Map<string, string[]>
  static offWordPools: Map<string, string[]>
  static featureWords: string[]
  static names: Set<string>
  puzzle: WordPuzzlePI
  key: WordKeyPI

  static reset() {
    this.names = new Set<string>()
    if (!this.wordPools) {
      this.wordPools = new Map<string, string[]>()
      this.offWordPools = new Map<string, string[]>()
      this.featureWords = []
      const file: string = fs.readFileSync("./server/assets/puzzle_words.txt", "utf8")
      const wordList: string[] = file.trim().split("\n")
      for (const word of wordList) {
        const cleanedWord = word.trim()
        const letters = Array.from(new Set(cleanedWord)).sort()
        if (letters.length === 5) {
          this.featureWords.push(cleanedWord)
        }
        const key = letters.join('')
        if (!this.wordPools.has(key)) {
          this.wordPools.set(key, [cleanedWord])
        } else {
          this.wordPools.get(key)!.push(cleanedWord)
        }
        for (let i = 0; i < letters.length; i++) {
          const combo = [...letters.slice(0, i), ...letters.slice(i + 1)].join('')
          if (!this.offWordPools.has(combo)) {
            this.offWordPools.set(combo, [cleanedWord])
          } else {
            this.offWordPools.get(combo)!.push(cleanedWord)
          }
        }
      }
    }
  }

  static getCombinations(combinations: Set<string>, cur: string, letters: string[]): Set<string> {
    if (cur.length > 1) {
      combinations.add(cur)
    }
    for (let i = 0; i < letters.length ; i++) {
      const next = `${cur}${letters[i]}`
      this.getCombinations(combinations, next, letters.slice(i + 1, letters.length))
    }
    return combinations
  }

  constructor(id: Id) {
    super(id)

    const chosenWord: string = randomItem(WordPuzzle.featureWords)
    const uniqueLetters = new Set(chosenWord.trim())
    while (uniqueLetters.size < 6) {
      uniqueLetters.add(getRandomWeightedLetter())
    }
    const letters = Array.from(uniqueLetters).sort()
    const combos = Array.from(WordPuzzle.getCombinations(new Set<string>(), '', letters))
    const wordPool = Array.from(new Set(combos.flatMap((key) => WordPuzzle.wordPools.get(key)))).filter(x => !!x)
    const wordSet = new Set(wordPool)
    const offWordPool = Array.from(new Set(combos.flatMap((key) => WordPuzzle.offWordPools.get(key)))).filter(x => !!x && !wordSet.has(x))
    const chosenWords = new Set([chosenWord])
    let iterations = 0
    while (chosenWords.size < 4 && iterations < 100) {
      if (Math.random() < 0.5) {
        chosenWords.add(randomItem(wordPool))
      } else {
        chosenWords.add(randomItem(offWordPool))
      }
      iterations++
    }
    const words = Array.from(chosenWords)
    shuffle(words)
    shuffle(letters)
 
    let name
    do {
      name = generateName()
    } while (WordPuzzle.names.has(name));
    this.puzzle = {
      words,
      name
    }
    this.key = {
      letters: letters.join(''),
      name
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Word,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Word,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static solve({ selected }: WordPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as WordPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as WordKeyPI
    const letters = new Set(key.letters)
    for (let i = 0; i < puzzle.words.length; i++) {
      let isValid = true
      for (const c of new Set(puzzle.words[i])) {
        isValid &&= letters.has(c)
      }
      if (selected[i] !== isValid) {
        return false
      }
    }
    return true
  }
}