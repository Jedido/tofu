const NS_PER_SEC = 1e9
const NS_TO_MS = 1e6

const getDurationMs = (start: [number, number]): number => {
  const diff = process.hrtime(start)
  return Math.round((diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS)
}

module.exports = {
  getDurationMs
}