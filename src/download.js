const fs = require('fs');
const { boardBinaryFileextensions } = require('./builder');
const { HTTPError } = require('./utils');

const readFile = async function readFile ({ id, board }) {
  console.log(id);
  console.log(board);
  return Promise.resolve(fs.createReadStream(`/tmp/${id}/sketch.ino.${boardBinaryFileextensions[board]}`));
}

const downloadHandler = async function downloadHandler (req, res, next) {
  if (req.method !== 'GET') {
    return next(new HTTPError({ code: 405, error: 'Invalid HTTP method. Only GET requests allowed on /download.' }));
  }

  // execute builder with parameters from user
  try {
    const stream = await readFile(req._url.query);
    stream.on('error', function (err) {
      console.log('stream on error');
      return next(err);
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=sketch.${boardBinaryFileextensions[req._url.query.board]}`);
    stream.pipe(res);
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
}

module.exports = {
  downloadHandler
}