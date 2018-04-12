const spawn = require('spawn-promise');
const tempWrite = require('temp-write');
const tempy = require('tempy');
const fs = require('fs');

const boardFQBNs = {
  'sensebox-mcu': 'sensebox:samd:sb',
  'sensebox': 'arduino:avr:uno'
};

const boardBinaryFileextensions = {
  'sensebox-mcu': 'bin',
  'sensebox': 'hex'
};

//arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino
const execBuilder = async function execBuilder({ board, sketch }) {
  const tmpSketchPath = await tempWrite(sketch, 'sketch.ino');

  const buildDir = tempy.directory();

  const args = [
    '-compile',
    '-hardware', '/arduino-ide/hardware',
    '-hardware', '/root/.arduino15/packages',
    '-tools', '/arduino-ide/tools-builder',
    '-tools', '/arduino-ide/tools',
    '-tools', '/root/.arduino15/packages',
    '-libraries', '/arduino-ide/libraries',
    '-fqbn', boardFQBNs[board],
    '-build-cache', '/arduino-ide/build-cache',
    '-build-path', buildDir,
    tmpSketchPath
  ];

  console.log(`Executing arduino-builder ${args.join(' ')}`);

  await spawn('arduino-builder', args);

  return Promise.resolve(fs.createReadStream(`${buildDir}/sketch.ino.${boardBinaryFileextensions[board]}`));
};


module.exports = { execBuilder, validBoards: Object.keys(boardFQBNs) };
