# A container based compiler for senseBox Blockly sketches

## Compiling senseBox MCU Sketches Examples
```
arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino
```
