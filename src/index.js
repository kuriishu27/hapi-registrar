'use strict'

// Dependencies
const R = require('ramda')

class Method {
  setName (name) {
    this.name = name
  }

  setMethod (method) {
    this.method = method
  }

  setOptions (options) {
    this.options = options
  }

  static from ({ name, method, options }) {
    const method_ = new Method()

    method_.setName(name)
    method_.setMethod(method)
    method_.setOptions(options)

    return method_
  }
}

class Route {
  setPath (path) {
    this.path = path
  }

  setMethod (method) {
    this.method = method
  }

  setHandler (handler) {
    this.handler = handler
  }

  static from ({ path, method, handler }) {
    const route_ = new Route()

    route_.setPath(path)
    route_.setMethod(method)
    route_.setHandler(handler)

    return route_
  }
}

exports.register = function (server, options, next) {
  // Methods
  R.forEachObjIndexed((method, name) => {
    method.setName(name)
    server.method(method)
  })(flattenObjBy(Method, options.methods || {}))

  // Routes
  R.forEachObjIndexed((route, path) => {
    route.setPath(`/${path}`)
    server.route(route)
  })(flattenObjBy(Route, options.routes || {}))

  next()
}

exports.register.attributes = {
  name: 'hapi-registrar'
}

function flattenObjBy (type, obj) {
  const go = obj_ => R.chain(([k, v]) => {
    if (!(v instanceof type)) {
      return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
    } else {
      return [[k, v]]
    }
  }, R.toPairs(obj_))

  return R.fromPairs(go(obj))
}

exports.Method = Method
exports.Route = Route
