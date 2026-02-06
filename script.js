const tg = window.Telegram.WebApp;

// Инициализация
tg.expand();
tg.MainButton.hide();

// Цвета темы Телеграма
document.documentElement.style.setProperty('--bg-color', tg.themeParams.bg_color || '#0f172a');
document.documentElement.style.setProperty('--text', tg.themeParams.text_color || '#ffffff');

// Приветствие пользователя
const user = tg.initDataUnsafe.user;
if (user) {
    document.getElementById('username').innerText = user.first_name;
}

// === ЛОГИКА ТАСБИХА ===
let count = localStorage.getItem('tasbihCount') || 0;
const countDisplay = document.getElementById('tasbih-count');
const tasbihBtn = document.getElementById('tasbih-btn');

countDisplay.innerText = count;

tasbihBtn.addEventListener('click', () => {
    count++;
    countDisplay.innerText = count;
    localStorage.setItem('tasbihCount', count);
    
    // Вибрация (Haptic Feedback) - делает приложение "тактильным"
    tg.HapticFeedback.impactOccurred('medium');
    
    // Анимация
    tasbihBtn.style.transform = 'scale(0.95)';
    setTimeout(() => tasbihBtn.style.transform = 'scale(1)', 100);
});

document.getElementById('reset-tasbih').addEventListener('click', () => {
    if(confirm('Сбросить счетчик?')) {
        count = 0;
        countDisplay.innerText = count;
        localStorage.setItem('tasbihCount', 0);
        tg.HapticFeedback.notificationOccurred('success');
    }
});

// === ВРЕМЯ НАМАЗА (API) ===
// Для простоты используем координаты Москвы по умолчанию, 
// в реальном проекте можно запрашивать геопозицию.
const lat = 55.7558;
const long = 37.6173;

async function getPrayerTimes() {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${long}&method=3`);
        const data = await response.json();
        const timings = data.data.timings;

        // Обновляем UI
        document.getElementById('fajr-time').innerText = timings.Fajr;
        document.getElementById('dhuhr-time').innerText = timings.Dhuhr;
        document.getElementById('asr-time').innerText = timings.Asr;
        document.getElementById('maghrib-time').innerText = timings.Maghrib;
        document.getElementById('isha-time').innerText = timings.Isha;

        determineNextPrayer(timings);
    } catch (error) {
        console.error("Ошибка загрузки времени намаза", error);
        document.getElementById('next-prayer').innerText = "Ошибка сети";
    }
}

function determineNextPrayer(timings) {
    // Упрощенная логика для примера. 
    // В реальном приложении нужно парсить время в объекты Date.
    const now = new Date();
    const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    
    // Простая заглушка для определения следующего намаза
    // Для полноценной работы нужно сравнивать timestamp'ы
    document.getElementById('next-prayer').innerText = "Зухр"; 
    
    // Запускаем таймер (фейковый для визуала)
    startCountdown();
}

function startCountdown() {
    // Просто красивый таймер обратного отсчета для демо
    let duration = 3600 * 2; // 2 часа
    const el = document.getElementById('countdown');
    
    setInterval(() => {
        duration--;
        let h = Math.floor(duration / 3600);
        let m = Math.floor((duration % 3600) / 60);
        let s = duration % 60;
        el.innerText = `-${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
}

// === КНОПКА ПОДЕЛИТЬСЯ ===
document.getElementById('share-btn').addEventListener('click', () => {
    tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/YOUR_BOT_NAME&text=Я читаю зикр в приложении Noor. Присоединяйся!`);
});

// Запуск
getPrayerTimes();
