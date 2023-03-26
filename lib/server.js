import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ hello: 'world' }));
});

server.listen(9090, () => console.log('server listen at 9090'));
