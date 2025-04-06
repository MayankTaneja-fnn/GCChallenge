import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

const app = express();

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

// Let Vercel handle the request
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
