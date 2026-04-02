import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the React frontend static files in production
const staticPath = path.resolve(__dirname, "../../follower-bot/dist/public");
app.use(express.static(staticPath));

// SPA fallback — any non-API route returns index.html (Express 5 syntax)
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

export default app;
