FROM node:22-slim AS base

ENV ARDUINO_CLI_VERSION=1.3.0
ENV SENSEBOXCORE_VERSION=2.0.0
ENV ARDUINO_SAMD_VERSION=1.8.13
ENV ARDUINO_AVR_VERSION=1.8.5
ENV ESP32_VERSION=3.3.5
ENV SENSEBOXCORE_URL=https://raw.githubusercontent.com/mariopesch/senseBoxMCU-core/master/package_sensebox_index.json
ENV ESP32CORE_URL=https://espressif.github.io/arduino-esp32/package_esp32_index.json

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

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

COPY ./OTAFiles/ /tmp/OTAFiles/

# Use these lines to use environment variable in docker
RUN cp /tmp/OTAFiles/boards.txt /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/
# esp32s2 variant
RUN cp /tmp/OTAFiles/esp32s2/APOTA.ino /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_mcu_esp32s2/ && \
    cp /tmp/OTAFiles/esp32s2/APOTA.bin /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_mcu_esp32s2/ && \
    cp /tmp/OTAFiles/esp32s2/variant.cpp /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_mcu_esp32s2/
# eye variant
RUN mkdir -p /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye
RUN cp /tmp/OTAFiles/eye/APOTA.ino /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/ && \
    cp /tmp/OTAFiles/eye/APOTA.bin /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/ && \
    cp /tmp/OTAFiles/eye/variant.cpp /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/ && \
    cp /tmp/OTAFiles/eye/partitions-16MB-tinyuf2.csv /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/ && \
    cp /tmp/OTAFiles/eye/pins_arduino.h /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/ && \
    cp /tmp/OTAFiles/eye/tinyuf2.bin /root/.arduino15/packages/esp32/hardware/esp32/${ESP32_VERSION}/variants/sensebox_eye/
RUN rm -rf /tmp/OTAFiles

# install Libraries with arduino-cli
RUN arduino-cli lib install "Ethernet" && \
    arduino-cli lib install "ArduinoJson" && \
    arduino-cli lib install "Adafruit HDC1000 Library" && \
    arduino-cli lib install "Adafruit BME280 Library" && \
    arduino-cli lib install "Adafruit BMP280 Library" && \
    arduino-cli lib install "Adafruit BME680 Library" && \
    arduino-cli lib install "Adafruit DPS310" && \
    arduino-cli lib install "Adafruit NeoPixel" && \
    arduino-cli lib install "Adafruit SSD1306" && \
    arduino-cli lib install "Adafruit GFX Library" && \
    arduino-cli lib install "Adafruit MQTT Library" && \
    arduino-cli lib install "Adafruit BusIO" && \
    arduino-cli lib install "Adafruit SleepyDog Library" && \
    arduino-cli lib install "Adafruit MPU6050" && \
    arduino-cli lib install "DallasTemperature" && \
    arduino-cli lib install "ArduinoBearSSL" && \
    arduino-cli lib install "ArduinoECCX08" && \
    arduino-cli lib install "SparkFun SCD30 Arduino Library" && \
    arduino-cli lib install "SparkFun u-blox GNSS Arduino Library" && \
    arduino-cli lib install "NewPing" && \
    arduino-cli lib install "IBM LMIC framework" && \
    arduino-cli lib install "LoRa Serialization" && \
    arduino-cli lib install "CayenneLPP" && \
    arduino-cli lib install "OneWire" && \
    arduino-cli lib install "Nova Fitness Sds dust sensors library" && \
    arduino-cli lib install "JC_Button" && \
    arduino-cli lib install "SD" && \
    arduino-cli lib install "BSEC Software Library" && \
    arduino-cli lib install "TheThingsNetwork" && \
    arduino-cli lib install "NTPClient" && \
    arduino-cli lib install "phyphox BLE" && \
    arduino-cli lib install "UniversalTelegramBot" && \
    arduino-cli lib install "Servo" && \
    arduino-cli lib install "RTCZero" && \
    arduino-cli lib install --git-url https://github.com/Sensirion/arduino-avr-legacy-i2c-sps30.git#v1.1.2 && \
    arduino-cli lib install "TinyGPSPlus" && \
    arduino-cli lib install "SenseBoxBLE" && \
    arduino-cli lib install "Bolder Flight Systems Unit Conversions" && \
    arduino-cli lib install "HX711" && \
    arduino-cli lib install "STM32duino VL53L8CX" && \
    arduino-cli lib install "Adafruit ICM20X" && \
    arduino-cli lib install "NeoGPS" && \
    arduino-cli lib install "Adafruit NeoMatrix" && \
    arduino-cli lib install "Arduino Low Power" && \
    arduino-cli lib install "SolarChargerSB041" && \
    arduino-cli lib install "RG15-Arduino" && \
    arduino-cli lib install "Adafruit seesaw Library" && \
    arduino-cli lib install "ESP32Time" && \
    arduino-cli lib install "Adafruit MAX1704X" && \
    arduino-cli lib install "ICM42670P" && \
    arduino-cli lib install --git-url https://github.com/sensebox/SSD1306-Plot-Library && \
    arduino-cli lib install --git-url https://github.com/sensebox/sensebox-libweb && \
    arduino-cli lib install --git-url https://github.com/sensebox/SDS011-select-serial && \
    arduino-cli lib install --git-url https://github.com/sensebox/RV8523-RTC-Arduino-Library && \
    arduino-cli lib install --git-url https://github.com/sensebox/BMX055-Arduino-Library && \
    arduino-cli lib install --git-url https://github.com/sensebox/LTR329-Lightsensor-Arduino-Library && \
    arduino-cli lib install --git-url https://github.com/sensebox/VEML6070-UV-Arduino-Library && \
    arduino-cli lib install --git-url https://github.com/bolderflight/ams5915 && \
    arduino-cli lib install --git-url https://github.com/FluxGarage/RoboEyes#v1.1.0 && \
    arduino-cli lib install "Adafruit NAU7802 Library" && \
    arduino-cli lib install --git-url https://github.com/boschsensortec/Bosch-BSEC2-Library && \
    arduino-cli lib install "BME68x Sensor library" && \
    arduino-cli lib install "Sensirion I2C SEN66" && \
    arduino-cli lib install --git-url https://github.com/sensebox/tflite-micro-arduino-examples


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



CMD ["yarn","test"]

# production stage
FROM base AS production
ENV NODE_ENV=production
RUN yarn install --pure-lockfile --production
COPY src /app/src
COPY splash.h ../root/Arduino/libraries/Adafruit_SSD1306/splash.h

# COPY platform.txt /app/src/arduino-ide/packages/arduino/hardware/samd/1.8.11

CMD ["yarn","start"]
