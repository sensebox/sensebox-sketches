const spawn = require('spawn-promise');
const tempWrite = require('temp-write');
const tempy = require('tempy');
const path = require('path');
const { HTTPError, rimraf_promise } = require('./utils');

const boardFQBNs = {
  'sensebox-mcu': 'sensebox:samd:sb:power=on',
  'sensebox': 'arduino:avr:uno'
};

const validBoards = Object.keys(boardFQBNs);

const boardBinaryFileextensions = {
  'sensebox-mcu': 'bin',
  'sensebox': 'hex'
};

const arduinoIdePath = `${__dirname}/arduino-ide`;

const baseArgs = [
  '-compile',
  '-hardware',    `${arduinoIdePath}/hardware`,
  '-hardware',    `${arduinoIdePath}/packages`,
  '-tools',       `${arduinoIdePath}/tools-builder`,
  '-tools',       `${arduinoIdePath}/tools`,
  '-tools',       `${arduinoIdePath}/packages`,
  '-libraries',   `${arduinoIdePath}/libraries`,
  '-build-cache', `${arduinoIdePath}/build-cache`
];

const payloadValidator = function payloadValidator (req, res, next) {
  // reject all non application/json requests
  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('application/json')) {
    return next(new HTTPError({ code: 415, error: 'Invalid Content-Type. Only application/json Content-Type allowed.' }));
  }

  // check if parameters sketch and board are specified and valid
  let { sketch, board } = req.body;

  if (!sketch || !board) {
    return next(new HTTPError({ code: 422, error: 'Parameters \'sketch\' and \'board\' are required' }));
  }

  sketch = sketch.toString().trim();
  board = board.toString().trim();

  if (!sketch || !board) {
    return next(new HTTPError({ code: 422, error: 'Parameters \'sketch\' and \'board\' are required' }));
  }

  if (!validBoards.includes(board)) {
    return next(new HTTPError({ code: 422, error: `Invalid board parameter. Valid values are: ${validBoards.join(',')}` }));
  }

  req._builderParams = { sketch, board };
  next();
};

const execBuilder = async function execBuilder ({ board, sketch, buildDir }) {
  const tmpSketchPath = await tempWrite(sketch, 'sketch.ino');

  await spawn(`${arduinoIdePath}/arduino-builder`, [
    ...baseArgs,
    '-fqbn', boardFQBNs[board],
    '-build-path', buildDir,
    tmpSketchPath
  ]);

  try {
    const dirname = path.dirname(tmpSketchPath);
    await rimraf_promise(`${dirname}`);
  } catch (error) {
    console.log(`Error deleting tmp sketch folder ${tmpSketchPath}: `, error);
  }
};

const compileHandler = async function compileHandler (req, res, next) {
  if (req.method !== 'POST') {
    return next(new HTTPError({ code: 405, error: 'Invalid HTTP method. Only POST requests allowed on /compile.' }));
  }

  const buildDir = tempy.directory();
  req._builderParams = { buildDir, ...req._builderParams };

  // execute builder with parameters from user
  try {
    await execBuilder(req._builderParams);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      code: 201,
      message: 'Sketch successfully compiled and created!',
      data: {
        id: buildDir.split('/')[2]
      }
    }));
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
}

module.exports = { payloadValidator, compileHandler, boardBinaryFileextensions };
