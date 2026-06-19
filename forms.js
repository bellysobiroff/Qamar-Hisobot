// forms.js — har bir bolim uchun hisobot maydonlari (yagona manba)
//
// Maydon turlari:
//   "number"   — son (raqam)
//   "text"     — qisqa matn
//   "textarea" — uzun matn / yozuv
//   "select"   — ochiladigan royxat (options bilan)
// Qoshimcha: required (majburiy), optional ("(ixtiyoriy)" yozuvi),
//            warn (toldirilsa admin panelda ogohlantirish), ph ( korsatma), rows.

const MUAMMO = {
  id: "muammo", label: "Muammo va takliflar", type: "textarea",
  optional: true, warn: true, rows: 3, ph: "Yozing... (ixtiyoriy)",
};

export const FORMS = {
  // 1) HR
  hr: [
    { id: "ishchi_soni", label: "Hozirda nechta hodim ishlayapti?", type: "number",   required: true, ph: "0" },
    { id: "kechikkan",   label: "Kechga qolgan hodimlar (ism-familiya)", type: "textarea", required: true, rows: 3, ph: "Masalan: Ali Valiyev, Soliha Karimova" },
    { id: "vakansiya",   label: "Hozirda mavjud vakansiyalar", type: "textarea", required: true, rows: 3, ph: "Bo'sh ish o'rinlarini yozing" },
  ],

  // 2) Sotuv bolimi
  sotuv: [
    { id: "dokon",  label: "Do'kon", type: "select", required: true, options: ["Chorsu", "Seul", "Tabobat"] },
    { id: "summa",  label: "Sotuv summasi (so'm)", type: "number", required: true, ph: "0" },
    { id: "kirish", label: "Kirishlar soni", type: "number", required: true, ph: "0" },
    { id: "chek",   label: "O'rtacha chek (so'm)", type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 3) Ombor
  ombor: [
    { id: "taminotchi",  label: "Qabul qilingan ta'minotchilar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "chiqdi_summa",label: "Chiqib ketgan tovarlar summasi (so'm)", type: "number", required: true, ph: "0" },
    { id: "qolmagan",    label: "Qolmagan tovarlar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "ortiqcha",    label: "Ortiqcha zaxira", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "brak",        label: "Brak tovarlar (soni)", type: "number", required: true, ph: "0" },
    { id: "qaytgan",     label: "Qaytarilgan tovarlar (soni)", type: "number", required: true, ph: "0" },
    { id: "hodim_keldi", label: "Qancha hodim ishga keldi?", type: "number", required: true, ph: "0" },
  ],

  // 4) Ta'minot bolimi
  taminot: [
    { id: "rejalar",     label: "Bugungi rejalar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "buyurtma",    label: "Buyurtmalar (soni)", type: "number", required: true, ph: "0" },
    { id: "top_kat",     label: "TOP kategoriya (nomi va soni)", type: "textarea", required: true, rows: 2, ph: "Masalan: Ichimliklar — 120" },
    { id: "top20",       label: "Kunlik TOP-20", type: "textarea", required: true, rows: 4, ph: "Yozing" },
    { id: "qolmagan_sku",label: "Qolmagan SKU lar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "nelikvid",    label: "Kunlik nelikvidlar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
  ],

  // 5) Call center (oldingicha qoldirildi — kerak bo'lsa o'zgartiramiz)
  call_center: [
    { id: "qabul",  label: "Nechta qo'ng'iroq qabul qilindi?", type: "number", required: true, ph: "0" },
    { id: "amalga", label: "Nechta qo'ng'iroq amalga oshirildi?", type: "number", required: true, ph: "0" },
    { id: "hal",    label: "Nechta murojaat hal qilindi?", type: "number", required: true, ph: "0" },
    MUAMMO,
  ],

  // 6) Marketing
  marketing: [
    { id: "rejalar",   label: "Bugungi rejalar", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "reklama",   label: "Nechta reklama/kampaniya berildi?", type: "number", required: true, ph: "0" },
    { id: "instagram", label: "Instagram statistikasi", type: "textarea", required: true, rows: 3, ph: "Yozing" },
    { id: "telegram",  label: "Telegram statistikasi", type: "textarea", required: true, rows: 3, ph: "Yozing" },
  ],

  // 7) B2B
  b2b: [
    { id: "sotuv",   label: "Sotuv summasi", type: "textarea", required: true, rows: 2, ph: "Yozuv va raqam" },
    { id: "naqd",    label: "Naqdga sotilgan", type: "textarea", required: true, rows: 2, ph: "Yozuv va raqam" },
    { id: "qarz",    label: "Yig'ilgan qarzlar", type: "textarea", required: true, rows: 2, ph: "Yozuv va raqam" },
    { id: "qongiroq",label: "Qo'ng'iroq qilingan mijozlar", type: "textarea", required: true, rows: 2, ph: "Yozuv va raqam" },
  ],

  _default: [
    { id: "done",   label: "Bajarilgan ishlar", type: "textarea", required: true, rows: 4, ph: "Bugun nimalar bajarildi?" },
    MUAMMO,
  ],
};

export function fieldsFor(deptId) {
  return FORMS[deptId] ?? FORMS._default ?? [];
}
