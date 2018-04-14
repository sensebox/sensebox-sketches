const connect = require('connect');
const http = require('http');
const bodyParser = require('body-parser');
const app = connect();
const responseTime = require('response-time');
const morgan = require('morgan');

const { execBuilder, validBoards } = require('./builder');

const HTTPError = function HTTPError ({ code = 500, error = '' }) {
  const err = new Error(error);
  err.statusCode = code;

  return err;
};

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Allow': 'POST',
  'X-Backend-Server': (require('os').hostname())
};

const preRequestValidator = function preRequestValidator (req, res, next) {
  // set some headers, just in case
  for (const [ k, v ] of Object.entries(defaultHeaders)) {
    res.setHeader(k, v);
  }

  // reject everything not coming through /compile
  if (req.url !== '/compile') {
    return next(new HTTPError({ code: 404, error: `Cannot serve ${req.url}` }));
  }

  // reject all non POST request
  if (req.method !== 'POST') {
    return next(new HTTPError({ code: 405, error: 'Invalid HTTP method. Only POST requests allowed.' }));
  }

  // reject all non application/json requests
  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('application/json')) {
    return next(new HTTPError({ code: 415, error: 'Invalid Content-Type. Only application/json Content-Type allowed.' }));
  }

  next();
};

const payloadValidator = function payloadValidator (req, res, next) {
  // check if parameters sketch and board are specified and valid
  let { sketch, board } = req.body;

  if (!sketch || !board) {
    return next(new HTTPError({ code: 422, error: 'Parameters \'sketch\' and \'board\' are required' }));
  }

  sketch = sketch.toString().trim();
  board = board.toString().trim();

  if (!sketch || !board) {
    return next(new HTTPError({ code: 422, error: 'Parameters \'sketch\' and \'board\' are required' }));
  }

  if (!validBoards.includes(board)) {
    return next(new HTTPError({ code: 422, error: `Invalid board parameter. Valid values are: ${validBoards.join(',')}` }));
  }

  req._builderParams = { sketch, board };
  next();
};

// handle requests
const handler = async function handler (req, res, next) {
  // execute builder with parameters from user
  try {
    const stream = await execBuilder(req._builderParams);
    stream.on('error', function (err) {
      return next(err);
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    stream.pipe(res);
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
};

const errorHandler = function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.statusCode = (err.statusCode ? err.statusCode : 500);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    code: http.STATUS_CODES[res.statusCode],
    message: err.message
  }));
};

const startServer = function startServer () {
  app.use(morgan(':date[iso] :res[x-backend-server] :remote-addr :req[x-real-ip] :method :url :response-time[0] :status'));
  app.use(responseTime());
  app.use(preRequestValidator);
  app.use(bodyParser.json());
  app.use(payloadValidator);
  app.use(handler);
  app.use(errorHandler);

  http.createServer(app).listen(3000);
  console.log('Compiler started and listening on port 3000!');
};

startServer();
