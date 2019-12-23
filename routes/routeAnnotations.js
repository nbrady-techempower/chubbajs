const { context } = require("../server");
const { ValidationTypes, validate } = require("./validate");
const RouteContext = require("./RouteContext");

/**
 * The user cannot enter this route unless they are authorized
 */
function authorize(target, key, descriptor) {
  target[key].authorize = true;
}

/**
 * The user will skip over this route if they are not authorized
 */
function skipIfUnauthorized(target, key, descriptor) {
  target[key].skipIfUnauthorized = true;
}

/**
 * This annotation is used to validate param/body values to avoid redundancy
 * in controllers.
 */
function validateParams(...params) {
  return function(target, key, descriptor) {
    target[key].validateParams = params;
  };
}

/**
 * The entire route controller is wrapped in a transaction so no updates
 * will persist in the context of that controller if the transaction is
 * rolled back.
 */
function transaction(target, key, descriptor) {
  target[key].transaction = true;
}

/**
 * Most controllers need a database pool to work with. This annotation is
 * an optimization so that certain controllers won't request access to
 * the database pool.
 */
function noDatabase(target, key, descriptor) {
  target[key].noDatabase = true;
}

function processNextController(ctx) {
  if (!ctx.res.headersSent) {
    ctx.next();
  }
}

/**
 * Creates the route and handles all the annotations
 * @param httpVerb
 * @param path
 * @param descriptor
 */
function createRoute(httpVerb, path, descriptor) {
  const fn = descriptor.value;

  const wrappedController = async function(req, res, next) {
    // Set up a context object that will live through the request
    // if it doesn't already exist
    const ctx = req.__ctx || new RouteContext(req, res, next);
    req.__ctx = ctx;

    // reset before every controller is called
    ctx.controllerErrors = false;

    // if @skipIfUnauthorized, go to next() right away
    if (fn.skipIfUnauthorized && !ctx.isLoggedIn) {
      return processNextController(ctx);
    }

    /**
     * Performs validation checks. May want to move this logic out of here
     * as it will grow.
     */
    let sanitizedValues;
    if (fn.validateParams) {
      const validated = await validate(ctx, fn.validateParams);
      if (validated.hardFail) {
        return processNextController(ctx);
      }
      sanitizedValues = validated.sanitizedValues;
    }

    if (fn.noDatabase) {
      await fn(ctx, sanitizedValues);
      return processNextController(ctx);
    }

    /********************************************************************
     * The following section pertains to controllers that need a database
     * connection.
     */

    if (!fn.transaction) {
      try {
        ctx.db = await context.pool;
        await fn(ctx, sanitizedValues);
      } catch (e) {
        console.log(e);
        console.log(`Something went wrong with in ${path}: ${e.message}`);
      }
      return processNextController(ctx);
    }

    // For controllers with @transaction
    ctx.db = await context.pool.connect();
    try {
      await ctx.db.query("BEGIN");
      await fn(ctx, sanitizedValues);
      if (ctx.controllerErrors === true) {
        await ctx.db.query("ROLLBACK");
      } else {
        await ctx.db.query("COMMIT");
      }
      return processNextController(ctx);
    } catch (e) {
      await ctx.db.query("ROLLBACK");
      ctx.addError("Something went wrong. Please try again later.");
      console.log(e);
      console.log(`Something went wrong with in ${path}: ${e.message}`);
    } finally {
      ctx.db.release();
    }

    return processNextController(ctx);
  };

  context.app[httpVerb](path, wrappedController);
}

function GET(path) {
  return function route(target, key, descriptor) {
    createRoute("get", path, descriptor);
  };
}

function POST(path) {
  return function route(target, key, descriptor) {
    createRoute("post", path, descriptor);
  };
}

function UPDATE(path) {
  return function route(target, key, descriptor) {
    createRoute("update", path, descriptor);
  };
}

function DELETE(path) {
  return function route(target, key, descriptor) {
    createRoute("delete", path, descriptor);
  };
}

function ALL(path) {
  return function route(target, key, descriptor) {
    createRoute("all", path, descriptor);
  };
}

module.exports = {
  GET,
  POST,
  UPDATE,
  DELETE,
  ALL,
  authorize,
  transaction,
  noDatabase,
  skipIfUnauthorized,
  validateParams,
  ValidationTypes
};
