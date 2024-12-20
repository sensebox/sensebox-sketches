import fs from "fs";
import server from "../src/index.js";
import request from "./setup.js";

describe("Compiler - UNO", () => {
  let downloadId_uno = "";

  it("should compile an empty sketch for old senseBox", (done) => {
    const sketch = fs.readFileSync("test/sketches/empty.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("Sketch successfully compiled and created!");
        res.body.should.have.property("data");
        res.body.data.should.be.a("object");
        res.body.data.should.have.property("id");
        downloadId_uno = res.body.data.id;
        done();
      });
  });

  it("should compile a hello world sketch for old senseBox", (done) => {
    const sketch = fs.readFileSync("test/sketches/hello-world.ino", "utf8");

    request(server)
      .post("/compile")
      .send({ board: "sensebox", sketch })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("Sketch successfully compiled and created!");
        res.body.should.have.property("data");
        res.body.data.should.be.a("object");
        res.body.data.should.have.property("id");
        downloadId_uno = res.body.data.id;
        done();
      });
  });

  it("should download sketch for old senseBox", (done) => {
    request(server)
      .get("/download")
      .query({ board: "sensebox", id: downloadId_uno })
      .end((err, res) => {
        res.should.have.status(200);
        res.header.should.have
          .property("content-disposition")
          .eql("attachment; filename=sketch.hex");
        done();
      });
  });
});
