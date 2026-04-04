import express, { Request, Response } from 'express';
import { createServer } from 'http';
import pkg from '../../package.json' with { type: 'json' };

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10);

app.all('/', (_req: Request, res: Response) => {
  if (process.send) {
    process.send('uptime');
    process.once('message', (uptime) => {
      res.json({
        bot_name: pkg.name,
        version: pkg.version,
        author: pkg.author,
        description: pkg.description,
        uptime: `${Math.floor(uptime as number)} seconds`,
      });
    });
  } else {
    res.json({ error: 'Process not running with IPC' });
  }
});

app.all('/process', (req: Request, res: Response) => {
  const { send } = req.query;
  if (!send) {
    res.status(400).json({ error: 'Missing send query' });
    return;
  }
  if (process.send) {
    process.send(send);
    res.json({ status: 'Send', data: send });
  } else {
    res.json({ error: 'Process not running with IPC' });
  }
});

app.all('/chat', (req: Request, res: Response) => {
  const { message, to } = req.query;
  if (!message || !to) {
    res.status(400).json({ error: 'Missing message or to query' });
    return;
  }
  res.json({ status: 200, mess: 'does not start' });
});

export { app, server, PORT };
