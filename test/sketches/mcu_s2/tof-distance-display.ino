// Code generated by senseBox Blockly on Wed Nov 13 2024 14:34:47 GMT+0100 (Central European Standard Time)

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h> // http://librarymanager/All#Adafruit_GFX_Library
#include <Adafruit_SSD1306.h> // http://librarymanager/All#Adafruit_SSD1306
#include <vl53l8cx.h>

VL53L8CX sensor_vl53l8cx(&Wire, -1, -1);

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

float oldVl53l8cxMin = -1.0;
float getVl53l8cxMin() {
  VL53L8CX_ResultsData Results;
  uint8_t NewDataReady = 0;
  uint8_t status;

  status = sensor_vl53l8cx.check_data_ready(&NewDataReady);

  if ((!status) && (NewDataReady != 0)) {
    sensor_vl53l8cx.get_ranging_data(&Results);
    float min = 10000.0;
    for(int i = 0; i < VL53L8CX_RESOLUTION_8X8*VL53L8CX_NB_TARGET_PER_ZONE; i++) {
      if((&Results)->target_status[i]!=255){
        float distance = ((&Results)->distance_mm[i])/10;
        if(min > distance) {
          min = distance;
        }
      }
    }
    oldVl53l8cxMin = (min==10000.0) ? 0.0 : min;
  }
  return oldVl53l8cxMin;
}

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3D);
  display.display();
  delay(100);
  display.clearDisplay();

  Wire.begin();
  Wire.setClock(1000000); //Sensor has max I2C freq of 1MHz
  sensor_vl53l8cx.begin();
  sensor_vl53l8cx.init();
  sensor_vl53l8cx.set_ranging_frequency_hz(30);
  sensor_vl53l8cx.set_resolution(VL53L8CX_RESOLUTION_8X8);
  sensor_vl53l8cx.start_ranging();

}

void loop() {
  display.clearDisplay();
  display.setCursor(0,0);
  display.setTextSize(1);
  display.setTextColor(WHITE,BLACK);
  display.println(getVl53l8cxMin());
  display.display();

}