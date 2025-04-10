import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { rimraf } from "rimraf";
import { boardBinaryFileextensions } from "./builder.js";
import { HTTPError } from "./utils.js";

const readFile = async function readFile({ id, board, format }) {
  const ext = format === "uf2" ? "uf2" : boardBinaryFileextensions[board];
  const filePath = join(
    "/tmp",
    id,
    `sketch.${format !== "uf2" ? "ino." : ""}${ext}`
  );
  console.log(`Reading file: ${filePath}`);

  if (!existsSync(filePath)) {
    throw new HTTPError({
      code: 404,
      error: `Compiled file not found: sketch.${ext}`,
    });
  }

  return Promise.resolve(createReadStream(filePath));
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

  const { id, board, format } = req._url.query;

  if (!id || !board) {
    return next(
      new HTTPError({
        code: 422,
        error: "Parameters 'id' and 'board' are required",
      })
    );
  }

  try {
    const ext = format === "uf2" ? "uf2" : boardBinaryFileextensions[board];
    const stream = await readFile({ id, board, format });
    const filename = req._url.query.filename || "sketch";
    console.log(`Downloading ${filename}.${ext} for board ${board}`);
    stream.on("error", function (err) {
      return next(err);
    });

    stream.on("end", async () => {
      try {
        await rimraf(`/tmp/${id}`);
      } catch (error) {
        console.log(`Error deleting compile sketch folder with ${id}: `, error);
      }
    });

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.${ext}`
    );
    stream.pipe(res);
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
};
