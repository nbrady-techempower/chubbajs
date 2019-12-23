const ValidationTypes = {
  // input is a valid database id (n > 0)
  databaseId: "databaseId",
  email: "email",
  enforcePositive: "enforcePositive",
  enforcePositiveInt: "enforcePositiveInt",
  minMaxLength: "minMaxLength",
  matchRegex: "matchRegex"
};

const isValidDatabaseId = function(value) {
  // quicker than regexing for non-digits?
  if (("" + value).length !== ("" + parseInt(value)).length) {
    return false;
  }
  value = parseInt(value);
  return !(!value || isNaN(value) || value < 0);
};

/**
 * Validates parameters passed to controllers. In some
 * cases, like in ValidationTypes.enforcePositive, we will
 * sanitize and correct bad input instead of failing completely.
 */
const validate = async function(ctx, validateParams) {
  const { req } = ctx;
  let sanitizedValues = {},
    hardFail = false;

  if (!validateParams) {
    return {
      sanitizedValues,
      hardFail
    };
  }

  for (let rules of validateParams) {
    // the value can be set on a request param, body, or query object
    let key, value;
    if (rules.param) {
      key = rules.param;
      value = req.params[key];
    } else if (rules.body) {
      key = rules.body;
      value = req.body[key];
    } else if (rules.query) {
      key = rules.query;
      value = req.query[key];
    }
    const validationType = rules.type;
    const { msg, validate, sanitize } = rules;

    /**
     * If a sanitize function has been provided, run the value through that
     * before all other validations have been done.
     */
    if (sanitize) {
      try {
        value = sanitize(value);
      } catch (e) {
        ctx.addError(
          msg || "Don't try any funny business. You'll end up in the clink."
        );
        ctx.log.tamper(`Custom sanitization failed for ${key}: ${value}`);

        hardFail = true;
        break;
      }
    }

    /**
     * If a validate function has been passed in, run the value through it.
     * If the function returns true, the validation has passed.
     *
     * This will hardFail if the return value is false.
     */
    if (validate && !validate(value)) {
      ctx.addError(
        msg || "Don't try any funny business. You'll end up in the clink."
      );
      ctx.log.tamper(`Custom validation failed: ${value}`);

      hardFail = true;
      break;
    }

    /**
     * databaseId hardFails if the value is not a valid database id.
     * TODO: Consider a max value
     */
    if (validationType === ValidationTypes.databaseId) {
      if (!isValidDatabaseId(value)) {
        ctx.addError(
          msg || "Don't try any funny business. You'll end up in the clink."
        );
        ctx.log.tamper(
          `${ValidationTypes.databaseId} validation failed: ${value}`
        );

        hardFail = true;
        break;
      }
      value = +value;
    }

    /**
     * enforcePositive does not hardFail. Will send back 1 if the validation
     * fails. Mostly useful for validating page count in paginated data.
     */
    if (validationType === ValidationTypes.enforcePositive) {
      if (!value || isNaN(parseInt(value)) || value <= 0) {
        ctx.log.tamper(
          `${ValidationTypes.enforcePositive} validation failed: ${value}`
        );

        value = 1;
      }
      value = +value;
    }

    /**
     * enforcePositiveInt does not hardFail. Will send back 1 if the validation
     * fails. Mostly useful for validating page count in paginated data.
     */
    if (validationType === ValidationTypes.enforcePositiveInt) {
      if (!value || isNaN(parseInt(value)) || value <= 0) {
        ctx.log.tamper(
          `${ValidationTypes.enforcePositiveInt} validation failed: ${value}`
        );

        value = 1;
      }
      value = Math.round(+value);
    }

    /**
     * minMaxLength hardFails if validation fails. if min or max is undefined,
     * it will be ignored.
     */
    if (validationType === ValidationTypes.minMaxLength) {
      let failed = false;
      if (rules.min !== undefined) {
        if (!value || value.length < rules.min) failed = true;
      }
      if (rules.max !== undefined) {
        if (value && value.length > rules.max) failed = true;
      }
      if (failed) {
        ctx.addError(msg || "You didn't meet the length requirements.");
        ctx.log.tamper(
          `${ValidationTypes.enforcePositive} validation failed: ${value}`
        );
        hardFail = true;
        break;
      }
    }

    /**
     * matchRegex hardFails if validation fails. Input must match the regex
     * provided.
     */
    if (validationType === ValidationTypes.matchRegex) {
      if (!value?.match(rules.regex)) {
        ctx.addError(msg || "You've entered an invalid character.");
        hardFail = true;
        break;
      }
    }

    /**
     * email hardFails if validation fails. Input must match the
     * email regex.
     */
    if (validationType === ValidationTypes.email) {
      if (!value?.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
        ctx.addError(msg || "Please enter a valid email address.");
        hardFail = true;
        break;
      }
    }

    // Sends back a potentially sanitized value
    sanitizedValues[key] = value;
  }

  return {
    hardFail,
    sanitizedValues
  };
};

export default { ValidationTypes, validate };
