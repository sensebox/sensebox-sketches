# A container based compiler for senseBox Blockly sketches

![Build Status](https://github.com/sensebox/sensebox-sketches/actions/workflows/registry-build-publish.yaml/badge.svg)

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

And download the sketch using `curl`:

    curl \
      --request GET \
      -O \
      -J \
      'http://localhost:3000/download?id={GENERATED_ID}&board={sensebox|sensebox-mcu}'

You can also run the container image mutliple times. See [Scaling with docker-compose](#scaling-with-docker-compose)

### Endpoints

#### `POST /compile`

- have `application/json` as `content-type`
- contain a valid JSON string with keys `board` and `sketch` with non-empty values.

Possible `board` values are `sensebox-mcu` for the new senseBox MCU, `sensebox` for the old Arduino Uno based senseBox and `sensebox-esp32s2` for the esp32s2 based MCU.

The `sketch` value should be a valid Arduino sketch.

Responses have a `content-type: application/json` header and contains the following response body:

```json
{
  "code": 201,
  "message": "Sketch successfully compiled and created!",
  "data": {
    "id": "77c1df527a874bd909b56bf1e3906604"
  }
}
```

The `id` is the identifier for your compiled sketch and must be used in the `GET /download/:id` route.

#### `GET /download`

Downloads a compiled sketch.

Parameters:

- `id` is the returned `id` from `/compile`
- `board` specifies which compiled file should be downloaded. Possible values `sensebox-mcu` or `sensebox`
- `filename` name for the sketch. Default value is `sketch`

```
https://compiler.sensebox.de/download?id={ID}&board={board}&filename={filename}
```

Responses have a `content-type: application/octet-stream` header and contain the compiled sketch in the response body.

It also have a `Content-Disposition: attachment; filename:{filename}.bin|hex` header to force download.

#### `GET /libraries`

Shows a list of all installed Arduino libraries.

```
https://compiler.sensebox.de/libraries
```

Parameters:

- `format` specifies the output format. Possible value: `json`

```
https://compiler.sensebox.de/libraries?format=json
```

Will return a list of all installed libraries in JSON format.

## Scaling with docker-compose

Newer versions of docker allows to give the same alias to multiple containers in the same network. We exploit this to run multiple instances at the same time to balance load.

The repository contains a `docker-compose.yml` file which automatically assigns the `compiler` alias to all running containers.

Just start multiple instances using

    docker-compose up -d --scale compiler=4

Then reference the containers by its `compiler` alias and multiple requests will be served by different containers.
