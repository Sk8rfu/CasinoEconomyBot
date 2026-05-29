<p align="center">
  <img src="https://github.com/Sk8rfu/CasinoEconomyBot/blob/assets/banner.png?raw=true?raw=true">
</p>

# 🎰 CasinoEconomyBot
Мощен Discord икономически бот с казино игри, PvP дуели, Mystery Box, кредити, банкa, VIP система, магазин, инвентар и още много.
---

Валута - ЛВ

---

## 🚀 Функции

### 💰 Икономика
- /balance — виж баланса си  
- /bank — банкови операции  
- /loan — вземи кредит  
- /payloan — изплати кредит  
- /work — работи за пари  
- /daily — дневна награда  
- /weekly — седмична награда  
- /monthly — месечна награда  
- /give — дай пари на друг играч  

---

### 🛒 Магазин и инвентар
- /shop — виж магазина  
- /buy — купи предмет  
- /sell — продай предмет  
- /inventory — виж инвентара  
- /use — използвай предмет  
- /trade — размени предмети  
- /effects — активни ефекти  

---

### 🎲 Хазартни игри
- /slots • /slots10 • /slots50  
- /blackjack  
- /roulette  
- /poker  
- /coinflip  
- /rps  
- /yahtzee  
- /crash  
- /mines • /minesmulti  
- /open • /cashout  
- /cardflip  
- /plinko  
- /dicebot  
- /baccarat  

---

### ⚔ PvP Дуел
- /duel  
- /duelaccept  
- /dueldeny  
- /diceduel  
- /diceduelaccept  
- /dicedueldeny  

---

### 🕵️ Престъпления
- /crime  
- /rob  

---

### 🎁 Mystery Box
- /mysterybox — отвори кутия с награди  

---

### 🎡 Daily Spin
- /spin — завърти колелото на късмета (24 часа)  

---

### 💰 Jackpot
- /jackpot — виж участниците  
- /jackpotdraw — тегли победител (админ)  

---

### 👑 VIP Команди
- /vip  
- /vipdaily  
- /vipweekly  
- /vipmonthly  

---

### 📊 Статистики
- /profile  
- /leaderboard  
- /rank  
- /ranklist  

---

### 🛠 Админ команди
- /setvip  
- /resetcooldown  
- /setmoney  
- /addmoney  
- /removemoney  
- /addbank  
- /removebank  
- /jackpotdraw  

---

### 🧾 Информация
- /about  

---

## 📦 Инсталация

### 1️⃣ Клонирай проекта
```bash
git clone https://github.com/Sk8rfu/CasinoEconomyBot.git
cd CasinoEconomyBot
```

### 2️⃣ Инсталирай зависимостите
```bash
npm install
```

### 3️⃣ Създай `.env` файл
```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
```

### 4️⃣ Регистрирай Slash командите
```bash
node deploy-commands.js
```

### 5️⃣ Стартирай бота
```bash
node index.js
```

---

## 🗄 База данни

Ботът използва **SQLite**.  
Файлът `economy.db` се създава автоматично при първо стартиране.

**Не качвай economy.db в GitHub.**

Добави в `.gitignore`:

```
*.db
.env
node_modules/
```

---

## 📁 Структура на проекта

```
/commands
    balance.js
    profile.js
    shop.js
    use.js
    loan.js
    payloan.js
    mysterybox.js
    ...
/db.js
/index.js
/package.json
/README.md
```

---

## 🏆 Лиценз
Свободен за използване и модификация.

---

## ❤️ Поддръжка
Ако имаш въпроси или предложения — отвори Issue в GitHub.
