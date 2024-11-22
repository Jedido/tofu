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
  "crimson", "maroon", "coral", "aquamarine", "lime", 
  "navy", "teal", "fuchsia", "orchid", "bisque", 
  "salmon", "tomato", "gold", "aqua", "olive", 
  "aqua", "lavender", "chocolate", "ivory", "azure"
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