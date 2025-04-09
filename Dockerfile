FROM node:22-alpine AS base

ENV ARDUINO_CLI_VERSION=1.1.0
ENV SENSEBOXCORE_VERSION=2.0.0
ENV ARDUINO_SAMD_VERSION=1.8.13
ENV ARDUINO_AVR_VERSION=1.8.5
ENV ESP32_VERSION=2.0.17
ENV SENSEBOXCORE_URL=https://raw.githubusercontent.com/mariopesch/senseBoxMCU-core/master/package_sensebox_index.json
ENV ESP32CORE_URL=https://espressif.github.io/arduino-esp32/package_esp32_index.json

RUN apk update
RUN apk add curl
RUN apk add libc6-compat
RUN apk add bash
RUN apk add python3
RUN apk add py3-pyserial

RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh -s ${ARDUINO_CLI_VERSION}

RUN arduino-cli config init

# allow unsafe sources (zip, git)
RUN arduino-cli config set library.enable_unsafe_install true

# update arduino-cli
RUN arduino-cli core update-index

RUN arduino-cli core install arduino:avr

RUN arduino-cli core install arduino:samd@${ARDUINO_SAMD_VERSION}

# install arduino stuff for senseBox V2
RUN curl -o /root/.arduino15/package_sensebox_index.json ${SENSEBOXCORE_URL}
RUN arduino-cli --additional-urls ${SENSEBOXCORE_URL} core install sensebox:samd

# install ESP32
RUN curl -o /root/.arduino15/package_esp32_index.json ${ESP32CORE_URL}
RUN arduino-cli --additional-urls ${ESP32CORE_URL} core install esp32:esp32@${ESP32_VERSION}

# install Libraries with arduino-cli
RUN arduino-cli lib install "Ethernet"
RUN arduino-cli lib install "ArduinoJson"
RUN arduino-cli lib install "Adafruit HDC1000 Library"
RUN arduino-cli lib install "Adafruit BME280 Library"
RUN arduino-cli lib install "Adafruit BMP280 Library"
RUN arduino-cli lib install "Adafruit BME680 Library"
RUN arduino-cli lib install "Adafruit DPS310"
RUN arduino-cli lib install "Adafruit NeoPixel"
RUN arduino-cli lib install "Adafruit SSD1306"
RUN arduino-cli lib install "Adafruit GFX Library"
RUN arduino-cli lib install "Adafruit MQTT Library"
RUN arduino-cli lib install "Adafruit BusIO"
RUN arduino-cli lib install "Adafruit SleepyDog Library"
RUN arduino-cli lib install "Adafruit MPU6050"
RUN arduino-cli lib install "DallasTemperature"
RUN arduino-cli lib install "ArduinoBearSSL"
RUN arduino-cli lib install "ArduinoECCX08"
RUN arduino-cli lib install "SparkFun SCD30 Arduino Library"
RUN arduino-cli lib install "SparkFun u-blox GNSS Arduino Library"
RUN arduino-cli lib install "NewPing"
RUN arduino-cli lib install "IBM LMIC framework"
RUN arduino-cli lib install "LoRa Serialization"
RUN arduino-cli lib install "CayenneLPP"
RUN arduino-cli lib install "OneWire"
RUN arduino-cli lib install "Nova Fitness Sds dust sensors library"
RUN arduino-cli lib install "JC_Button"
RUN arduino-cli lib install "SD"
RUN arduino-cli lib install "BSEC Software Library"
RUN arduino-cli lib install "TheThingsNetwork"
RUN arduino-cli lib install "NTPClient"
RUN arduino-cli lib install "phyphox BLE"
RUN arduino-cli lib install "UniversalTelegramBot"
RUN arduino-cli lib install "Servo"
RUN arduino-cli lib install "RTCZero"
RUN arduino-cli lib install "sensirion-sps@1.1.2"
RUN arduino-cli lib install "TinyGPSPlus"
RUN arduino-cli lib install "SenseBoxBLE"
RUN arduino-cli lib install "Bolder Flight Systems Unit Conversions"
RUN arduino-cli lib install "HX711"
RUN arduino-cli lib install "STM32duino VL53L8CX"
RUN arduino-cli lib install "Adafruit ICM20X"
RUN arduino-cli lib install "NeoGPS"
RUN arduino-cli lib install "Adafruit NeoMatrix"
RUN arduino-cli lib install "Arduino Low Power"
RUN arduino-cli lib install "SolarChargerSB041"
RUN arduino-cli lib install "RG15-Arduino"
RUN arduino-cli lib install "Adafruit seesaw Library"
RUN arduino-cli lib install "ESP32Time"
RUN arduino-cli lib install "Adafruit MAX1704X"
RUN arduino-cli lib install --git-url https://github.com/sensebox/SSD1306-Plot-Library
RUN arduino-cli lib install --git-url https://github.com/sensebox/sensebox-libweb
RUN arduino-cli lib install --git-url https://github.com/sensebox/SDS011-select-serial
RUN arduino-cli lib install --git-url https://github.com/sensebox/RV8523-RTC-Arduino-Library
RUN arduino-cli lib install --git-url https://github.com/sensebox/BMX055-Arduino-Library
RUN arduino-cli lib install --git-url https://github.com/sensebox/LTR329-Lightsensor-Arduino-Library
RUN arduino-cli lib install --git-url https://github.com/sensebox/VEML6070-UV-Arduino-Library
RUN arduino-cli lib install --git-url https://github.com/bolderflight/ams5915
RUN arduino-cli lib install --git-url https://github.com/FluxGarage/RoboEyes
RUN arduino-cli lib install "Adafruit NAU7802 Library"


WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

# test stage
FROM base AS test
ENV NODE_ENV=test
RUN yarn install --pure-lockfile
COPY src /app/src
COPY test /app/test
COPY mocha-reporters.json /app

# copy the OTA files
COPY ./OTAFiles/boards.txt ../root/.arduino15/packages/esp32/hardware/esp32/{ESP32_VERSION} 
COPY ./OTAFiles/APOTA.ino ../root/.arduino15/packages/esp32/hardware/esp32/{ESP32_VERSION}/variants/sensebox_mcu_esp32s2
COPY ./OTAFiles/APOTA.bin ../root/.arduino15/packages/esp32/hardware/esp32/{ESP32_VERSION}/variants/sensebox_mcu_esp32s2
COPY ./OTAFiles/variant.cpp ../root/.arduino15/packages/esp32/hardware/esp32/{ESP32_VERSION}/variants/sensebox_mcu_esp32s2


CMD ["yarn","test"]

# production stage
FROM base AS production
ENV NODE_ENV=production
RUN yarn install --pure-lockfile --production
COPY src /app/src
COPY splash.h ../root/Arduino/libraries/Adafruit_SSD1306/splash.h

# COPY platform.txt /app/src/arduino-ide/packages/arduino/hardware/samd/1.8.11

CMD ["yarn","start"]
