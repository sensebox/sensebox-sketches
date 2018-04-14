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

You can also run the container image mutliple times. See [Scaling with docker-compose](#scaling-with-docker-compose)

### `POST /compile`

Requests should always:

- take the `/compile` route
- be POST requests
- have `application/json` as `content-type`
- contain a valid JSON string with keys `board` and `sketch` with non-empty values.

Possible `board` values are `sensebox-mcu` for the new senseBox MCU and `sensebox` for the old Arduino Uno based senseBox.

The `sketch` value should be a valid Arduino sketch.

Responses have a `content-type: application/octet-stream` header and contain the compiled sketch in the response body.

## Scaling with docker-compose

Newer versions of docker allows to give the same alias to multiple containers in the same network. We exploit this to run multiple instances at the same time to balance load.

The repository contains a `docker-compose.yml` file which automatically assigns the `compiler` alias to all running containers.

Just start multiple instances using

    docker-compose up -d --scale compiler=4

Then reference the containers by its `compiler` alias and multiple requests will be served by different containers.

## In the container

### Compiling senseBox MCU Sketches Examples

    arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino

### Compiling for Arduino Uno

    arduino-builder -hardware /arduino-ide/hardware -hardware /root/.arduino15/packages -tools /arduino-ide/tools-builder -tools /root/.arduino15/packages -libraries /arduino-ide/libraries -fqbn=sensebox:samd:sb -build-cache /arduino-ide/build-cache -build-path /arduino-ide/builds /root/.arduino15/packages/sensebox/hardware/samd/1.0.4/libraries/senseBox/examples/Blink/Blink.ino
