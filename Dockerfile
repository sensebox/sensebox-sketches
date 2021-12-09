FROM node:16

ENV ARDUINO_CLI_VERSION=0.20.2 \
  SENSEBOXCORE_VERSION=1.5.0-beta \
  ARDUINO_SAMD_VERSION=1.8.11 \
  ARDUINO_AVR_VERSION=1.8.3 \
  SENSEBOXCORE_URL=https://raw.githubusercontent.com/sensebox/senseBoxMCU-core/master/package_sensebox_index.json \
  SENSEBOX_LIBRARY_URL=https://github.com/sensebox/senseBox_library/archive/master.zip \
  TELEGRAM_LIBRARY_URL=https://github.com/witnessmenow/Universal-Arduino-Telegram-Bot/archive/v1.1.0.zip \
  ARDUINO_JSON_LIBRARY_URL=https://github.com/bblanchon/ArduinoJson/releases/download/v5.13.5/ArduinoJson-v5.13.5.zip \
  TTN_ARDUINO_LIBRARY_URL=https://github.com/TheThingsNetwork/arduino-device-lib/archive/v2.5.15.zip \
  BSEC_LIBRARY_URL=https://github.com/BoschSensortec/BSEC-Arduino-library/archive/v1.5.1474.zip \
  GPS_LIBRARY_URL=https://github.com/sparkfun/SparkFun_u-blox_GNSS_Arduino_Library/archive/v2.0.3.zip\
  MQTT_LIBRARY_URL=https://github.com/adafruit/Adafruit_MQTT_Library/archive/2.1.0.zip \
  NEWPING_LIBRARY_URL=https://bitbucket.org/teckel12/arduino-new-ping/downloads/NewPing_v1.9.1.zip \
  PHYPHOX_LIBRARY_URL=https://github.com/sensebox/phyphox-arduino/archive/refs/heads/master.zip

RUN apt-get update && apt-get install -y xz-utils unzip wget

RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh -s ${ARDUINO_CLI_VERSION}

RUN arduino-cli config init

# aloow unsafe sources (zip, git)
RUN arduino-cli config set library.enable_unsafe_install true

# update arduino-cli
RUN arduino-cli core update-index

RUN arduino-cli core install arduino:avr

RUN arduino-cli core install arduino:samd@${ARDUINO_SAMD_VERSION}


RUN  wget -O senseBox_Library.zip $SENSEBOX_LIBRARY_URL \
  && arduino-cli lib install --zip-path senseBox_Library.zip \
  && wget -O telegram_Library.zip $TELEGRAM_LIBRARY_URL \
  && arduino-cli lib install --zip-path telegram_Library.zip \
  && wget -O arduino_json_Library.zip $ARDUINO_JSON_LIBRARY_URL \
  && arduino-cli lib install --zip-path arduino_json_Library.zip \
  && wget -O ttn_arduino_Library.zip $TTN_ARDUINO_LIBRARY_URL \
  && arduino-cli lib install --zip-path ttn_arduino_Library.zip \
  && wget -O bsec_Library.zip $BSEC_LIBRARY_URL \
  && arduino-cli lib install --zip-path bsec_Library.zip \
  && wget -O gps_Library.zip $GPS_LIBRARY_URL \
  && arduino-cli lib install --zip-path gps_Library.zip \
  && wget -O mqtt_Library.zip $MQTT_LIBRARY_URL \
  && arduino-cli lib install --zip-path mqtt_Library.zip \
  && wget -O newping_Library.zip $NEWPING_LIBRARY_URL \
  && arduino-cli lib install --zip-path newping_Library.zip \
  && wget -O phyphox_Library.zip $PHYPHOX_LIBRARY_URL \
  && arduino-cli lib install --zip-path phyphox_Library.zip

# install arduino avr and libraries for senseBox V1
RUN arduino-cli lib install Ethernet
RUN arduino-cli lib install Ethernet2
RUN arduino-cli lib install Wifi101

RUN wget https://raw.githubusercontent.com/sensebox/home/master/libraries/BMP280.zip
RUN wget https://raw.githubusercontent.com/sensebox/home/master/libraries/HDC100X.zip
RUN wget https://raw.githubusercontent.com/sensebox/home/master/libraries/Makerblog_TSL45315.zip
RUN wget https://raw.githubusercontent.com/sensebox/home/master/libraries/VEML6070.zip
RUN wget https://raw.githubusercontent.com/sensebox/home/master/libraries/LTR329.zip

RUN arduino-cli lib install --zip-path BMP280.zip
RUN arduino-cli lib install --zip-path HDC100X.zip
RUN arduino-cli lib install --zip-path Makerblog_TSL45315.zip
RUN arduino-cli lib install --zip-path VEML6070.zip
RUN arduino-cli lib install --zip-path LTR329.zip
RUN arduino-cli lib install --git-url https://github.com/sensebox/SDS011-select-serial 

# install arduino stuff for senseBox V2
RUN curl -o /root/.arduino15/package_sensebox_index.json https://raw.githubusercontent.com/sensebox/senseBoxMCU-core/master/package_sensebox_index.json
RUN arduino-cli --additional-urls https://raw.githubusercontent.com/sensebox/senseBoxMCU-core/master/package_sensebox_index.json core install sensebox:samd

WORKDIR /app

ENV NODE_ENV=production

COPY package.json /app
COPY yarn.lock /app

RUN yarn install --pure-lockfile --production

COPY src /app/src
# COPY --from=builder /arduino-ide /app/src/arduino-ide

# COPY platform.txt /app/src/arduino-ide/packages/arduino/hardware/samd/1.8.11

CMD ["yarn","start"]
