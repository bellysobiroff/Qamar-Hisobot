# 🌙 Qamar — Kunlik hisobot Telegram ilovasi

Bo‘lim rahbarlari har kuni hisobot topshiradigan Telegram bot + mini-ilova.
Hisobot bo‘limlari Excel kunlik hisobotiga mos: **Kunlik bajarilgan ishlar**, **Buyurtmalar hisoboti**, **TOP kategoriyalar**, **Kunlik TOP mahsulotlar**, **Qolmagan / kam qolgan mahsulotlar** (va ixtiyoriy **Izoh / muammolar**).
Administrator uchun barcha hisobotlarni ko‘radigan **admin panel** (kim topshirgan/topshirmagan, buyurtmalar soni, qoldiq ogohlantirishlari, kunlik xulosani nusxalash).

---

## Nima kerak
- **Node.js 18+** (kompyuterda yoki hostingda)
- **Telegram bot** (BotFather orqali, 1 daqiqa)
- **Bepul hosting** — Render yoki Railway tavsiya etiladi

---

## 1-qadam — Bot yaratish (BotFather)
1. Telegramda **@BotFather** ni oching → `/newbot` → bot nomi va username bering.
2. Sizga **token** beriladi (masalan `123456:ABC...`) — uni saqlang.

## 2-qadam — O‘z Telegram ID'ingizni bilib oling
- **@userinfobot** ga `/start` yozing → u sizga raqamli **ID** beradi.
- Bu ID admin panelni ochish uchun kerak.

## 3-qadam — Hostingga joylash (Render misolida)
1. Loyihani GitHub'ga yuklang (yoki Render'da "Upload" qiling).
2. [render.com](https://render.com) → **New → Web Service** → loyihani tanlang.
3. Sozlamalar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment** bo‘limiga quyidagilarni qo‘shing (`.env.example` ga qarang):
   - `BOT_TOKEN` = BotFather tokeni
   - `ADMIN_IDS` = sizning ID'ingiz (bir nechta bo‘lsa vergul bilan)
   - `MINI_APP_URL` = Render bergan manzil, masalan `https://qamar-bot.onrender.com`
   - `TZ` = `Asia/Tashkent`
   - `REMINDER_HOUR` = `18` (ixtiyoriy — har kuni soat 18:00 da eslatma)
5. **Deploy** ni bosing. Server ishga tushgach, bot avtomatik ulanadi.

> ⚠️ `MINI_APP_URL` **https** bo‘lishi shart — Telegram faqat https manzilларни ochadi.
> Render/Railway https'ni avtomatik beradi.

## 4-qadam — Sinab ko‘rish
1. Botingizni Telegramda oching → `/start`.
2. **«📋 Hisobot topshirish»** tugmasi yoki pastdagi **menyu tugmasi** orqali ilova ochiladi.
3. Hisobotni to‘ldirib yuboring.
4. Admin (siz) ilovani ochsangiz, pastda **«Admin panel»** tabi paydo bo‘ladi.

---

## Lokal (kompyuterda) sinash
```bash
npm install
cp .env.example .env     # .env ni to‘ldiring (BOT_TOKEN, ADMIN_IDS)
npm start
```
Telegramsiz interfeysni ko‘rish uchun `.env` ga `DEV_BYPASS=1` qo‘shing va
brauzerda `http://localhost:3000` ni oching (faqat dizaynni tekshirish uchun).

---

## Tuzilma
```
qamar-bot/
├─ server.js        — bot + API + initData tekshiruvi + eslatmalar
├─ db.js            — JSON saqlash (kichik jamoaga yetarli)
├─ public/index.html— mini-ilova (interfeys)
├─ data/db.json     — ma'lumotlar (avtomatik yaratiladi)
├─ package.json
└─ .env.example
```

## Tez-tez beriladigan savollar
**Admin paneli ko‘rinmayapti?** `ADMIN_IDS` ga to‘g‘ri ID kiritilganini va ilovani Telegram orqali (brauzerda emas) ochganingizni tekshiring.

**Ma'lumotlar qayerda saqlanadi?** `data/db.json` faylda. Render'da diskni saqlash uchun **Persistent Disk** ulang yoki keyinroq PostgreSQL'ga o‘ting (`db.js` ni almashtirish kifoya).

**Ko‘proq bo‘lim qo‘shish?** Hozir bo‘limlar `db.js` dagi standart ro‘yxatdan olinadi. Admin uchun ilova ichida tahrirlash funksiyasini ham qo‘shsa bo‘ladi — so‘rang, yordam beraman.