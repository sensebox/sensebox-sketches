# A container based compiler for senseBox Blockly sketches

## Usage

Build the container image

    docker build -t sensebox/sensebox-sketches .

Then create a container

    docker run --rm -it -p 3000:3000 sensebox/sensebox-sketches

You can now compile sketches through the exposed HTTP interface. Here is an example using `curl`

    curl \
      --request POST \
      --header "Content-type: application/json" \
      --data '{"board":"sensebox-mcu", "sketch":"void setup() {\nSerial.begin(9600);\nSerial.println(\"Hello World\");\n}\nvoid loop() {}"}' \
      http://localhost:3000/compile

## In the container

### Compiling senseBox MCU Sketches Examples

    arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino

### Compiling for Arduino Uno

    arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino
