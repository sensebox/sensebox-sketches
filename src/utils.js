import { rimraf } from "rimraf";
import { promisify } from "util";

export const rimraf_promise = promisify(rimraf);

export function HTTPError({ code = 500, error = "" }) {
  const err = new Error(error);
  err.statusCode = code;

  return err;
}
