import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botUsersTable, taskCompletionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GetLeaderboardResponse, GetLeaderboardQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const params = GetLeaderboardQueryParams.parse(req.query);
    const limit = params.limit ?? 10;

    const top = await db
      .select()
      .from(botUsersTable)
      .where(eq(botUsersTable.isUnlocked, true))
      .orderBy(sql`${botUsersTable.points} DESC`)
      .limit(limit);

    const data = GetLeaderboardResponse.parse(
      top.map((u, i) => ({
        rank: i + 1,
        telegramId: u.telegramId,
        username: u.username,
        firstName: u.firstName,
        points: u.points,
        vipLevel: u.vipLevel,
        shareCount: u.shareCount,
      }))
    );

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get leaderboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
