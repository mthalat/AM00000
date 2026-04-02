import { Router, type IRouter } from "express";
import { bot } from "../bot/telegram";

const router: IRouter = Router();

router.post("/telegram/webhook", async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false });
  }
});

export default router;
