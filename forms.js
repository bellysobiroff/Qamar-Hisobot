// db.js — oddiy JSON fayl asosidagi saqlash (kichik jamoalar uchun yetarli).
// Keyinchalik PostgreSQL/SQLite'ga oson o'tkazsa bo'ladi.
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from "fs";
import { dirname } from "path";

const FILE = process.env.DB_FILE || "./data/db.json";

// MUHIM: bu id'lar forms.js dagi FORMS kalitlari bilan AYNAN bir xil bo'lishi shart.
const DEFAULT_DEPTS = [
  { id: "hr",          name: "HR" },
  { id: "sotuv",       name: "Sotuv bo'limi" },
  { id: "ombor",       name: "Ombor" },
  { id: "taminot",     name: "Ta'minot" },
  { id: "call_center", name: "Call center" },
  { id: "marketing",   name: "Marketing" },
  { id: "b2b",         name: "B2B" },
];

let data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {} };

function load() {
  if (existsSync(FILE)) {
    try { data = { departments: DEFAULT_DEPTS, reports: {}, users: {}, userDept: {}, ...JSON.parse(readFileSync(FILE, "utf8")) }; }
    catch (e) { console.error("db load error:", e.message); }
  } else { save(); }
  // Bo'limlar ro'yxatini har doim koddan olamiz (eski db.json ni e'tiborsiz qoldiramiz),
  // shunda forms.js bilan har doim mos bo'ladi. O'zgartirmoqchi bo'lsangiz —
  // yuqoridagi DEFAULT_DEPTS ni va forms.js dagi kalitlarni birga tahrirlang.
  data.departments = DEFAULT_DEPTS;
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
