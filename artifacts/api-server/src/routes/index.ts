import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import usersRouter from "./users";
import tasksRouter from "./tasks";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(leaderboardRouter);
router.use(usersRouter);
router.use(tasksRouter);
router.use(telegramRouter);

export default router;
