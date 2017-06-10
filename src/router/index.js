'use strict'

const routes = new WeakMap()

class Route {
  setMethod (method) {
    this.method = method
  }

  setConfig (config) {
    this.config = config
  }

  setSegments (segments) {
    this.segments = segments
  }

  static from (method, segments, config) {
    if (segments.constructor === Object) {
      config = segments
      segments = []
    } else if (!config || config.constructor !== Object) {
      throw new TypeError('"config" argument must be an object');
    }

    const route_ = new Route()

    route_.setMethod(method)
    route_.setConfig(config)
    route_.setSegments(segments)

    return route_
  }
}

class Router {
  constructor() {
    routes.set(this, [])
  }

  addRoute (...args) {
    routes.get(this).push(Route.from(...args))
  }

  getRoutes () {
    return routes.get(this)
  }

  static using (strategy, options) {
    const router = new Router()

    switch (strategy) {
      case 'BREAD':
        options.browse && router.addRoute('GET', options.browse)
        options.read && router.addRoute('GET', ['{id}'], options.read)
        options.edit && router.addRoute('PATCH', ['{id}'], options.edit)
        options.add && router.addRoute('PUT', options.add)
        options.delete && router.addRoute('DELETE', ['{id}'], options.delete)
        break

      default:
        throw TypeError(`Unknown strategy '${strategy}'`)
    }

    return router
  }
}

exports.Route = Route
exports.Router = Router
