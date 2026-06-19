// forms.js — har bir bolim uchun hisobot maydonlari (yagona manba)

const MUAMMO = {
  id: "muammo", label: "Muammolar / izoh", type: "textarea",
  optional: true, warn: true, rows: 3, ph: "Qanday tosiqlar boldi? (ixtiyoriy)",
};

export const FORMS = {
  hr: [
    { id: "kech",    label: "Nechta hodim kechga qoldi?",            type: "number", required: true, ph: "0" },
    { id: "vaqtida", label: "Nechta hodim oz vaqtida keldi?",        type: "number", required: true, ph: "0" },
    { id: "suhbat",  label: "Nechta vakant bilan suhbat otkazildi?", type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  sotuv: [
    { id: "savdo",       label: "Nechta savdo amalga oshirildi?", type: "number", required: true, ph: "0" },
    { id: "summa",       label: "Umumiy savdo summasi (som)",     type: "number", required: true, ph: "0" },
    { id: "yangi_mijoz", label: "Nechta yangi mijoz?",            type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  ombor: [
    { id: "chiqdi",     label: "Necha xil tovar chiqib ketdi?",     type: "number", required: true, ph: "0" },
    { id: "keldi",      label: "Necha xil tovar keldi?",            type: "number", required: true, ph: "0" },
    { id: "taminotchi", label: "Qancha taminotchi qabul qilindi?",  type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  taminot: [
    { id: "buyurtma", label: "Nechta buyurtma berildi?",           type: "number", required: true, ph: "0" },
    { id: "hamkor",   label: "Nechta taminotchi bilan ishlandi?",  type: "number", required: true, ph: "0" },
    { id: "xarid",    label: "Umumiy xarid summasi (som)",         type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  call_center: [
    { id: "qabul",  label: "Nechta qongiroq qabul qilindi?",    type: "number", required: true, ph: "0" },
    { id: "amalga", label: "Nechta qongiroq amalga oshirildi?", type: "number", required: true, ph: "0" },
    { id: "hal",    label: "Nechta murojaat hal qilindi?",       type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  marketing: [
    { id: "kampaniya", label: "Nechta reklama/kampaniya berildi?", type: "number", required: true, ph: "0" },
    { id: "lead",      label: "Yangi leadlar soni",                type: "number", required: true, ph: "0" },
    { id: "xarajat",   label: "Reklama xarajati (som)",            type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  b2b: [
    { id: "muzokara",  label: "Nechta korxona bilan muzokara?", type: "number", required: true, ph: "0" },
    { id: "shartnoma", label: "Nechta shartnoma imzolandi?",    type: "number", required: true, ph: "0" },
    { id: "summa",     label: "Umumiy summa (som)",             type: "number", required: true, ph: "0" },
    MUAMMO,
  ],
  _default: [
    { id: "done",   label: "Bajarilgan ishlar", type: "textarea", required: true, rows: 4, ph: "Bugun nimalar bajarildi?" },
    MUAMMO,
  ],
};

export function fieldsFor(deptId) {
  return FORMS[deptId] ?? FORMS._default ?? [];
}
