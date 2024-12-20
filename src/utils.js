const util = require("util");
const rimraf = require("rimraf");
const rimraf_promise = util.promisify(rimraf);

const HTTPError = function HTTPError({ code = 500, error = "" }) {
  const err = new Error(error);
  err.statusCode = code;

  return err;
};

module.exports = {
  HTTPError,
  rimraf_promise,
};
