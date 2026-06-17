// db.js — oddiy JSON fayl asosidagi saqlash (kichik jamoalar uchun yetarli).
// Keyinchalik PostgreSQL/SQLite'ga oson o'tkazsa bo'ladi.
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from "fs";
import { dirname } from "path";

const FILE = process.env.DB_FILE || "./data/db.json";

const DEFAULT_DEPTS = [
  { id: "savdo", name: "Savdo bo‘limi" },
  { id: "marketing", name: "Marketing" },
  { id: "moliya", name: "Moliya" },
  { id: "ombor", name: "Ombor" },
  { id: "hr", name: "HR" },
  { id: "taminot", name: "Ta‘minot" },
  { id: "ishlab", name: "Ishlab chiqarish" },
  { id: "logistika", name: "Logistika" },
];

let data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {} };

function load() {
  if (existsSync(FILE)) {
    try { data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {}, ...JSON.parse(readFileSync(FILE, "utf8")) }; }
    catch (e) { console.error("db load error:", e.message); }
  } else { save(); }
}
function save() {
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    const tmp = FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify(data, null, 2));
    renameSync(tmp, FILE);
  } catch (e) { console.error("db save error:", e.message); }
}
load();

export const db = {
  getDepartments() { return data.departments; },
  setDepartments(list) { data.departments = list; save(); return list; },

  touchUser(user, chatId) {
    const id = String(user.id);
    data.users[id] = {
      id,
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || id,
      chatId: chatId ?? data.users[id]?.chatId,
    };
    save();
  },
  allUsers() { return Object.values(data.users); },

  setUserDept(userId, deptId) { data.userDept[String(userId)] = deptId; save(); },
  getUserDept(userId) { return data.userDept[String(userId)] || ""; },

  saveReport(date, userId, report) {
    if (!data.reports[date]) data.reports[date] = {};
    data.reports[date][String(userId)] = report;
    save();
    return report;
  },
  getReport(date, userId) { return data.reports[date]?.[String(userId)] || null; },
  getReportsForDate(date) { return Object.values(data.reports[date] || {}); },
};
