import server from "../src/index.js";
import request from "./setup.js";

describe("Compiler", () => {
  describe("/GET index", () => {
    it("it should get the index page and answer with a 404 ", (done) => {
      request(server)
        .get("/")
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("/compile", () => {
    it("should reject request without board parameter", (done) => {
      request(server)
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
      request(server)
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
      request(server)
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
              "Invalid board parameter. Valid values are: sensebox-mcu,sensebox,sensebox-esp32s2,sensebox-eye"
            );
          done();
        });
    });

    it("should reject request with wrong Content-Type", (done) => {
      request(server)
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
      request(server)
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
