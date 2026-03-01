import express from 'express';
import type { ApiResponse, User } from '@wylo/shared';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/api/user', (_req, res) => {
  const response: ApiResponse<User> = {
    data: { id: '1', email: 'user@example.com', name: 'User' },
    status: 200,
  };
  res.json(response);
});

app.listen(port, () => {
  console.log(`Backend (TS) listening on http://localhost:${port}`);
});
