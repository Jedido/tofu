import fs from "fs"

function shuffle<T>(array: T[]): void {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

const colors = [
  "maroon", "salmon", "tomato", "coral", "sienna",
  "peachpuff", "chocolate", "bisque", "peru", "moccasin",
  "orange", "goldenrod", "gold", "olive", "chartreuse",
  "lime", "aquamarine", "turquoise", "teal", "lavender",
  "navy", "plum", "orchid", "violet", "crimson"
]

const symbols = [
  "triangle", "circle", "star", "moon", "diamond",
  "fire", "cloud", "heart", "hexagon"
]

const letterFrequency = fs.readFileSync("./server/assets/letter_frequency.csv", "utf8")
const letterSampler: [string, number][] = []
let totalLetterFrequency = 0
letterFrequency.trim().split("\n").forEach((line) => {
  const [letter, frequency] = line.split(",")
  totalLetterFrequency += Number(frequency)
  letterSampler.push([letter, totalLetterFrequency])
})

function getRandomWeightedLetter(): string | undefined {
  const sample = Math.random() * totalLetterFrequency
  for (let i = 0; i < letterSampler.length; i++) {
    const [letter, cumulativeFrequency] = letterSampler[i]
    if (sample < cumulativeFrequency) {
      return letter
    }
  }
}


const prefixes = [
  "Al", "Be", "De", "El", "Fa", "Ga", "Jo", "Ka", "La", "Ma",
  "Na", "Pa", "Ra", "Sa", "Ta", "Va", "Zy", "Fi", "Lu", "Or"
]
const roots = [
  "lin", "mar", "son", "vin", "dor", "ric", "dra", "len", "thy",
  "mal", "ven", "cel", "ren", "vra", "ton", "ris", "ver", "wyn", "jas"
]
const suffixes = [
  "ina", "ous", "ian", "lyn", "ith", "ene", "ane", "ell", "ris", "wyn",
  "ion", "ora", "ara", "ryn", "yna", "ine", "iel", "lin", "mar", "ven"
]

function generateName(): string {
  const prefix = randomItem(prefixes)
  const root = randomItem(roots)
  const suffix = randomItem(suffixes)

  return stylizeName(prefix + root + suffix)
}

function stylizeName(name: string): string {
  if (Math.random() > 0.3) {
    return name
  }

  // Randomly capitalize the second letter for effect
  if (Math.random() > 0.6) {
    name = name.substring(0, 2) + name.charAt(2).toUpperCase() + name.slice(3)
  }

  return name.charAt(0).toUpperCase() + name.slice(1) // Ensure the first letter is capitalized
}

export {
  shuffle,
  randomItem,
  symbols,
  colors,
  getRandomWeightedLetter,
  generateName
}
