const getActualRequestDurationInMilliseconds = start => {
  const NS_PER_SEC = 1e9
  const NS_TO_MS = 1e6
  const diff = process.hrtime(start)
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

const loggingMiddleware = (req, res, next) => {
  const now = new Date()
  const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  const start = process.hrtime()
  const elapsed = getActualRequestDurationInMilliseconds(start)
  res.on('finish', () => {
    console.log({
      info: `[${date}] ${req.method} ${req.url} responded with ${res.statusCode} (${elapsed}ms)`,
      payload: {
        params: req.params,
        query: req.query,
        body: req.body
      },
      response: {
        client: req.connection.remoteAddress
      }
    })
  })
  next()
}

module.exports = loggingMiddleware
