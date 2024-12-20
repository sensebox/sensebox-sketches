import { createReadStream } from "fs";
import { boardBinaryFileextensions } from "./builder.js";
import { HTTPError, rimraf_promise } from "./utils.js";

const readFile = async function readFile({ id, board }) {
  return Promise.resolve(
    createReadStream(
      `/tmp/${id}/sketch.ino.${boardBinaryFileextensions[board]}`
    )
  );
};

export const downloadHandler = async function downloadHandler(req, res, next) {
  if (req.method !== "GET") {
    return next(
      new HTTPError({
        code: 405,
        error: "Invalid HTTP method. Only GET requests allowed on /download.",
      })
    );
  }

  const { id, board } = req._url.query;

  if (!id || !board) {
    return next(
      new HTTPError({
        code: 422,
        error: "Parameters 'id' and 'board' are required",
      })
    );
  }

  // execute builder with parameters from user
  try {
    const stream = await readFile(req._url.query);
    const filename = req._url.query.filename || "sketch";
    stream.on("error", function (err) {
      return next(err);
    });
    stream.on("end", async () => {
      try {
        await rimraf_promise(`/tmp/${req._url.query.id}`);
      } catch (error) {
        console.log(
          `Error deleting compile sketch folder with ${req._url.query.id}: `,
          error
        );
      }
    });

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.${
        boardBinaryFileextensions[req._url.query.board]
      }`
    );
    stream.pipe(res);
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
};
