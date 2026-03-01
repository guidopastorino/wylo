import express from "express";
import cors from "cors";
import type { ApiResponse, User } from "@wylo/shared";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();
const port = process.env.PORT ?? 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/auth", toNodeHandler(auth));

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
