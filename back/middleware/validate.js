/**
 * Lightweight request body validator.
 * Usage: validate(['field1', 'field2'])
 */
export const validate = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter(
    (field) => !req.body[field] && req.body[field] !== 0
  );
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }
  next();
};
