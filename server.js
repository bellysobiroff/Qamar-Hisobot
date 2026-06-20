// server.js — Telegram bot + mini-app API (Google Sheets bazasi bilan)
import express from "express";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Bot, InlineKeyboard } from "grammy";
import { db } from "./db.js";
import { fieldsFor, FORMS } from "./forms.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BOT_TOKEN = process.env.BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL;
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const PORT = process.env.PORT || 3000;
const REMINDER_HOUR = process.env.REMINDER_HOUR ? Number(process.env.REMINDER_HOUR) : null;
const DEV_BYPASS = process.env.DEV_BYPASS === "1";

if (!BOT_TOKEN) { console.error("BOT_TOKEN .env faylda korsatilmagan."); process.exit(1); }
if (!MINI_APP_URL) console.warn("MINI_APP_URL korsatilmagan - web_app tugmasi ishlamaydi.");

/* --------------------------- initData tekshiruvi --------------------------- */
function checkInitData(initData) {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secret = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const computed = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
    if (computed !== hash) return null;
    return JSON.parse(params.get("user") || "null");
  } catch { return null; }
}

function auth(req, res, next) {
  if (DEV_BYPASS) {
    req.user = { id: req.get("x-dev-user") || "999", first_name: "Dev" };
    req.isAdmin = ADMIN_IDS.length === 0 || ADMIN_IDS.includes(String(req.user.id));
    db.touchUser(req.user);
    return next();
  }
  const initData = req.get("x-init-data") || req.body?.initData || "";
  const user = checkInitData(initData);
  if (!user) return res.status(401).json({ error: "Avtorizatsiya amalga oshmadi. Ilovani Telegram orqali oching." });
  req.user = user;
  req.isAdmin = ADMIN_IDS.includes(String(user.id));
  db.touchUser(user);
  next();
}
const adminOnly = (req, res, next) =>
  req.isAdmin ? next() : res.status(403).json({ error: "Bu bolim faqat administrator uchun." });

/* -------------------------------- Express -------------------------------- */
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.get("/api/me", auth, (req, res) => {
  res.json({
    user: { id: req.user.id, name: [req.user.first_name, req.user.last_name].filter(Boolean).join(" ") },
    isAdmin: req.isAdmin,
    lastDept: db.getUserDept(req.user.id),
  });
});

app.get("/api/departments", auth, (req, res) => res.json({ departments: db.getDepartments() }));

app.get("/api/forms", auth, (req, res) => res.json({ forms: FORMS }));

app.post("/api/departments", auth, adminOnly, (req, res) => {
  const list = Array.isArray(req.body.departments) ? req.body.departments : [];
  res.json({ departments: db.setDepartments(list) });
});

app.get("/api/report", auth, (req, res) => {
  const date = req.query.date;
  res.json({ report: db.getReport(date, req.user.id) });
});

app.post("/api/report", auth, async (req, res) => {
  const { date, deptId, answers } = req.body;
  if (!date || !deptId) return res.status(400).json({ error: "Sana va bolim majburiy." });
  const fields = fieldsFor(deptId);
  const ans = {};
  for (const f of fields) {
    const v = (answers?.[f.id] ?? "").toString().trim();
    if (f.required && !v) return res.status(400).json({ error: `"${f.label}" bosh bolmasligi kerak.` });
    ans[f.id] = v;
  }
  const report = {
    userId: String(req.user.id),
    name: [req.user.first_name, req.user.last_name].filter(Boolean).join(" ") || "-",
    deptId,
    answers: ans,
    date, submittedAt: new Date().toISOString(),
  };

  // Hisobotni Sheetsga saqlaymiz (await — yozilgani tasdiqlanmaguncha kutamiz)
  try {
    await db.saveReport(date, req.user.id, report);
  } catch (e) {
    console.error("saveReport error:", e.message);
    return res.status(500).json({ error: "Saqlashda xatolik yuz berdi. Birozdan keyin qayta urinib koring." });
  }
  db.setUserDept(req.user.id, deptId); // kichik ma'lumot — fonida

  // Javobni qaytaramiz, keyin xabarlarni fonida yuboramiz
  res.json({ ok: true, report });
  notifyOnReport(report).catch(e => console.error("notify error:", e.message));
});

app.get("/api/admin/reports", auth, adminOnly, (req, res) => {
  const date = req.query.date;
  const reports = db.getReportsForDate(date).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  const departments = db.getDepartments();
  const submitted = new Set(reports.map(r => r.deptId));
  const missing = departments.filter(d => !submitted.has(d.id));
  res.json({ reports, departments, missing });
});

/* ---------------------------------- Bot ---------------------------------- */
const bot = new Bot(BOT_TOKEN);

bot.command("start", async (ctx) => {
  db.touchUser(ctx.from, ctx.chat.id);
  const kb = MINI_APP_URL ? new InlineKeyboard().webApp("Hisobot topshirish", MINI_APP_URL) : undefined;
  await ctx.reply(
    "Assalomu alaykum! Bu - Qamar kunlik hisobot tizimi.\n\n" +
    "Har kuni quyidagi tugma orqali bolim hisobotingizni topshiring. " +
    "Administratorlar barcha hisobotlarni admin panelda koradi.",
    { reply_markup: kb }
  );
});

bot.command("help", (ctx) =>
  ctx.reply("Hisobot topshirish uchun pastdagi menyu tugmasini yoki /start dagi tugmani bosing."));

/* ----------------------- Hisobot xabarnomalari ----------------------- */
function deptName(deptId) {
  const d = db.getDepartments().find(x => x.id === deptId);
  return d ? d.name : deptId;
}
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit",
    });
  } catch { return new Date(iso).toISOString().slice(11, 16); }
}
// chatId topish: avval saqlangan chatId, bo'lmasa userId (shaxsiy chat id == user id)
function chatIdFor(userId) {
  const u = db.getUser(userId);
  return u?.chatId || String(userId);
}

async function notifyOnReport(report) {
  const name = deptName(report.deptId);
  const time = fmtTime(report.submittedAt);

  // 1) Topshiruvchiga tasdiq
  try {
    await bot.api.sendMessage(
      chatIdFor(report.userId),
      "✅ Hisobotingiz qabul qilindi!\n\n" +
      `📋 Bo'lim: ${name}\n` +
      `📅 Sana: ${report.date}\n` +
      `🕐 Vaqt: ${time}\n\n` +
      "Rahmat! Ma'lumotlaringiz tizimda saqlandi."
    );
  } catch (e) {
    console.error("submitter notify error:", e.message);
  }

  // 2) Adminlarga to'liq hisobot
  const fields = fieldsFor(report.deptId);
  const lines = fields
    .map(f => {
      const v = (report.answers?.[f.id] ?? "").toString().trim();
      return v ? `• ${f.label}: ${v}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const adminMsg =
    "📨 Yangi hisobot topshirildi\n\n" +
    `👤 ${report.name}\n` +
    `📋 Bo'lim: ${name}\n` +
    `📅 Sana: ${report.date}\n` +
    `🕐 Vaqt: ${time}\n` +
    "————————————\n" +
    (lines || "(maydonlar bo'sh)");

  for (const adminId of ADMIN_IDS) {
    if (String(adminId) === String(report.userId)) continue; // o'ziga takror yubormaymiz
    try {
      await bot.api.sendMessage(chatIdFor(adminId), adminMsg);
    } catch (e) {
      console.error(`admin ${adminId} notify error:`, e.message);
    }
  }
}

/* ------------------------------ Eslatmalar ------------------------------- */
function todayStr() {
  const d = new Date(); const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
let lastReminderDate = "";
async function maybeRemind() {
  if (REMINDER_HOUR === null) return;
  const now = new Date();
  const date = todayStr();
  if (now.getHours() === REMINDER_HOUR && lastReminderDate !== date) {
    lastReminderDate = date;
    const submitted = new Set(db.getReportsForDate(date).map(r => r.userId));
    for (const u of db.allUsers()) {
      if (submitted.has(u.id) || !u.chatId) continue;
      try {
        await bot.api.sendMessage(u.chatId,
          "Eslatma: bugungi kunlik hisobotingizni hali topshirmadingiz.",
          { reply_markup: MINI_APP_URL ? new InlineKeyboard().webApp("Topshirish", MINI_APP_URL) : undefined });
      } catch (e) { /* foydalanuvchi botni bloklagan bolishi mumkin */ }
    }
  }
}
setInterval(maybeRemind, 60 * 1000);

/* -------------------------------- Ishga tushirish ------------------------- */
(async () => {
  // 1) Avval bazaga ulanamiz (Sheetsdan ma'lumotlar yuklanadi)
  try {
    await db.init();
  } catch (e) {
    console.error("Bazaga ulanib bolmadi:", e.message);
    process.exit(1);
  }

  // 2) Web-server
  app.listen(PORT, () => console.log(`Qamar server: http://localhost:${PORT}`));

  // 3) Bot
  try {
    if (MINI_APP_URL) {
      await bot.api.setChatMenuButton({
        menu_button: { type: "web_app", text: "Hisobot", web_app: { url: MINI_APP_URL } },
      });
    }
    await bot.api.setMyCommands([
      { command: "start", description: "Boshlash / hisobot tugmasi" },
      { command: "help", description: "Yordam" },
    ]);
    bot.start({ onStart: () => console.log("Bot ishga tushdi (long polling).") });
  } catch (e) { console.error("Bot start error:", e.message); }
})();
