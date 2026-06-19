// forms.js — har bir bo'lim uchun hisobot maydonlari (yagona manba)
// server.js buni shunday import qiladi:  import { fieldsFor, FORMS } from "./forms.js";
//
// Maydon turlari:
//   "number"   — butun son (>= 0)
//   "text"     — qisqa matn
//   "textarea" — uzun matn / izoh
//
// Yangi maydon qo'shish yoki o'zgartirish uchun shu yerni tahrirlang —
// interfeys (index.html) ham shu tuzilmaga moslashadi.

export const FORMS = {
  hr: {
    title: "HR bo‘limi",
    color: "#5b6ee1",
    fields: [
      { key: "late",        label: "Nechta hodim kechga qoldi?",            type: "number" },
      { key: "on_time",     label: "Nechta hodim o‘z vaqtida keldi?",        type: "number" },
      { key: "interviews",  label: "Nechta vakant bilan suhbat o‘tkazildi?", type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                       type: "textarea", optional: true },
    ],
  },

  sotuv: {
    title: "Sotuv bo‘limi",
    color: "#2fa861",
    fields: [
      { key: "deals",       label: "Nechta savdo amalga oshirildi?",  type: "number" },
      { key: "amount",      label: "Umumiy savdo summasi (so‘m)",     type: "number" },
      { key: "new_clients", label: "Nechta yangi mijoz?",             type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                type: "textarea", optional: true },
    ],
  },

  ombor: {
    title: "Ombor bo‘limi",
    color: "#d98a1f",
    fields: [
      { key: "out",         label: "Necha xil tovar chiqib ketdi?",     type: "number" },
      { key: "in",          label: "Necha xil tovar keldi?",            type: "number" },
      { key: "suppliers",   label: "Qancha ta’minotchi qabul qilindi?", type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                  type: "textarea", optional: true },
    ],
  },

  taminot: {
    title: "Ta’minot bo‘limi",
    color: "#1fa6a6",
    fields: [
      { key: "orders",      label: "Nechta buyurtma berildi?",          type: "number" },
      { key: "suppliers",   label: "Nechta ta’minotchi bilan ishlandi?", type: "number" },
      { key: "amount",      label: "Umumiy xarid summasi (so‘m)",        type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                   type: "textarea", optional: true },
    ],
  },

  call_center: {
    title: "Call center",
    color: "#8a5be1",
    fields: [
      { key: "incoming",    label: "Nechta qo‘ng‘iroq qabul qilindi?",  type: "number" },
      { key: "outgoing",    label: "Nechta qo‘ng‘iroq amalga oshirildi?", type: "number" },
      { key: "resolved",    label: "Nechta murojaat hal qilindi?",       type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                   type: "textarea", optional: true },
    ],
  },

  marketing: {
    title: "Marketing bo‘limi",
    color: "#e15b8a",
    fields: [
      { key: "campaigns",   label: "Nechta reklama/kampaniya berildi?", type: "number" },
      { key: "leads",       label: "Yangi leadlar soni",                type: "number" },
      { key: "spend",       label: "Reklama xarajati (so‘m)",           type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                  type: "textarea", optional: true },
    ],
  },

  b2b: {
    title: "B2B bo‘limi",
    color: "#3b82d9",
    fields: [
      { key: "meetings",    label: "Nechta korxona bilan muzokara?",  type: "number" },
      { key: "contracts",   label: "Nechta shartnoma imzolandi?",     type: "number" },
      { key: "amount",      label: "Umumiy summa (so‘m)",             type: "number" },
      { key: "note",        label: "Izoh (ixtiyoriy)",                type: "textarea", optional: true },
    ],
  },
};

// Bo'lim bo'yicha maydonlar ro'yxatini qaytaradi
export function fieldsFor(dept) {
  return FORMS[dept]?.fields ?? [];
}

// Bo'lim mavjudligini tekshirish uchun yordamchi
export function isValidDept(dept) {
  return Object.prototype.hasOwnProperty.call(FORMS, dept);
}
