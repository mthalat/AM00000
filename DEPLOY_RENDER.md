# دليل النشر على Render

## الخطوات

### 1. رفع الكود على GitHub
ارفع جميع الملفات على GitHub repository جديد.

### 2. إنشاء الخدمات على Render

اذهب إلى [render.com](https://render.com) وأنشئ حساباً، ثم:

**الطريقة الأسرع — Blueprint:**
1. اضغط على **New → Blueprint**
2. اربط الـ GitHub repo
3. سيقرأ Render ملف `render.yaml` تلقائياً وينشئ:
   - Web Service (السيرفر + البوت + الموقع)
   - PostgreSQL Database (مجانية)

### 3. إعداد المتغيرات البيئية
بعد إنشاء الخدمة، اذهب إلى:
**Environment → Add Environment Variable**

أضف:
| المفتاح | القيمة |
|---------|--------|
| `TELEGRAM_BOT_TOKEN` | توكن البوت من @BotFather |

> ملاحظة: `DATABASE_URL` تُضاف تلقائياً من قاعدة البيانات.

### 4. تشغيل migrations قاعدة البيانات
بعد أول deploy ناجح، اذهب إلى:
**Shell** في Render وشغّل:

```bash
pnpm --filter @workspace/db run push
```

### 5. Webhook تلقائي
البوت يسجّل webhook تلقائياً عند كل إعادة تشغيل عبر متغير `RENDER_EXTERNAL_URL` الذي يضيفه Render بنفسه.

## بنية الخدمة

```
رابط Render:  https://smart-follow-bot.onrender.com
├── /                   → الموقع (React)
├── /api/stats          → إحصائيات البوت
├── /api/leaderboard    → المتصدرون
├── /api/tasks          → المهام
└── /api/telegram/webhook → Telegram webhook
```

## ملاحظات مهمة
- **الخطة المجانية** على Render تنام بعد 15 دقيقة من عدم النشاط.
  للاستخدام الحقيقي، الخطة المدفوعة ($7/شهر) أفضل.
- قاعدة البيانات المجانية على Render تنتهي بعد **90 يوم**.
