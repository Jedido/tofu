class Router {
  constructor(services) {
    this.services = services
  }
  apply(app) {
    this.services.forEach(service => {
      service.register(app)
    })
  }
}

module.exports = Router
