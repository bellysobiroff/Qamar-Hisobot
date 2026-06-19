// forms.js — har bir bo'lim uchun hisobot maydonlari (yagona manba)
// server.js shunday import qiladi:  import { fieldsFor, FORMS } from "./forms.js";
//
// MUHIM: FORMS — har bir bo'lim id'siga maydonlar RO'YXATINI (array) bog'laydi.
// Bo'lim id'lari db.js dagi id'lar bilan AYNAN bir xil bo'lishi shart!
//
// Maydon xossalari:
//   id        — noyob kalit (shu bo'lim ichida takrorlanmasin)
//   label     — ekranda ko'rinadigan savol
//   type      — "number" (son), "text" (qisqa matn), "textarea" (uzun matn)
//   required  — true bo'lsa bo'sh qoldirib bo'lmaydi
//   optional  — true bo'lsa ekranda "(ixtiyoriy)" deb ko'rsatiladi
//   ph        — placeholder (ko'rsatma matni)
//   rows      — textarea balandligi
//   warn      — true: to'ldirilsa, admin panelida "ogohlantirish" sifatida belgilanadi

// Har bo'limga qo'shiladigan umumiy "muammo/izoh" maydoni
const MUAMMO = {
  id: "muammo", label: "Muammolar / izoh", type: "textarea",
  optional: true, warn: true, rows: 3, ph: "Qanday to'siqlar bo'ldi? (ixtiyoriy)",
};

export const FORMS = {
  // 1) HR
  hr: [
    { id: "kech",    label: "Nechta hodim kechga qoldi?",            type: "number", required: true, ph: "0" },
    { id: "vaqtida", label: "Nechta hodim o'z vaqtida keldi?",        type: "number", required: true, ph: "0" },
    { id: "suhbat",  label: "Nechta vakant bilan suhbat o'tkazildi?", type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 2) Sotuv bo'limi
  sotuv: [
    { id: "savdo",       label: "Nechta savdo amalga oshirildi?", type: "number", required: true, ph: "0" },
    { id: "summa",       label: "Umumiy savdo summasi (so'm)",    type: "number", required: true, ph: "0" },
    { id: "yangi_mijoz", label: "Nechta yangi mijoz?",            type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 3) Ombor
  ombor: [
    { id: "chiqdi",     label: "Necha xil tovar chiqib ketdi?",     type: "number", required: true, ph: "0" },
    { id: "keldi",      label: "Necha xil tovar keldi?",            type: "number", required: true, ph: "0" },
    { id: "taminotchi", label: "Qancha ta'minotchi qabul qilindi?", type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 4) Ta'minot
  taminot: [
    { id: "buyurtma", label: "Nechta buyurtma berildi?",           type: "number", required: true, ph: "0" },
    { id: "hamkor",   label: "Nechta ta'minotchi bilan ishlandi?", type: "number", required: true, ph: "0" },
    { id: "xarid",    label: "Umumiy xarid summasi (so'm)",        type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 5) Call center
  call_center: [
    { id: "qabul",  label: "Nechta qo'ng'iroq qabul qilindi?",    type: "number", required: true, ph: "0" },
    { id: "amalga", label: "Nechta qo'ng'iroq amalga oshirildi?", type: "number", required: true, ph: "0" },
    { id: "hal",    label: "Nechta murojaat hal qilindi?",        type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 6) Marketing
  marketing: [
    { id: "kampaniya", label: "Nechta reklama/kampaniya berildi?", type: "number", required: true, ph: "0" },
    { id: "lead",      label: "Yangi leadlar soni",                type: "number", required: true, ph: "0" },
    { id: "xarajat",   label: "Reklama xarajati (so'm)",           type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 7) B2B
  b2b: [
    { id: "muzokara",  label: "Nechta korxona bilan muzokara?", type: "number", required: true, ph: "0" },
    { id: "shartnoma", label: "Nechta shartnoma imzolandi?",    type: "number", required: true, ph: "0" },
    { id: "summa",     label: "Umumiy summa (so'm)",            type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // Noma'lum bo'lim uchun zaxira (odatda ishlatilmaydi)
  _default: [
    { id: "done",   label: "Bajarilgan ishlar", type: "textarea", required: true, rows: 4, ph: "Bugun nimalar bajarildi?" },
    MUAMMO,
  ],
};

// Bo'lim id'si bo'yicha maydonlar ro'yxati (server ham, frontend ham shuni kutadi)
export function fieldsFor(deptId) {
  return FORMS[deptId] ?? FORMS._default ?? [];
}
