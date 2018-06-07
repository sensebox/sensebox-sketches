const spawn = require('spawn-promise');
const tempWrite = require('temp-write');
const tempy = require('tempy');
const fs = require('fs');

const boardFQBNs = {
  'sensebox-mcu': 'sensebox:samd:sb:power=on',
  'sensebox': 'arduino:avr:uno'
};

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

const execBuilder = async function execBuilder ({ board, sketch }) {
  const tmpSketchPath = await tempWrite(sketch, 'sketch.ino');

  const buildDir = tempy.directory();

  await spawn(`${arduinoIdePath}/arduino-builder`, [
    ...baseArgs,
    '-fqbn', boardFQBNs[board],
    '-build-path', buildDir,
    tmpSketchPath
  ]);

  return Promise.resolve(fs.createReadStream(`${buildDir}/sketch.ino.${boardBinaryFileextensions[board]}`));
};

module.exports = { execBuilder, validBoards: Object.keys(boardFQBNs) };
