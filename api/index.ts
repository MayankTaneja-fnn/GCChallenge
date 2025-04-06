import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

export default (req: VercelRequest, res: VercelResponse) => {
  app(req as any, res as any);
};
