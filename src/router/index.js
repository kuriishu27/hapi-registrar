"use strict";

const routes = new WeakMap();

class Route {
  setMethod(method) {
    this.method = method;
  }

  setConfig(config) {
    this.config = config;
  }

  setSegments(segments) {
    this.segments = segments;
  }

  static from(method, segments, config) {
    if (!config && segments.constructor === Object) {
      config = segments;
      segments = [];
    } else if (!config || config.constructor !== Object) {
      throw new TypeError('"config" argument must be an object');
    }

    const route = new Route();

    route.setMethod(method);
    route.setConfig(config);
    route.setSegments(segments);

    return route;
  }
}

class Router {
  constructor() {
    routes.set(this, []);
  }

  addRoute(...args) {
    routes.get(this).push(Route.from(...args));
  }

  getRoutes() {
    return routes.get(this);
  }

  static using(strategy, options, config) {
    if (!config && options.constructor === Object) {
      config = options;
      options = {};
    } else if (!config && options.constructor !== Object) {
      throw new TypeError('"config" argument must be an object');
    }

    const router = new Router();
    let paramName = "{id}";

    if (options.paramName) {
      paramName = `{${options.paramName}}`;
    }

    switch (strategy) {
      case "default":
        for (let method in config) {
          if (config.hasOwnProperty(method)) {
            if (config[method].constructor === Array) {
              router.addRoute(method, [config[method][0]], config[method][1]);
            } else {
              router.addRoute(method, config[method]);
            }
          }
        }
      case "BREAD":
        config.browse && router.addRoute("GET", config.browse);
        config.read && router.addRoute("GET", [paramName], config.read);
        config.edit && router.addRoute("PATCH", [paramName], config.edit);
        config.add && router.addRoute("PUT", config.add);
        config.delete && router.addRoute("DELETE", [paramName], config.delete);
        break

      case 'CUSTOMPOST':
      config.post && router.addRoute('POST', [paramName], config.post)
      config.authenticate && router.addRoute('POST', [paramName], config.post)
        break

      default:
        throw TypeError(`Unknown strategy '${strategy}'`);
    }

    if (options.subroutes) {
      if (!options.paramName) {
        throw new Error('"paramName" must be specified');
      }

      const subroutes = {};

      for (const subroute in options.subroutes) {
        if (options.subroutes.hasOwnProperty(subroute)) {
          subroutes[subroute] = options.subroutes[subroute];
        }
      }

      router[`{${options.paramName}}`] = subroutes;
    }

    return router;
  }
}

exports.Route = Route;
exports.Router = Router;
