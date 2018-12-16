const fs = require('fs');
const { boardBinaryFileextensions } = require('./builder');
const { HTTPError, rimraf_promise } = require('./utils');

const readFile = async function readFile ({ id, board }) {
  return Promise.resolve(fs.createReadStream(`/tmp/${id}/sketch.ino.${boardBinaryFileextensions[board]}`));
}

const downloadHandler = async function downloadHandler (req, res, next) {
  if (req.method !== 'GET') {
    return next(new HTTPError({ code: 405, error: 'Invalid HTTP method. Only GET requests allowed on /download.' }));
  }

  // execute builder with parameters from user
  try {
    const stream = await readFile(req._url.query);
    const filename = req._url.query.filename || 'sketch';
    stream.on('error', function (err) {
      return next(err);
    });
    stream.on('end', async () => {
      try {
        await rimraf_promise(`/tmp/${req._url.query.id}`)
      } catch (error) {
        console.log(`Error deleting compile sketch folder with ${req._url.query.id}: `, error);
      }
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.${boardBinaryFileextensions[req._url.query.board]}`);
    stream.pipe(res);
  } catch (err) {
    return next(new HTTPError({ error: err.message }));
  }
}

module.exports = {
  downloadHandler
}