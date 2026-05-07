const { ZodError } = require('zod');

/**
 * Express middleware factory — validates req.body against a Zod schema.
 * Returns 400 with structured errors if validation fails.
 *
 * Usage:
 *   const { registerSchema } = require('../validators/authValidator');
 *   router.post('/register', validate(registerSchema), controller);
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      // parse() throws ZodError on failure, returns validated + transformed data on success
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

module.exports = validate;
