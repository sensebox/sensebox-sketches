process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/index");
const should = chai.should();
const fs = require('fs');

chai.use(chaiHttp);

const params = {
  board: "sensebox-mcu",
  sketch:
    'void setup() {\nSerial.begin(9600);\nSerial.println("Hello World");\n}\nvoid loop() {}',
};

let downloadId_mcu = "";
let downloadId_uno = "";
let downloadId_esp32s2 = "";

describe("Compiler", () => {
  describe("/GET index", () => {
    it("it should get the index page and answer with a 404 ", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("/compile", () => {
    it("should compile a sketch for senseBox MCU", (done) => {
      chai
        .request(server)
        .post("/compile")
        .send(params)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Sketch successfully compiled and created!");
          res.body.should.have.property("data");
          res.body.data.should.be.a("object");
          res.body.data.should.have.property("id");
          downloadId_mcu = res.body.data.id;
          done();
        });
    });

    it("should compile a sketch for old senseBox", (done) => {
      const { sketch } = params;
      chai
        .request(server)
        .post("/compile")
        .send({
          board: "sensebox",
          sketch,
        })
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

    it("should compile a sketch for senseBox MCU-S2 ESP32S2", (done) => {
      const { sketch } = params;
      chai
        .request(server)
        .post("/compile")
        .send({
          board: "sensebox-esp32s2",
          sketch,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Sketch successfully compiled and created!");
          res.body.should.have.property("data");
          res.body.data.should.be.a("object");
          res.body.data.should.have.property("id");
          downloadId_esp32s2 = res.body.data.id;
          done();
        });
    });

    it("should compile  the tof-distance-display sketch for senseBox MCU-S2 ESP32S2", (done) => {
      const tof_distance_display_sketch = fs.readFileSync('test/sketches/tof-distance-display.ino', 'utf8');

      chai
        .request(server)
        .post("/compile")
        .send({
          board: "sensebox-esp32s2",
          sketch: tof_distance_display_sketch,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Sketch successfully compiled and created!");
          res.body.should.have.property("data");
          res.body.data.should.be.a("object");
          res.body.data.should.have.property("id");
          downloadId_esp32s2 = res.body.data.id;
          done();
        });
    });

    it("should reject request without board parameter", (done) => {
      const { sketch } = params;
      chai
        .request(server)
        .post("/compile")
        .send({ sketch })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Parameters 'sketch' and 'board' are required");
          done();
        });
    });

    it("should reject request without sketch parameter", (done) => {
      const { board } = params;
      chai
        .request(server)
        .post("/compile")
        .send({ board })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Parameters 'sketch' and 'board' are required");
          done();
        });
    });

    it("should reject request with invalid board", (done) => {
      const { sketch } = params;
      chai
        .request(server)
        .post("/compile")
        .send({
          board: "esp8266",
          sketch,
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql(
              "Invalid board parameter. Valid values are: sensebox-mcu,sensebox,sensebox-esp32s2"
            );
          done();
        });
    });

    it("should reject request with wrong Content-Type", (done) => {
      chai
        .request(server)
        .post("/compile")
        .set("Content-Type", "text/plain")
        .send("")
        .end((err, res) => {
          res.should.have.status(415);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql(
              "Invalid Content-Type. Only application/json Content-Type allowed."
            );
          done();
        });
    });

    it("should only accept POST request", (done) => {
      chai
        .request(server)
        .get("/compile")
        .send(params)
        .end((err, res) => {
          res.should.have.status(405);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql(
              "Invalid HTTP method. Only POST requests allowed on /compile."
            );
          done();
        });
    });
  });

  describe("/download", () => {
    it("should only accept /GET requests", (done) => {
      chai
        .request(server)
        .post("/download")
        .send({})
        .end((err, res) => {
          res.should.have.status(405);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql(
              "Invalid HTTP method. Only GET requests allowed on /download."
            );
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
          res.header.should.be.a("object");
          res.header.should.have
            .property("content-disposition")
            .eql("attachment; filename=sketch.bin");
          done();
        });
    });

    it("should download sketch for old senseBox", (done) => {
      chai
        .request(server)
        .get("/download")
        .query({ board: "sensebox", id: downloadId_uno })
        .end((err, res) => {
          res.should.have.status(200);
          res.header.should.be.a("object");
          res.header.should.have
            .property("content-disposition")
            .eql("attachment; filename=sketch.hex");
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
          res.header.should.be.a("object");
          res.header.should.have
            .property("content-disposition")
            .eql("attachment; filename=sketch.bin");
          done();
        });
    });

    it("should reject request without id parameter", (done) => {
      chai
        .request(server)
        .get("/download")
        .send({
          board: "sensebox-mcu",
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Parameters 'id' and 'board' are required");
          done();
        });
    });

    it("should reject request without board parameter", (done) => {
      chai
        .request(server)
        .get("/download")
        .send({
          id: downloadId_mcu,
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Parameters 'id' and 'board' are required");
          done();
        });
    });

    it("should set a custom filename", (done) => {
      chai
        .request(server)
        .post("/compile")
        .send(params)
        .then((res) => {
          return res.body.data.id;
        })
        .then((downloadId) => {
          chai
            .request(server)
            .get("/download")
            .query({
              board: "sensebox-mcu",
              id: downloadId,
              filename: "custom",
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.header.should.be.a("object");
              res.header.should.have
                .property("content-disposition")
                .eql("attachment; filename=custom.bin");
              done();
            });
        });
    });
  });
});
