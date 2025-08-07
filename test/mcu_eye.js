import fs from "fs";
import server from "../src/index.js";
import request from "./setup.js";

describe("Compiler - Eye", () => {
  let downloadId_eye = "";

  it("should compile an empty sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync("test/sketches/empty.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox-eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_eye = res.body.data.id;
        done();
      });
  });

  it("should compile a hello world sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync("test/sketches/hello-world.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox-eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_eye = res.body.data.id;
        done();
      });
  });

  it("should compile the tof-distance-display sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync(
      "test/sketches/mcu_s2/tof-distance-display.ino",
      "utf8"
    );
    request(server)
      .post("/compile")
      .send({ board: "sensebox-eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_eye = res.body.data.id;
        done();
      });
  });

  it("should compile the robo-eyes sketch for senseBox Eye", (done) => {
    const sketch = fs.readFileSync(
      "test/sketches/mcu_s2/robo-eyes.ino",
      "utf8"
    );
    request(server)
      .post("/compile")
      .send({ board: "sensebox-eye", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_eye = res.body.data.id;
        done();
      });
  });


  it("should download sketch for senseBox Eye", (done) => {
    request(server)
      .get("/download")
      .query({ board: "sensebox-eye", id: downloadId_eye })
      .end((err, res) => {
        res.should.have.status(200);
        res.header.should.have
          .property("content-disposition")
          .eql("attachment; filename=sketch.bin");
        done();
      });
  });
});
