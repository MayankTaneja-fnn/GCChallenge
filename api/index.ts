// api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from Vercel Express!" });
});

// Export handler
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
