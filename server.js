const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const cache = {};

const PORT = 3000;

function send404(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'Content-Type': mime.getType(path.basename(filePath)),
  });
  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, (exists) => {
      if (exists) {
        fs.readFile(absPath, (err, data) => {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

const server = http.createServer((req, res) => {
  let filePath = false;

  if (req.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + req.url;
  }

  let absPath = './' + filePath;
  serveStatic(res, cache, absPath);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
