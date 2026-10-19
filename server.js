const http = require('http');
const handler = require('./api/index');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(PORT, () => {
  console.log(`[KindleDash] Server running locally at http://localhost:${PORT}`);
});
