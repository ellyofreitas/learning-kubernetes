import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createClient } from 'redis';

const id = randomUUID();

let client;

const getConnection = async () => {
  if (client) return client;
  client = createClient({
    url: process.env.REDIS_URL,
  });
  await client.connect();
  return client;
};

const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const connection = await getConnection();
    const count = await connection.incr('count');
    return res.end(JSON.stringify({ id, count }));
  } catch (error) {
    return res.end(
      JSON.stringify({
        message: error.message ?? 'server error',
        stack: error.stack,
      })
    );
  }
});

const gracefulShutdown = (event) => (code) => {
  console.info('\nreceived:', code);
  console.info('closing server...');
  server.close(async () => {
    try {
      if (client) {
        console.info('closing redis...');
        await client.disconnect();
      }
      process.exit();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
};

process.on('uncaughtException', (error, origin) => {
  console.log(`[${origin}] signal received`, error);
});

process.on('unhandledRejection', (error) => {
  console.log(`[unhandledRejection] signal received`, error);
});

process.once('SIGINT', gracefulShutdown('SIGINT'));
process.once('SIGTERM', gracefulShutdown('SIGTERM'));

process.once('exit', (code) => {
  console.log('exit signal received:', code);
});

server.listen(9090, () => console.log('server listen at 9090'));
