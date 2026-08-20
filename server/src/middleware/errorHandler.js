// Throw this from a route/service to send a specific status + message to the
// client. Anything else (a bare Error, a DB driver exception, etc.) is
// treated as unexpected and always returns a generic 500 to the client, even
// though it still gets logged in full server-side for debugging.
export class AppError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
    this.isOperational = true;
  }
}

// eslint-disable-next-line no-unused-vars -- Express requires 4 params to recognize error middleware.
export function errorHandler(err, req, res, next) {
  const requestId = req.id ?? 'unknown';

  if (err.isOperational) {
    console.warn(`[${requestId}] ${req.method} ${req.originalUrl} -> ${err.status}: ${err.message}`);
    return res.status(err.status).json({ error: err.publicMessage });
  }

  console.error(`[${requestId}] ${req.method} ${req.originalUrl} -> unhandled error:`, err);
  res.status(500).json({ error: 'Internal server error' });
}
