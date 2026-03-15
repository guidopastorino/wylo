import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import {
  handleDeleteConnectedRepo,
  handleGetCommitDetail,
  handleGetConnectedRepos,
  handleGetDashboard,
  handleGetPullDetail,
  handleGetPulls,
  handleGetRepoCommits,
  handleGetRepoContents,
  handleGetRepoDetail,
  handleGetRepoPulls,
  handleGetRepos,
  handlePostConnectedRepo,
} from "./routes/github";

const app = express();
const port = process.env.PORT ?? 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Wylo API is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/github/repos", handleGetRepos);
app.get("/api/github/pulls", handleGetPulls);
app.get("/api/github/dashboard", handleGetDashboard);
app.get("/api/github/connected-repos", handleGetConnectedRepos);
app.post("/api/github/connected-repos", handlePostConnectedRepo);
app.delete("/api/github/connected-repos", handleDeleteConnectedRepo);

app.get("/api/github/repos/:owner/:repo", handleGetRepoDetail);
app.get("/api/github/repos/:owner/:repo/commits", handleGetRepoCommits);
app.get("/api/github/repos/:owner/:repo/commits/:sha", handleGetCommitDetail);
app.get("/api/github/repos/:owner/:repo/pulls", handleGetRepoPulls);
app.get("/api/github/repos/:owner/:repo/pulls/:pull_number", handleGetPullDetail);
app.get("/api/github/repos/:owner/:repo/contents", handleGetRepoContents);

app.listen(port, () => {
  console.log(`Backend (TS) listening on http://localhost:${port}`);
});
