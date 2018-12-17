process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

chai.use(chaiHttp);

describe('Compiler', () => {
  describe('/GET index', () => {
    it('it should get the index page and answer with a 404 ', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })

  describe('/POST compiler', () => {
    it('should post a sketch and compile it', (done) => {
      const sketch = {
        board: 'sensebox-mcu',
        sketch: 'void setup() {\nSerial.begin(9600);\nSerial.println(\"Hello World\");\n}\nvoid loop() {}'
      };
      chai.request(server)
        .post('/compile')
        .send(sketch)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Sketch successfully compiled and created!');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('id');
          done();
        })
    });
  })
});