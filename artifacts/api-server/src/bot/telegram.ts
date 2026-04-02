import { Telegraf, Context, Markup } from "telegraf";
import { db } from "@workspace/db";
import {
  botUsersTable,
  tasksTable,
  taskCompletionsTable,
  pointTransactionsTable,
} from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

export const bot = new Telegraf(token);

const REQUIRED_SHARES = 5;
const WELCOME_BONUS = 50;
const REFERRAL_BONUS = 20;

function generateReferralCode(telegramId: string): string {
  return `REF${telegramId}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

async function getOrCreateUser(ctx: Context) {
  const from = ctx.from;
  if (!from) return null;

  const existing = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.telegramId, String(from.id)))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const referralCode = generateReferralCode(String(from.id));
  const [user] = await db
    .insert(botUsersTable)
    .values({
      telegramId: String(from.id),
      username: from.username ?? "",
      firstName: from.first_name ?? "",
      referralCode,
    })
    .returning();

  return user;
}

async function addPoints(userId: number, amount: number, type: string, description: string) {
  await db
    .update(botUsersTable)
    .set({ points: sql`${botUsersTable.points} + ${amount}` })
    .where(eq(botUsersTable.id, userId));

  await db.insert(pointTransactionsTable).values({
    userId,
    amount,
    type,
    description,
  });
}

async function getBotUsername(): Promise<string> {
  try {
    const me = await bot.telegram.getMe();
    return me.username ?? "SmartFollowBot";
  } catch {
    return "SmartFollowBot";
  }
}

bot.start(async (ctx) => {
  const from = ctx.from;
  if (!from) return;

  const existing = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.telegramId, String(from.id)))
    .limit(1);

  let user = existing[0];
  const isNew = !user;

  if (!user) {
    const referralCode = generateReferralCode(String(from.id));
    [user] = await db
      .insert(botUsersTable)
      .values({
        telegramId: String(from.id),
        username: from.username ?? "",
        firstName: from.first_name ?? "",
        referralCode,
      })
      .returning();
  }

  const payload = ctx.startPayload;
  if (payload && isNew) {
    const referrer = await db
      .select()
      .from(botUsersTable)
      .where(eq(botUsersTable.referralCode, payload))
      .limit(1);

    if (referrer.length > 0 && referrer[0].telegramId !== String(from.id)) {
      await db
        .update(botUsersTable)
        .set({ referredById: referrer[0].id })
        .where(eq(botUsersTable.id, user.id));

      const newShareCount = referrer[0].shareCount + 1;
      const shouldUnlock = !referrer[0].isUnlocked && newShareCount >= REQUIRED_SHARES;

      await db
        .update(botUsersTable)
        .set({
          shareCount: newShareCount,
          isUnlocked: shouldUnlock ? true : referrer[0].isUnlocked,
        })
        .where(eq(botUsersTable.id, referrer[0].id));

      await addPoints(referrer[0].id, REFERRAL_BONUS, "referral", `دعوة ${from.first_name}`);

      if (shouldUnlock) {
        await addPoints(referrer[0].id, WELCOME_BONUS, "welcome", "مكافأة فتح البوت 🎉");
        try {
          await ctx.telegram.sendMessage(
            referrer[0].telegramId,
            `🎉 تهانينا ${referrer[0].firstName}!\n\nلقد دعوت ${REQUIRED_SHARES} أشخاص! البوت مفتوح الآن لك!\n🎁 حصلت على ${WELCOME_BONUS} نقطة مكافأة ترحيب!\n\nاكتب /menu لبدء استخدام البوت.`
          );
        } catch (e) {
          logger.error({ e }, "Failed to notify referrer");
        }
      } else {
        try {
          await ctx.telegram.sendMessage(
            referrer[0].telegramId,
            `✅ ${from.first_name} انضم عبر رابطك!\n🏅 ${newShareCount}/${REQUIRED_SHARES} أشخاص\n+${REFERRAL_BONUS} نقطة أضيفت لك!`
          );
        } catch (e) {
          logger.error({ e }, "Failed to notify referrer");
        }
      }
    }
  }

  const refreshed = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.id, user.id))
    .limit(1);
  user = refreshed[0];

  if (user.isUnlocked) {
    await ctx.replyWithHTML(
      `👋 أهلاً ${from.first_name}!\n\n🔓 حسابك مفعّل!\n💰 نقاطك: <b>${user.points}</b>\n\nاختر من القائمة:`,
      Markup.keyboard([
        ["📋 المهام", "💰 نقاطي"],
        ["🎯 عجلة الحظ", "👥 دعوة أصدقاء"],
        ["🏆 المتصدرين", "⭐ VIP"],
      ]).resize()
    );
  } else {
    const botUsername = await getBotUsername();
    const refLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
    const remaining = REQUIRED_SHARES - user.shareCount;

    await ctx.replyWithHTML(
      `👋 أهلاً ${from.first_name} في بوت تبادل المتابعين الذكي! 🚀\n\n🔒 <b>لفتح البوت، عليك دعوة ${REQUIRED_SHARES} أصدقاء</b>\n\n📊 تقدمك: ${user.shareCount}/${REQUIRED_SHARES} ✅\n⏳ متبقي: ${remaining} شخص\n\n🔗 رابط الدعوة الخاص بك:\n<code>${refLink}</code>\n\n💡 شارك هذا الرابط مع أصدقائك الآن!`,
      Markup.inlineKeyboard([
        [Markup.button.url("📤 مشاركة الرابط", `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("🚀 انضم معي في بوت تبادل المتابعين الذكي! احصل على متابعين حقيقيين!")}`)]
      ])
    );
  }
});

bot.hears(["📋 المهام", "/tasks"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    return ctx.reply("🔒 البوت مقفل. دعوة 5 أصدقاء لفتحه! اكتب /start");
  }

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.isActive, true));

  const completed = await db
    .select()
    .from(taskCompletionsTable)
    .where(eq(taskCompletionsTable.userId, user.id));

  const completedIds = new Set(completed.map((c) => c.taskId));

  if (tasks.length === 0) {
    return ctx.reply("📭 لا توجد مهام متاحة الآن. تابعنا لمزيد من المهام قريباً!");
  }

  const platformEmoji: Record<string, string> = {
    instagram: "📸",
    twitter: "🐦",
    tiktok: "🎵",
    youtube: "🎬",
    telegram: "✈️",
  };

  const typeLabel: Record<string, string> = {
    follow: "متابعة",
    like: "لايك",
    comment: "كومنت",
    subscribe: "اشتراك",
  };

  let text = "📋 <b>المهام المتاحة:</b>\n\n";
  for (const task of tasks) {
    const done = completedIds.has(task.id);
    const emoji = platformEmoji[task.platform] ?? "🌐";
    const label = typeLabel[task.taskType] ?? task.taskType;
    text += `${done ? "✅" : "⭕"} ${emoji} ${label} @${task.targetAccount}\n`;
    text += `   💰 ${task.pointsReward} نقطة ${done ? "(مكتمل)" : ""}\n\n`;
  }

  const buttons = tasks
    .filter((t) => !completedIds.has(t.id))
    .map((t) => {
      const emoji = platformEmoji[t.platform] ?? "🌐";
      const label = typeLabel[t.taskType] ?? t.taskType;
      return [Markup.button.callback(`${emoji} ${label} @${t.targetAccount} (+${t.pointsReward}نق)`, `task_${t.id}`)];
    });

  await ctx.replyWithHTML(text, Markup.inlineKeyboard(buttons));
});

bot.action(/^task_(\d+)$/, async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    return ctx.answerCbQuery("🔒 البوت مقفل!");
  }

  const taskId = parseInt(ctx.match[1]);

  const existing = await db
    .select()
    .from(taskCompletionsTable)
    .where(
      and(
        eq(taskCompletionsTable.userId, user.id),
        eq(taskCompletionsTable.taskId, taskId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return ctx.answerCbQuery("✅ هذه المهمة منجزة مسبقاً!");
  }

  const task = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).limit(1);
  if (!task[0]) return ctx.answerCbQuery("❌ المهمة غير موجودة");

  await db.insert(taskCompletionsTable).values({
    userId: user.id,
    taskId,
  });

  await addPoints(user.id, task[0].pointsReward, "task", `إنجاز مهمة: ${task[0].taskType} @${task[0].targetAccount}`);

  await ctx.answerCbQuery(`✅ تم! +${task[0].pointsReward} نقطة`);
  await ctx.replyWithHTML(`✅ <b>مهمة مكتملة!</b>\n\n💰 حصلت على <b>${task[0].pointsReward} نقطة</b>!\nنقاطك الكلية تحتاج تحديث - اضغط /points`);
});

bot.hears(["💰 نقاطي", "/points"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    return ctx.reply("🔒 البوت مقفل. دعوة 5 أصدقاء لفتحه!");
  }

  const refreshed = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.id, user.id))
    .limit(1);
  const u = refreshed[0];

  const vipLabel = u.vipLevel === 0 ? "عادي" : u.vipLevel === 1 ? "⭐ VIP" : "👑 VIP+";

  await ctx.replyWithHTML(
    `💰 <b>رصيدك:</b>\n\n🏅 النقاط: <b>${u.points}</b>\n⭐ مستوى: <b>${vipLabel}</b>\n👥 الدعوات: <b>${u.shareCount}/${REQUIRED_SHARES}</b>\n\n💡 <i>استخدم نقاطك لزيادة متابعيك!</i>`
  );
});

bot.hears(["🎯 عجلة الحظ", "/wheel"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    return ctx.reply("🔒 البوت مقفل. دعوة 5 أصدقاء لفتحه!");
  }

  const now = new Date();
  const lastSpin = user.lastWheelSpin;

  if (lastSpin) {
    const diff = now.getTime() - lastSpin.getTime();
    const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - diff) / (60 * 60 * 1000));
    if (diff < 24 * 60 * 60 * 1000) {
      return ctx.reply(`⏳ عجلة الحظ متاحة مرة كل 24 ساعة.\n⏰ تبقى ${hoursLeft} ساعة.`);
    }
  }

  const prizes = [5, 10, 15, 20, 25, 30, 50, 100];
  const prize = prizes[Math.floor(Math.random() * prizes.length)];

  await db
    .update(botUsersTable)
    .set({ lastWheelSpin: now })
    .where(eq(botUsersTable.id, user.id));

  await addPoints(user.id, prize, "wheel", "عجلة الحظ اليومية 🎯");

  const spinFrames = ["🎯", "🎰", "🎡", "🎠"];
  const msg = await ctx.reply(spinFrames[0] + " جارٍ الدوران...");

  let i = 1;
  const interval = setInterval(async () => {
    if (i >= spinFrames.length) {
      clearInterval(interval);
      try {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          msg.message_id,
          undefined,
          `🎯 <b>النتيجة!</b>\n\n🎁 ربحت <b>${prize} نقطة!</b> 🎉\n\n🔄 يمكنك اللعب مجدداً غداً.`,
          { parse_mode: "HTML" }
        );
      } catch {}
      return;
    }
    try {
      await ctx.telegram.editMessageText(ctx.chat!.id, msg.message_id, undefined, spinFrames[i] + " جارٍ الدوران...");
    } catch {}
    i++;
  }, 500);
});

bot.hears(["👥 دعوة أصدقاء", "/share"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  const botUsername = await getBotUsername();
  const refLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
  const remaining = Math.max(0, REQUIRED_SHARES - user.shareCount);

  await ctx.replyWithHTML(
    `👥 <b>دعوة الأصدقاء</b>\n\n📊 تقدمك: ${user.shareCount}/${REQUIRED_SHARES}\n${user.isUnlocked ? "✅ البوت مفتوح!" : `⏳ تبقى ${remaining} دعوة للفتح`}\n\n💰 كل دعوة = +${REFERRAL_BONUS} نقطة\n🎁 عند الوصول لـ 5 = +${WELCOME_BONUS} نقطة مكافأة!\n\n🔗 رابطك:\n<code>${refLink}</code>`,
    Markup.inlineKeyboard([
      [Markup.button.url("📤 مشاركة الرابط", `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("🚀 انضم معي في بوت تبادل المتابعين الذكي! احصل على متابعين حقيقيين!")}`)],
    ])
  );
});

bot.hears(["🏆 المتصدرين", "/leaderboard"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    return ctx.reply("🔒 البوت مقفل. دعوة 5 أصدقاء لفتحه!");
  }

  const top = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.isUnlocked, true))
    .orderBy(sql`${botUsersTable.points} DESC`)
    .limit(10);

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  let text = "🏆 <b>أفضل 10 مستخدمين:</b>\n\n";
  top.forEach((u, i) => {
    const name = u.username ? `@${u.username}` : u.firstName;
    text += `${medals[i]} ${name} — <b>${u.points}</b> نقطة\n`;
  });

  await ctx.replyWithHTML(text);
});

bot.hears(["⭐ VIP", "/vip"], async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  await ctx.replyWithHTML(
    `⭐ <b>باقات VIP</b>\n\n🔥 VIP - 500 نقطة/شهر\n• سرعة أكبر في المتابعين\n• مهام حصرية\n• أولوية في القائمة\n\n👑 VIP+ - 1000 نقطة/شهر\n• ضعف السرعة\n• دعم مباشر\n• إعلانات مجانية\n\n💰 نقاطك الحالية: <b>${user.points}</b>\n\nللاشتراك اتصل بالمشرف: @admin`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⭐ VIP - 500 نقطة", "buy_vip_1")],
      [Markup.button.callback("👑 VIP+ - 1000 نقطة", "buy_vip_2")],
    ])
  );
});

bot.action("buy_vip_1", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (user.points < 500) {
    return ctx.answerCbQuery("❌ نقاطك غير كافية! تحتاج 500 نقطة.");
  }

  await db.update(botUsersTable)
    .set({ points: sql`${botUsersTable.points} - 500`, vipLevel: 1 })
    .where(eq(botUsersTable.id, user.id));

  await db.insert(pointTransactionsTable).values({
    userId: user.id,
    amount: -500,
    type: "vip_purchase",
    description: "اشتراك VIP",
  });

  await ctx.answerCbQuery("✅ تم الاشتراك في VIP!");
  await ctx.replyWithHTML("⭐ <b>مبروك!</b> أنت الآن VIP! استمتع بالمزايا الحصرية.");
});

bot.action("buy_vip_2", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (user.points < 1000) {
    return ctx.answerCbQuery("❌ نقاطك غير كافية! تحتاج 1000 نقطة.");
  }

  await db.update(botUsersTable)
    .set({ points: sql`${botUsersTable.points} - 1000`, vipLevel: 2 })
    .where(eq(botUsersTable.id, user.id));

  await db.insert(pointTransactionsTable).values({
    userId: user.id,
    amount: -1000,
    type: "vip_purchase",
    description: "اشتراك VIP+",
  });

  await ctx.answerCbQuery("✅ تم الاشتراك في VIP+!");
  await ctx.replyWithHTML("👑 <b>مبروك!</b> أنت الآن VIP+! استمتع بأقصى المزايا.");
});

bot.hears("/menu", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (user.isUnlocked) {
    await ctx.reply(
      "📱 القائمة الرئيسية:",
      Markup.keyboard([
        ["📋 المهام", "💰 نقاطي"],
        ["🎯 عجلة الحظ", "👥 دعوة أصدقاء"],
        ["🏆 المتصدرين", "⭐ VIP"],
      ]).resize()
    );
  } else {
    await ctx.reply("🔒 البوت مقفل. دعوة 5 أصدقاء لفتحه! /start");
  }
});

bot.on("text", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;

  if (!user.isUnlocked) {
    const botUsername = await getBotUsername();
    const refLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
    await ctx.replyWithHTML(
      `🔒 البوت مقفل!\n\nادعُ ${REQUIRED_SHARES - user.shareCount} شخص آخر لفتحه.\n\n🔗 رابطك:\n<code>${refLink}</code>`
    );
  } else {
    await ctx.reply("استخدم الأزرار أدناه للتنقل 👇", Markup.keyboard([
      ["📋 المهام", "💰 نقاطي"],
      ["🎯 عجلة الحظ", "👥 دعوة أصدقاء"],
      ["🏆 المتصدرين", "⭐ VIP"],
    ]).resize());
  }
});
