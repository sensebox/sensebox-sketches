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
  "sensebox-eye": "esp32:esp32:sensebox_eye",
};

const validBoards = Object.keys(boardFQBNs);

export const boardBinaryFileextensions = {
  "sensebox-mcu": "bin",
  sensebox: "hex",
  "sensebox-esp32s2": "bin",
  "sensebox-eye": "bin",
};

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
  let { sketch, board } = req.body;

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

  req._builderParams = { sketch, board };
  next();
};

const execBuilder = async function execBuilder({ board, sketch, buildDir }) {
  // const tmpSketchPath = await tempWrite(sketch);
  const sketchDir = `${temporaryDirectory()}/sketch`;
  mkdirSync(sketchDir);

  const tmpSketchPath = `${sketchDir}/sketch.ino`;
  writeFileSync(tmpSketchPath, sketch);

  await spawn(`arduino-cli`, [
    "compile",
    "--fqbn",
    boardFQBNs[board],
    "--output-dir",
    buildDir,
    sketchDir,
  ]);

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
      console.error(err.message)
    }
    return next(new HTTPError({ error: err.message }));
  }
};
