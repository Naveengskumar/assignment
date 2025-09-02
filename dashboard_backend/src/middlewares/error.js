export function notFound(req, res, next) {
    const err = new Error(`not found ---> ${req.originalUrl}`)
    err.status = 404;
    next(err);
}

export function errorHandler(err, req, res, next) { 
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server Error',
  });
}