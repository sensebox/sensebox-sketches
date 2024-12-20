const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/index");
const should = chai.should();

chai.use(chaiHttp);

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
    it("should reject request without board parameter", (done) => {
      chai
        .request(server)
        .post("/compile")
        .send({ sketch: "void setup() {} void loop() {}" })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have
            .property("message")
            .eql("Parameters 'sketch' and 'board' are required");
          done();
        });
    });

    it("should reject request without sketch parameter", (done) => {
      chai
        .request(server)
        .post("/compile")
        .send({ board: "sensebox-mcu" })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have
            .property("message")
            .eql("Parameters 'sketch' and 'board' are required");
          done();
        });
    });

    it("should reject request with invalid board", (done) => {
      chai
        .request(server)
        .post("/compile")
        .send({
          board: "esp8266",
          sketch: "void setup() {} void loop() {}",
        })
        .end((err, res) => {
          res.should.have.status(422);
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
        .send({
          board: "sensebox-mcu",
          sketch: "void setup() {} void loop() {}",
        })
        .end((err, res) => {
          res.should.have.status(405);
          res.body.should.have
            .property("message")
            .eql(
              "Invalid HTTP method. Only POST requests allowed on /compile."
            );
          done();
        });
    });
  });
});
