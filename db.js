// db.js — Google Sheets asosidagi saqlash
// Ishlash printsipi: ishga tushganda hammasi Sheetsdan xotiraga yuklanadi (init).
// O'qishlar xotiradan (tez). Yozuvlar esa xotira + Sheetsga qo'shib boriladi.
// Restartda ma'lumot Sheetsdan qayta yuklanadi — shuning uchun yo'qolmaydi.

import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_ID;

// MUHIM: bu id'lar forms.js dagi FORMS kalitlari bilan AYNAN bir xil bolishi shart.
const DEFAULT_DEPTS = [
  { id: "hr",          name: "HR" },
  { id: "sotuv",       name: "Sotuv bolimi" },
  { id: "ombor",       name: "Ombor" },
  { id: "taminot",     name: "Taminot" },
  { id: "call_center", name: "Call center" },
  { id: "marketing",   name: "Marketing" },
  { id: "b2b",         name: "B2B" },
];

// Jadval varaqlari (tab) va ularning sarlavhalari
const TAB_REPORTS  = "Reports";
const TAB_USERS    = "Users";
const TAB_USERDEPT = "UserDept";
const HEADERS = {
  [TAB_REPORTS]:  ["date", "userId", "name", "deptId", "submittedAt", "answers"],
  [TAB_USERS]:    ["userId", "name", "chatId"],
  [TAB_USERDEPT]: ["userId", "deptId"],
};

let data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {} };
let sheets = null;

/* ----------------------- Kirish ma'lumotlari (credentials) ----------------------- */
function loadCredentials() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  let json;
  if (b64) json = Buffer.from(b64, "base64").toString("utf8");
  else if (raw) json = raw;
  else throw new Error("GOOGLE_SERVICE_ACCOUNT_B64 (yoki GOOGLE_SERVICE_ACCOUNT) .env da korsatilmagan.");
  const creds = JSON.parse(json);
  // .env orqali kelganda private_key dagi \n lar matn bolib qolishi mumkin — tiklaymiz
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  return creds;
}

/* ----------------------------- Sheets yordamchilari ----------------------------- */
async function ensureTabsAndHeaders() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = new Set((meta.data.sheets || []).map(s => s.properties.title));
  const toAdd = Object.keys(HEADERS).filter(t => !existing.has(t));
  if (toAdd.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: toAdd.map(title => ({ addSheet: { properties: { title } } })) },
    });
  }
  // Sarlavha qatorini yozib qo'yamiz (bor bo'lsa ustiga yozadi — zarari yo'q)
  for (const [tab, header] of Object.entries(HEADERS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }
}

async function readTab(tab) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2:Z`,
  });
  return res.data.values || [];
}

async function append(tab, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

async function loadAll() {
  // --- Reports --- (qo'shib boriladi; o'qishda date+userId bo'yicha eng oxirgisi olinadi)
  const reports = {};
  for (const r of await readTab(TAB_REPORTS)) {
    const [date, userId, name, deptId, submittedAt, answersJson] = r;
    if (!date || !userId) continue;
    let answers = {};
    try { answers = answersJson ? JSON.parse(answersJson) : {}; } catch { answers = {}; }
    if (!reports[date]) reports[date] = {};
    const prev = reports[date][userId];
    const rec = {
      userId: String(userId), name: name || "-", deptId: deptId || "",
      answers, date, submittedAt: submittedAt || "",
    };
    if (!prev || rec.submittedAt >= prev.submittedAt) reports[date][userId] = rec;
  }

  // --- Users --- (eng oxirgi qator yutadi; bo'sh chatId eskisini buzmaydi)
  const users = {};
  for (const u of await readTab(TAB_USERS)) {
    const [userId, name, chatId] = u;
    if (!userId) continue;
    const id = String(userId);
    users[id] = {
      id,
      name: name || users[id]?.name || id,
      chatId: chatId || users[id]?.chatId || undefined,
    };
  }

  // --- UserDept --- (eng oxirgi qator yutadi)
  const userDept = {};
  for (const row of await readTab(TAB_USERDEPT)) {
    const [userId, deptId] = row;
    if (!userId) continue;
    userDept[String(userId)] = deptId || "";
  }

  data = { departments: DEFAULT_DEPTS, reports, users, userDept };
}

/* --------------------------------- Eksport --------------------------------- */
export const db = {
  // Ishga tushishda BIR MARTA chaqiriladi (server.js da await bilan)
  async init() {
    if (!SHEET_ID) throw new Error("SHEET_ID .env da korsatilmagan.");
    const auth = new google.auth.GoogleAuth({
      credentials: loadCredentials(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheets = google.sheets({ version: "v4", auth });
    await ensureTabsAndHeaders();
    await loadAll();
    const total = Object.values(data.reports).reduce((n, day) => n + Object.keys(day).length, 0);
    console.log(`Google Sheets bazaga ulandi. Yuklangan hisobotlar: ${total}`);
  },

  getDepartments() { return data.departments; },
  setDepartments(list) { data.departments = list; return list; }, // faqat xotirada

  touchUser(user, chatId) {
    const id = String(user.id);
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || id;
    const newChat = chatId ?? data.users[id]?.chatId;
    const prev = data.users[id];
    data.users[id] = { id, name, chatId: newChat };
    // Sheetsga FAQAT o'zgargan bo'lsa yozamiz (har requestda emas — limitni tejaymiz)
    const changed = !prev || prev.name !== name || String(prev.chatId || "") !== String(newChat || "");
    if (changed) {
      append(TAB_USERS, [id, name, newChat ? String(newChat) : ""])
        .catch(e => console.error("users append error:", e.message));
    }
  },
  allUsers() { return Object.values(data.users); },
  getUser(userId) { return data.users[String(userId)] || null; },

  setUserDept(userId, deptId) {
    data.userDept[String(userId)] = deptId;
    // Kichik ma'lumot — fonida yozamiz, xato bo'lsa faqat log
    append(TAB_USERDEPT, [String(userId), deptId])
      .catch(e => console.error("userDept append error:", e.message));
  },
  getUserDept(userId) { return data.userDept[String(userId)] || ""; },

  // Hisobot — eng muhim ma'lumot. await bilan chaqiriladi; xato bo'lsa propagate qiladi.
  async saveReport(date, userId, report) {
    if (!data.reports[date]) data.reports[date] = {};
    data.reports[date][String(userId)] = report;
    await append(TAB_REPORTS, [
      date,
      String(userId),
      report.name || "-",
      report.deptId || "",
      report.submittedAt || new Date().toISOString(),
      JSON.stringify(report.answers || {}),
    ]);
    return report;
  },
  getReport(date, userId) { return data.reports[date]?.[String(userId)] || null; },
  getReportsForDate(date) { return Object.values(data.reports[date] || {}); },
};
