'use strict'

// Dependencies
const R = require('ramda')

class Method {
  setMethod (method) {
    this.method = method
  }

  setOptions (options) {
    this.options = options
  }

  static from (options, method) {
    if (typeof options === 'function') {
      method = options;
      options = {};
    } else if (typeof method !== 'function') {
      throw new TypeError('"method" argument must be a function');
    }

    const method_ = new Method()

    method_.setMethod(method)
    method_.setOptions(options)

    return method_
  }
}

class Route {
  setMethod (method) {
    this.method = method
  }

  setHandler (handler) {
    this.handler = handler
  }

  setSegments (segments) {
    this.segments = segments
  }

  static from (method, segments, handler) {
    if (typeof segments === 'function') {
      handler = segments;
      segments = [];
    } else if (typeof handler !== 'function') {
      throw new TypeError('"handler" argument must be a function');
    }

    const route_ = new Route()

    route_.setMethod(method)
    route_.setHandler(handler)
    route_.setSegments(segments)

    return route_
  }
}

exports.register = function (server, options, next) {
  // Methods
  R.forEachObjIndexed((method, name) => {
    server.method({
      name,
      method: method.method,
      options: method.options
    })
  })(flattenObjBy(Method, options.methods || {}))

  // Routes
  R.forEachObjIndexed((route, path) => {
    server.route({
      path: '/' + path,
      method: route.method,
      handler: route.handler
    })
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
