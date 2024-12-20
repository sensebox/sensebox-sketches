const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/index");
const should = chai.should();
const fs = require("fs");

chai.use(chaiHttp);

describe("Compiler - MCU", () => {
  let downloadId_mcu = "";

  it("should compile an empty sketch for senseBox MCU", (done) => {
    const sketch = fs.readFileSync("test/sketches/empty.ino", "utf8");

    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-mcu", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_mcu = res.body.data.id;
        done();
      });
  });

  it("should compile a hello world sketch for senseBox MCU", (done) => {
    const sketch = fs.readFileSync("test/sketches/hello-world.ino", "utf8");

    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-mcu", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_mcu = res.body.data.id;
        done();
      });
  });

  it("should compile a senseBox:home sketch (from openSenseMap) for senseBox MCU", (done) => {
    const sketch = fs.readFileSync("test/sketches/mcu/full-home.ino", "utf8");

    chai
      .request(server)
      .post("/compile")
      .send({ board: "sensebox-mcu", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.have.property("id");
        downloadId_mcu = res.body.data.id;
        done();
      });
  });

  it("should download sketch for senseBox MCU", (done) => {
    chai
      .request(server)
      .get("/download")
      .query({ board: "sensebox-mcu", id: downloadId_mcu })
      .end((err, res) => {
        res.should.have.status(200);
        res.header.should.have
          .property("content-disposition")
          .eql("attachment; filename=sketch.bin");
        done();
      });
  });
});
