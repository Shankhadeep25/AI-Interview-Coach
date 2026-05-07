/**
 * Global Express error handler.
 * Must be registered LAST (after all routes). Catches any unhandled errors
 * thrown or passed via next(err) and returns a consistent JSON response
 * without leaking internal error details to the client.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Log the full error server-side for debugging
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
