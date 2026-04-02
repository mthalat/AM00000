import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Auto-register Telegram webhook on startup (production only)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const domain = process.env.RENDER_EXTERNAL_URL;
  if (token && domain) {
    try {
      const webhookUrl = `${domain}/api/telegram/webhook`;
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const json = await res.json() as { ok: boolean };
      if (json.ok) {
        logger.info({ webhookUrl }, "Telegram webhook registered");
      } else {
        logger.warn({ json }, "Telegram webhook registration failed");
      }
    } catch (e) {
      logger.warn({ e }, "Could not auto-register Telegram webhook");
    }
  }
});
