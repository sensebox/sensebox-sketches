import fs from "fs";
import server from "../src/index.js";
import request from "./setup.js";

describe("Compiler - MCU S2 (ESP32S2)", () => {
  let downloadId_esp32s2 = "";

  it("should compile an empty sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync("test/sketches/empty.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox_eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });

  it("should compile a hello world sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync("test/sketches/hello-world.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox_eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });

  it("should compile the camera-display sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync(
      "test/sketches/eye/camera-display.ino",
      "utf8"
    );
    request(server)
      .post("/compile")
      .send({ board: "sensebox_eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_esp32s2 = res.body.data.id;
        done();
      });
  });


  it("should download sketch for senseBox Eye", (done) => {
    request(server)
      .get("/download")
      .query({ board: "sensebox_eye", id: downloadId_esp32s2 })
      .end((err, res) => {
        res.should.have.status(200);
        res.header.should.have
          .property("content-disposition")
          .eql("attachment; filename=sketch.bin");
        done();
      });
  });
});
