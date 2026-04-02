import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetTasksResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.isActive, true));

    const data = GetTasksResponse.parse(
      tasks.map((t) => ({
        id: t.id,
        platform: t.platform,
        taskType: t.taskType,
        targetAccount: t.targetAccount,
        pointsReward: t.pointsReward,
        isActive: t.isActive,
      }))
    );

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get tasks");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
