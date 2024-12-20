const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/index");
const fs = require("fs");
const should = chai.should();

chai.use(chaiHttp);

describe("Compiler - MCU S2 (ESP32S2)", () => {
  let downloadId_esp32s2 = "";

  it("should compile an empty sketch for senseBox MCU-S2 ESP32S2", (done) => {
    const sketch = fs.readFileSync("test/sketches/empty.ino", "utf8");

    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-esp32s2", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });

  it("should compile a hello world sketch for senseBox MCU-S2 ESP32S2", (done) => {
    const sketch = fs.readFileSync("test/sketches/hello-world.ino", "utf8");

    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-esp32s2", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });

  it("should compile the tof-distance-display sketch for senseBox MCU-S2 ESP32S2", (done) => {
    const sketch = fs.readFileSync("test/sketches/mcu_s2/tof-distance-display.ino", "utf8");
    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-esp32s2", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });

  it("should download sketch for senseBox MCU-S2 ESP32S2", (done) => {
    chai
      .request(server)
      .get("/download")
      .query({ board: "sensebox-esp32s2", id: downloadId_esp32s2 })
      .end((err, res) => {
        res.should.have.status(200);
        res.header.should.have.property("content-disposition").eql("attachment; filename=sketch.bin");
        done();
      });
  });
});
