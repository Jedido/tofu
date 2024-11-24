function shuffle(array) {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }
}

function randomItem(array) {
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

module.exports = {
  shuffle,
  randomItem,
  symbols,
  colors
}