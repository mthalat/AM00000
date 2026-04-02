import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botUsersTable, taskCompletionsTable, pointTransactionsTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsersRow] = await db.select({ count: sql<number>`count(*)` }).from(botUsersTable);
    const [unlockedUsersRow] = await db.select({ count: sql<number>`count(*)` }).from(botUsersTable).where(eq(botUsersTable.isUnlocked, true));
    const [tasksCompletedRow] = await db.select({ count: sql<number>`count(*)` }).from(taskCompletionsTable);
    const [pointsRow] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(pointTransactionsTable).where(sql`${pointTransactionsTable.amount} > 0`);
    const [todayUsersRow] = await db.select({ count: sql<number>`count(*)` }).from(botUsersTable).where(gte(botUsersTable.createdAt, today));

    const data = GetStatsResponse.parse({
      totalUsers: Number(totalUsersRow.count),
      unlockedUsers: Number(unlockedUsersRow.count),
      totalPointsDistributed: Number(pointsRow.total),
      tasksCompleted: Number(tasksCompletedRow.count),
      todayNewUsers: Number(todayUsersRow.count),
    });

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
