'use strict'

// Dependencies
const R = require('ramda')

// Entities
const Route = require('./router').Route
const Router = require('./router').Router

class Handler {
  setHandler (handler) {
    this.handler = handler
  }

  static from (handler) {
    const handler_ = new Handler();

    handler_.setHandler(handler)

    return handler_
  }
}

class Method {
  setMethod (method) {
    this.method = method
  }

  setOptions (options) {
    this.options = options
  }

  static from (options, method) {
    if (typeof options === 'function') {
      method = options
      options = {}
    } else if (typeof method !== 'function') {
      throw new TypeError('"method" argument must be a function');
    }

    const method_ = new Method()

    method_.setMethod(method)
    method_.setOptions(options)

    return method_
  }
}

exports.register = function (server, options, next) {
  // Handlers
  R.forEach(([name, handler]) => {
    server.handler(name, handler.handler)
  })(flattenObjBy(Handler, options.handlers))

  // Methods
  R.forEach(([name, method]) => {
    server.method({
      name,
      method: method.method,
      options: method.options
    })
  })(flattenObjBy(Method, options.methods))

  // Routes
  R.forEach(([path, route]) => {
    const url = R.compose(
      R.join('/'),
      R.prepend(''),
      R.concat
    )([path], route.segments)

    server.route({
      path: url,
      method: route.method,
      config: route.config
    })
  })(flattenObjBy(Route, options.routes))

  // Routers
  R.forEach(([path, router]) => {
    for (const route of router.getRoutes()) {
      const url = R.compose(
        R.join('/'),
        R.prepend(''),
        R.concat
      )(R.split('.', path), route.segments)

      console.log(url)

      server.route({
        path: url,
        method: route.method,
        config: route.config
      })
    }
  })(flattenObjBy(Router, options.routes))

  next()
}

exports.register.attributes = {
  name: 'hapi-registrar'
}

function flattenObjBy (type, obj) {
  return R.compose(
    R.chain(([lookup, value]) => {
      if (R.is(type, value)) {
        return [[lookup, value], ...R.map(([name, value]) => [`${lookup}.${name}`, value], flattenObjBy(type, value))]
      } else if (typeof value === "object") {
        return R.map(([name, value]) => [`${lookup}.${name}`, value], flattenObjBy(type, value))
      }

      return []
    }),
    R.toPairs
  )(obj)
}

exports.Route = Route
exports.Router = Router
exports.Method = Method
exports.Handler = Handler
