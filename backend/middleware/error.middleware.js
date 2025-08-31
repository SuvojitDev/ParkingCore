// middleware/error.middleware.js
const notFound = (req, res, _next) => res.status(404).json({ message: `Not Found: ${req.originalUrl}` });

const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || "Server Error" });
};

module.exports = { notFound, errorHandler };
