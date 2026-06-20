// db.js — Google Sheets asosidagi saqlash (googleapis'siz, yengil fetch usuli)
// Render Free muhitida googleapis ning HTTP qatlami token serveriga ulanolmagani uchun
// (oauth2 token: Premature close), bu yerda autentifikatsiya va Sheets so'rovlari
// to'g'ridan-to'g'ri Node ning ichki fetch'i orqali qilinadi. Qo'shimcha paket shart emas.
//
// Ishlash printsipi: ishga tushganda hammasi Sheetsdan xotiraga yuklanadi (init).
// O'qishlar xotiradan (tez). Yozuvlar esa xotira + Sheetsga qo'shib boriladi.

import crypto from "crypto";

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

const TAB_REPORTS  = "Reports";
const TAB_USERS    = "Users";
const TAB_USERDEPT = "UserDept";
const HEADERS = {
  [TAB_REPORTS]:  ["date", "userId", "name", "deptId", "submittedAt", "answers"],
  [TAB_USERS]:    ["userId", "name", "chatId"],
  [TAB_USERDEPT]: ["userId", "deptId"],
};

let data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {} };

// Token keshi
let accessToken = null;
let tokenExpiresAt = 0;
let credentials = null;

/* ----------------------- Kirish ma'lumotlari (credentials) ----------------------- */
function loadCredentials() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  let json;
  if (b64) json = Buffer.from(b64, "base64").toString("utf8");
  else if (raw) json = raw;
  else throw new Error("GOOGLE_SERVICE_ACCOUNT_B64 (yoki GOOGLE_SERVICE_ACCOUNT) .env da korsatilmagan.");
  let creds;
  try {
    creds = JSON.parse(json);
  } catch (e) {
    throw new Error("Credentials JSON oqilmadi (base64 buzuq bolishi mumkin): " + e.message);
  }
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  if (!creds.client_email || !creds.private_key) {
    throw new Error("Credentials da client_email yoki private_key yo'q.");
  }
  return creds;
}

/* ---------------------- OAuth2 token (o'zimiz, JWT imzo bilan) ---------------------- */
function base64url(input) {
  return Buffer.from(input).toString("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  // 60 soniya zaxira bilan keshdan beramiz
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(credentials.private_key)
    .toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const assertion = `${unsigned}.${signature}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Token olishda xato (${res.status}): ${t.slice(0, 300)}`);
  }
  const j = await res.json();
  accessToken = j.access_token;
  tokenExpiresAt = Date.now() + (j.expires_in || 3600) * 1000;
  return accessToken;
}

/* ----------------------------- Sheets API (fetch) ----------------------------- */
const API = "https://sheets.googleapis.com/v4/spreadsheets";

async function sheetsFetch(path, { method = "GET", query = {}, body = null } = {}) {
  const token = await getAccessToken();
  const qs = new URLSearchParams(query).toString();
  const url = `${API}/${SHEET_ID}${path}${qs ? "?" + qs : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Sheets API xato (${method} ${path}, ${res.status}): ${t.slice(0, 300)}`);
  }
  return res.json();
}

async function getMeta() {
  return sheetsFetch("", { query: { fields: "sheets.properties.title" } });
}
async function addTabs(titles) {
  return sheetsFetch(":batchUpdate", {
    method: "POST",
    body: { requests: titles.map(title => ({ addSheet: { properties: { title } } })) },
  });
}
async function writeRange(range, values) {
  return sheetsFetch(`/values/${encodeURIComponent(range)}`, {
    method: "PUT",
    query: { valueInputOption: "RAW" },
    body: { values },
  });
}
async function appendRange(tab, values) {
  return sheetsFetch(`/values/${encodeURIComponent(tab + "!A1")}:append`, {
    method: "POST",
    query: { valueInputOption: "RAW", insertDataOption: "INSERT_ROWS" },
    body: { values },
  });
}
async function readRange(range) {
  const j = await sheetsFetch(`/values/${encodeURIComponent(range)}`);
  return j.values || [];
}

/* --------------------------------- Yordamchilar --------------------------------- */
async function ensureTabsAndHeaders() {
  const meta = await getMeta();
  const existing = new Set((meta.sheets || []).map(s => s.properties.title));
  const toAdd = Object.keys(HEADERS).filter(t => !existing.has(t));
  if (toAdd.length) await addTabs(toAdd);
  for (const [tab, header] of Object.entries(HEADERS)) {
    await writeRange(`${tab}!A1`, [header]);
  }
}

async function loadAll() {
  // --- Reports ---
  const reports = {};
  for (const r of await readRange(`${TAB_REPORTS}!A2:Z`)) {
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

  // --- Users ---
  const users = {};
  for (const u of await readRange(`${TAB_USERS}!A2:Z`)) {
    const [userId, name, chatId] = u;
    if (!userId) continue;
    const id = String(userId);
    users[id] = {
      id,
      name: name || users[id]?.name || id,
      chatId: chatId || users[id]?.chatId || undefined,
    };
  }

  // --- UserDept ---
  const userDept = {};
  for (const row of await readRange(`${TAB_USERDEPT}!A2:Z`)) {
    const [userId, deptId] = row;
    if (!userId) continue;
    userDept[String(userId)] = deptId || "";
  }

  data = { departments: DEFAULT_DEPTS, reports, users, userDept };
}

/* --------------------------------- Eksport --------------------------------- */
export const db = {
  async init() {
    if (!SHEET_ID) throw new Error("SHEET_ID .env da korsatilmagan.");
    credentials = loadCredentials();
    console.log("[diag] client_email:", credentials.client_email);
    await getAccessToken();          // tokenni shu yerda olib, xatoni aniq ushlaymiz
    console.log("[diag] OAuth token olindi — auth OK");
    await ensureTabsAndHeaders();
    await loadAll();
    const total = Object.values(data.reports).reduce((n, day) => n + Object.keys(day).length, 0);
    console.log(`Google Sheets bazaga ulandi. Yuklangan hisobotlar: ${total}`);
  },

  getDepartments() { return data.departments; },
  setDepartments(list) { data.departments = list; return list; },

  touchUser(user, chatId) {
    const id = String(user.id);
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || id;
    const newChat = chatId ?? data.users[id]?.chatId;
    const prev = data.users[id];
    data.users[id] = { id, name, chatId: newChat };
    const changed = !prev || prev.name !== name || String(prev.chatId || "") !== String(newChat || "");
    if (changed) {
      appendRange(TAB_USERS, [[id, name, newChat ? String(newChat) : ""]])
        .catch(e => console.error("users append error:", e.message));
    }
  },
  allUsers() { return Object.values(data.users); },
  getUser(userId) { return data.users[String(userId)] || null; },

  setUserDept(userId, deptId) {
    data.userDept[String(userId)] = deptId;
    appendRange(TAB_USERDEPT, [[String(userId), deptId]])
      .catch(e => console.error("userDept append error:", e.message));
  },
  getUserDept(userId) { return data.userDept[String(userId)] || ""; },

  async saveReport(date, userId, report) {
    if (!data.reports[date]) data.reports[date] = {};
    data.reports[date][String(userId)] = report;
    await appendRange(TAB_REPORTS, [[
      date,
      String(userId),
      report.name || "-",
      report.deptId || "",
      report.submittedAt || new Date().toISOString(),
      JSON.stringify(report.answers || {}),
    ]]);
    return report;
  },
  getReport(date, userId) { return data.reports[date]?.[String(userId)] || null; },
  getReportsForDate(date) { return Object.values(data.reports[date] || {}); },
};
