// forms.js — HAR BIR BO'LIM uchun hisobot maydonlari (yagona manba).
// =====================================================================
// Bu yagona joyni tahrirlash kifoya: bo'limga maydon qo'shing, oching yoki o'chiring.
// Har bir maydon obyekti:
//   id        — ichki nom (faqat lotin harf/raqam, takrorlanmasin)
//   label     — ekranda ko'rinadigan sarlavha
//   required  — true bo'lsa, majburiy (bo'sh qoldirib bo'lmaydi)
//   rows      — textarea balandligi (ixtiyoriy, default 3)
//   ph        — placeholder, ya'ni yo'l-yo'riq matni (ixtiyoriy)
//   warn      — true bo'lsa, admin panelda qizil "ogohlantirish" sifatida ko'rinadi
//   optional  — true bo'lsa, sarlavhaga "(ixtiyoriy)" yozuvi qo'shiladi
// Bo'lim id'lari db.js dagi DEFAULT_DEPTS bilan bir xil bo'lishi kerak
// (savdo, marketing, moliya, ombor, hr, taminot, ishlab, logistika).
// Ro'yxatda yo'q bo'lim uchun "_default" maydonlari ishlatiladi.
// =====================================================================

export const FORMS = {
  // ----------------------------- TA'MINOT (Excel kunlik hisobotiga mos) ----
  taminot: [
    { id: "tasks",    label: "Kunlik bajarilgan ishlar", required: true, rows: 4,
      ph: "Bajarilgan vazifalar va holati. Masalan:\n• Kunlik sotuv analizlari — bajarildi\n• Haftalik buyurtmalar — jarayonda" },
    { id: "orders",   label: "Buyurtmalar hisoboti", rows: 3,
      ph: "Ta'minotchi · summa · holati (Keldi / yo'lda). Masalan:\n• Akademnashr — 4 320 000 — keldi" },
    { id: "topCat",   label: "TOP kategoriyalar", rows: 3,
      ph: "Eng ko'p sotilgan kategoriyalar va savdo soni" },
    { id: "top20",    label: "Kunlik TOP mahsulotlar", rows: 3,
      ph: "Kunlik TOP mahsulotlar (do'kon bo'yicha bo'lsa, ko'rsating)" },
    { id: "outStock", label: "Qolmagan / kam qolgan mahsulotlar", rows: 3, warn: true,
      ph: "Tugagan yoki kam qolgan mahsulotlar, qoldiq va qaror" },
    { id: "note",     label: "Izoh / muammolar", rows: 2, optional: true,
      ph: "Qo'shimcha izoh yoki to'siqlar" },
  ],

  // ----------------------------- SAVDO -------------------------------------
  savdo: [
    { id: "tasks",    label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugun nimalar qilindi?" },
    { id: "sales",    label: "Kunlik savdo (summa)", rows: 2,
      ph: "Masalan: 12 500 000 so'm" },
    { id: "clients",  label: "Mijozlar / uchrashuvlar", rows: 3,
      ph: "Yangi mijozlar, uchrashuvlar, kelishuvlar" },
    { id: "issues",   label: "Muammolar / to'siqlar", rows: 3, warn: true,
      ph: "Qanday to'siqlar bo'ldi? (ixtiyoriy)" },
    { id: "tomorrow", label: "Ertangi reja", rows: 3, optional: true,
      ph: "Ertaga nimalar rejalashtirilgan?" },
  ],

  // ----------------------------- MARKETING ---------------------------------
  marketing: [
    { id: "tasks",     label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi marketing faoliyati" },
    { id: "campaigns", label: "Faol kampaniyalar", rows: 3,
      ph: "Reklama kampaniyalari, byudjet, kanallar" },
    { id: "content",   label: "Kontent / e'lonlar", rows: 3,
      ph: "Tayyorlangan post, video, e'lonlar" },
    { id: "results",   label: "Natijalar (qamrov / lidlar)", rows: 3,
      ph: "Qamrov, bosishlar, lidlar, konversiya" },
    { id: "issues",    label: "Muammolar", rows: 2, warn: true, optional: true,
      ph: "To'siqlar (ixtiyoriy)" },
  ],

  // ----------------------------- MOLIYA ------------------------------------
  moliya: [
    { id: "tasks",   label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi moliyaviy ishlar" },
    { id: "inout",   label: "Kirim / chiqim", rows: 3,
      ph: "Kunlik kirim va chiqim summalari" },
    { id: "debts",   label: "To'lovlar / qarzdorliklar", rows: 3, warn: true,
      ph: "Kutilayotgan to'lovlar, debitor/kreditor qarzlar" },
    { id: "note",    label: "Izoh", rows: 2, optional: true,
      ph: "Qo'shimcha izoh (ixtiyoriy)" },
  ],

  // ----------------------------- OMBOR -------------------------------------
  ombor: [
    { id: "tasks",    label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi ombor ishlari" },
    { id: "incoming", label: "Qabul qilingan tovar", rows: 3,
      ph: "Bugun kelgan mahsulotlar va miqdori" },
    { id: "outgoing", label: "Jo'natilgan tovar", rows: 3,
      ph: "Bugun chiqarilgan/jo'natilgan tovarlar" },
    { id: "stock",    label: "Qoldiq / kam qolgan", rows: 3, warn: true,
      ph: "Kam qolgan yoki tugagan pozitsiyalar" },
  ],

  // ----------------------------- HR ----------------------------------------
  hr: [
    { id: "tasks",     label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi HR ishlari" },
    { id: "hiring",    label: "Ishga olish / suhbatlar", rows: 3,
      ph: "Suhbatlar, yangi xodimlar, ochiq vakansiyalar" },
    { id: "attend",    label: "Davomat / intizom", rows: 3, warn: true,
      ph: "Kechikishlar, kelmaganlar, intizom masalalari" },
    { id: "tomorrow",  label: "Ertangi reja", rows: 2, optional: true,
      ph: "Ertaga nimalar rejalashtirilgan?" },
  ],

  // ----------------------------- ISHLAB CHIQARISH --------------------------
  ishlab: [
    { id: "tasks",    label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi ishlab chiqarish faoliyati" },
    { id: "output",   label: "Ishlab chiqarilgan hajm (reja / fakt)", rows: 3,
      ph: "Masalan: Reja 1000 / Fakt 940 dona" },
    { id: "quality",  label: "Sifat / brak", rows: 3, warn: true,
      ph: "Brak miqdori, sifat muammolari" },
    { id: "tomorrow", label: "Ertangi reja", rows: 2, optional: true,
      ph: "Ertaga nimalar rejalashtirilgan?" },
  ],

  // ----------------------------- LOGISTIKA ---------------------------------
  logistika: [
    { id: "tasks",     label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugungi logistika faoliyati" },
    { id: "deliveries",label: "Yetkazib berishlar", rows: 3,
      ph: "Yetkazilgan buyurtmalar, marshrutlar soni" },
    { id: "transport", label: "Transport / xarajat", rows: 3,
      ph: "Foydalanilgan transport, yoqilg'i, xarajatlar" },
    { id: "issues",    label: "Muammolar / kechikishlar", rows: 3, warn: true,
      ph: "Kechikishlar, nosozliklar (ixtiyoriy)" },
  ],

  // ----------------------------- STANDART (boshqa bo'limlar uchun) ---------
  _default: [
    { id: "tasks",    label: "Bajarilgan ishlar", required: true, rows: 4,
      ph: "Bugun nimalar bajarildi?" },
    { id: "issues",   label: "Muammolar / to'siqlar", rows: 3, warn: true, optional: true,
      ph: "Qanday to'siqlar bo'ldi? (ixtiyoriy)" },
    { id: "tomorrow", label: "Ertangi reja", rows: 3, optional: true,
      ph: "Ertaga nimalar rejalashtirilgan?" },
  ],
};

// Bo'lim uchun maydonlar ro'yxatini qaytaradi (topilmasa — standart).
export function fieldsFor(deptId) {
  return FORMS[deptId] || FORMS._default;
}
