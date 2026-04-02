import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botUsersTable, taskCompletionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GetUserResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;

    const users = await db
      .select()
      .from(botUsersTable)
      .where(eq(botUsersTable.telegramId, telegramId))
      .limit(1);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const u = users[0];
    const [tasksRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(taskCompletionsTable)
      .where(eq(taskCompletionsTable.userId, u.id));

    const data = GetUserResponse.parse({
      id: u.id,
      telegramId: u.telegramId,
      username: u.username,
      firstName: u.firstName,
      points: u.points,
      vipLevel: u.vipLevel,
      referralCode: u.referralCode,
      shareCount: u.shareCount,
      isUnlocked: u.isUnlocked,
      tasksCompleted: Number(tasksRow.count),
      createdAt: u.createdAt.toISOString(),
    });

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
