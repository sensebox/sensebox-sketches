FROM node:17

ENV ARDUINO_CLI_VERSION=0.35.3 \
  SENSEBOXCORE_VERSION=2.0.0 \
  ARDUINO_SAMD_VERSION=1.8.13 \
  ARDUINO_AVR_VERSION=1.8.5 \
  ESP32_VERSION=2.0.17 \
  SENSEBOXCORE_URL=https://raw.githubusercontent.com/mariopesch/senseBoxMCU-core/master/package_sensebox_index.json \
  ESP32CORE_URL=https://espressif.github.io/arduino-esp32/package_esp32_index.json \
  SSD1306_PLOT_LIBRARY_URL=https://github.com/sensebox/SSD1306-Plot-Library/archive/refs/tags/v1.1.0.zip \
  SENSEBOX_LIBWEB_URL=https://github.com/sensebox/sensebox-libweb/archive/refs/heads/master.zip \
  SDS011_LIBRARY_URL=https://github.com/sensebox/SDS011-select-serial/archive/refs/heads/master.zip \
  RTC_LIBRARY_URL=https://github.com/sensebox/RV8523-RTC-Arduino-Library/archive/refs/heads/main.zip \
  BMX055_LIBRARY_URL=https://github.com/sensebox/BMX055-Arduino-Library/archive/refs/heads/main.zip \
  LTR329_LIBRARY_URL=https://github.com/sensebox/LTR329-Lightsensor-Arduino-Library/archive/refs/heads/main.zip \
  SDS011S_LIBRARY_URL=https://github.com/sensebox/SDS011-select-serial/archive/refs/heads/master.zip \
  VEML6070_LIBRARY_URL=https://github.com/sensebox/VEML6070-UV-Arduino-Library/archive/refs/heads/main.zip \
  AMS5915_LIBRARY_URL=https://github.com/bolderflight/ams5915/archive/refs/heads/main.zip

RUN apt-get update && apt-get install -y xz-utils unzip wget

RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh -s ${ARDUINO_CLI_VERSION}

RUN arduino-cli config init

# aloow unsafe sources (zip, git)
RUN arduino-cli config set library.enable_unsafe_install true

# update arduino-cli
RUN arduino-cli core update-index

RUN arduino-cli core install arduino:avr

RUN arduino-cli core install arduino:samd@${ARDUINO_SAMD_VERSION}

# install arduino stuff for senseBox V2
RUN curl -o /root/.arduino15/package_sensebox_index.json ${SENSEBOXCORE_URL}
RUN arduino-cli --additional-urls ${SENSEBOXCORE_URL} core install sensebox:samd

# install ESP32
RUN apt-get install -y python3-pip
RUN pip install pyserial
RUN curl -o /root/.arduino15/package_esp32_index.json ${ESP32CORE_URL}
RUN arduino-cli --additional-urls ${ESP32CORE_URL} core install esp32:esp32@${ESP32_VERSION}


RUN  wget -O ssd1306_plot_library.zip $SSD1306_PLOT_LIBRARY_URL \
  && arduino-cli lib install --zip-path ssd1306_plot_library.zip \
  && wget -O sensebox_libweb.zip $SENSEBOX_LIBWEB_URL \
  && arduino-cli lib install --zip-path sensebox_libweb.zip \
  && wget -O sds011-select-serial.zip $SDS011_LIBRARY_URL \
  && arduino-cli lib install --zip-path sds011-select-serial.zip \
  && wget -O rtc_library.zip $RTC_LIBRARY_URL \
  && arduino-cli lib install --zip-path rtc_library.zip \
  && wget -O bmx055_library.zip $BMX055_LIBRARY_URL \
  && arduino-cli lib install --zip-path bmx055_library.zip  \
  && wget -O ltr329_library.zip $LTR329_LIBRARY_URL \
  && arduino-cli lib install --zip-path ltr329_library.zip  \
  && wget -O sds011_select_library.zip $SDS011S_LIBRARY_URL \
  && arduino-cli lib install --zip-path sds011_select_library.zip \
  && wget -O veml6070_library.zip $VEML6070_LIBRARY_URL \
  && arduino-cli lib install --zip-path veml6070_library.zip  \
  && wget -O ams5915_library.zip $AMS5915_LIBRARY_URL \
  && arduino-cli lib install --zip-path ams5915_library.zip

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
RUN arduino-cli lib install "sensirion-sps"
RUN arduino-cli lib install "TinyGPSPlus"
RUN arduino-cli lib install "SenseBoxBLE"
RUN arduino-cli lib install "Bolder Flight Systems Unit Conversions"
RUN arduino-cli lib install "HX711"
RUN arduino-cli lib install "STM32duino VL53L8CX"
RUN arduino-cli lib install "Adafruit ICM20X"
RUN arduino-cli lib install "NeoGPS"
RUN arduino-cli lib install "Adafruit NeoMatrix"
RUN arduino-cli lib install "Arduino Low Power"
RUN arduino-cli lib install "Adafruit seesaw Library"


WORKDIR /app

ENV NODE_ENV=production

COPY package.json /app
COPY yarn.lock /app

RUN yarn install --pure-lockfile --production

COPY src /app/src

# COPY platform.txt /app/src/arduino-ide/packages/arduino/hardware/samd/1.8.11

CMD ["yarn","start"]
