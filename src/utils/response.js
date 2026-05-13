export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res, data) {
  return ok(res, data, 201);
}

export function fail(res, message, status = 400, extra = {}) {
  return res.status(status).json({ success: false, error: message, ...extra });
}

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
