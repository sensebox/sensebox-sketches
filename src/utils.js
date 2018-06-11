const HTTPError = function HTTPError ({ code = 500, error = '' }) {
  const err = new Error(error);
  err.statusCode = code;

  return err;
};

module.exports = {
  HTTPError
};