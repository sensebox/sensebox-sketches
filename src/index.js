const { execBuilder, validBoards } = require('./builder');
const express = require('express');
const app = express();

// handle requests
const handler = async function handler (req, res, next) {
  // execute builder with parameters from user
  try {
    const stream = await execBuilder(req._builderParams);
  } catch (err) {
    return next(err);
  }

  res.setHeader('content-type', 'application/octet-stream');
  stream.pipe(res);
};

const preRequestValidator = function requestValidator(req, res, next) {
  // reject all non POST request
  if (req.method !== 'POST') {
    return next(new Error('Invalid HTTP method. Only POST requests allowed.'));
  }

  // reject all non application/json requests
  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('application/json')) {
    return next(new Error('Invalid Content-Type. Only application/json Content-Type allowed.'));
  }

  next();
};

const payloadValidator = function payloadValidator (req, res, next) {
  // check if parameters sketch and board are specified and valid
  let { sketch, board } = req.body;

  if (!sketch || !board) {
    return next(new Error('Parameters \'sketch\' and \'board\' are required'));
  }

  sketch = sketch.toString().trim();
  board = board.toString().trim();

  if (!sketch || !board) {
    return next(new Error('Parameters \'sketch\' and \'board\' are required'));
  }

  if (!validBoards.includes(board)) {
    return next(new Error(`Invalid board parameter. Valid values are: ${validBoards.join(',')}`));
  }

  req._builderParams = { sketch, board };
  next();
};

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(400).send({ error: err.message })
}

const startServer = function startServer () {
  app.use(preRequestValidator);
  app.use(express.json());
  app.use(payloadValidator);
  app.use(errorHandler);


  app.post('/compile', handler);

  app.listen(3000, () => console.log('Example app listening on port 3000!'))
};

startServer();
