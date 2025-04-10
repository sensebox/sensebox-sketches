import { mkdirSync, writeFileSync } from "fs";
import { dirname as _dirname } from "path";
import { rimraf } from "rimraf";
import spawn from "spawn-promise";
import { temporaryDirectory } from "tempy";
import { HTTPError } from "./utils.js";

const boardFQBNs = {
  "sensebox-mcu": "sensebox:samd:sb:power=on",
  sensebox: "arduino:avr:uno",
  "sensebox-esp32s2": "esp32:esp32:sensebox_mcu_esp32s2",
};

const validBoards = Object.keys(boardFQBNs);

export const boardBinaryFileextensions = {
  "sensebox-mcu": "bin",
  sensebox: "hex",
  "sensebox-esp32s2": "bin",
};

const baseArgs = ["--build-path", `/app/src/build-cache`];

export const payloadValidator = function payloadValidator(req, res, next) {
  // reject all non application/json requests
  if (
    !req.headers["content-type"] ||
    !req.headers["content-type"].startsWith("application/json")
  ) {
    return next(
      new HTTPError({
        code: 415,
        error:
          "Invalid Content-Type. Only application/json Content-Type allowed.",
      })
    );
  }

  // check if parameters sketch and board are specified and valid
  let { sketch, board, uf2 } = req.body;

  if (!sketch || !board) {
    return next(
      new HTTPError({
        code: 422,
        error: "Parameters 'sketch' and 'board' are required",
      })
    );
  }

  sketch = sketch.toString().trim();
  board = board.toString().trim();
  uf2 = uf2 ? uf2.toString().trim() : false;

  if (!sketch || !board) {
    return next(
      new HTTPError({
        code: 422,
        error: "Parameters 'sketch' and 'board' are required",
      })
    );
  }

  if (!validBoards.includes(board)) {
    return next(
      new HTTPError({
        code: 422,
        error: `Invalid board parameter. Valid values are: ${validBoards.join(
          ","
        )}`,
      })
    );
  }

  req._builderParams = { sketch, board, uf2 };
  next();
};

const execBuilder = async function execBuilder({
  board,
  sketch,
  buildDir,
  uf2,
}) {
  // const tmpSketchPath = await tempWrite(sketch);
  const sketchDir = `${temporaryDirectory()}/sketch`;
  mkdirSync(sketchDir);

  const tmpSketchPath = `${sketchDir}/sketch.ino`;
  writeFileSync(tmpSketchPath, sketch);

  await spawn(`arduino-cli`, [
    "compile",
    ...baseArgs,
    "--fqbn",
    boardFQBNs[board],
    "--build-path",
    buildDir,
    sketchDir,
  ]);

  const ext = boardBinaryFileextensions[board];
  const binaryFile = `${buildDir}/sketch.ino.${ext}`;

  // Optional: Convert to UF2 if requested
  if (uf2 && ext === "bin") {
    const uf2File = `${buildDir}/sketch.uf2`;
    try {
      await spawn("python3", [
        "/usr/local/bin/uf2conv.py",
        binaryFile,
        "-c",
        "-b",
        "0x00",
        "-f",
        "ESP32S2",
        "--output",
        uf2File,
      ]);
      console.log(`UF2 file created: ${uf2File}`);
    } catch (err) {
      console.warn("UF2 conversion failed:", err.message);
      // You may choose to throw here depending on how critical UF2 output is
    }
  }

  try {
    const dirname = _dirname(tmpSketchPath);
    await rimraf(`${dirname}`);
  } catch (error) {
    console.log(`Error deleting tmp sketch folder ${tmpSketchPath}: `, error);
  }
};

export const compileHandler = async function compileHandler(req, res, next) {
  if (req.method !== "POST") {
    return next(
      new HTTPError({
        code: 405,
        error: "Invalid HTTP method. Only POST requests allowed on /compile.",
      })
    );
  }

  const buildDir = temporaryDirectory();
  req._builderParams = { buildDir, ...req._builderParams };

  // execute builder with parameters from user
  try {
    await execBuilder(req._builderParams);

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        code: 201,
        message: "Sketch successfully compiled and created!",
        data: {
          id: buildDir.split("/")[2],
        },
      })
    );
  } catch (err) {
    if (process.env.NODE_ENV === "test") {
      console.error(err.message);
    }
    return next(new HTTPError({ error: err.message }));
  }
};
