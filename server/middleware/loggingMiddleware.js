const { getDurationMs } = require("../utils/timing")

const loggingMiddleware = (req, res, next) => {
  const start = process.hrtime()
  res.on("finish", () => {
    const now = new Date()
    const date = `${now.getFullYear()}-${now.getMonth()}-${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    const elapsed = getDurationMs(start)
    console.log({
      cat: "access",
      uri: req.url,
      method: req.method,
      status: res.statusCode,
      params: req.params,
      query: req.query,
      body: req.body,
      durationms: elapsed,
      client: req.connection.remoteAddress,
      ts: date,
    })
  })
  next()
}

module.exports = loggingMiddleware
