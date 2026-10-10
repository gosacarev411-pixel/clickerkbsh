// --- ГЕЙМДИЗАЙН: 1 год на 6 уровней ---
// Чтобы пройти игру за год, игрок должен заходить в игру ~3 раза в день на 5 минут.
// Базовый клик дает мало. Основной доход идет от пассивного дохода (авто-начисление).
// 60 дней на уровень * 24 часа * 60 минут * (1 клик в секунду для активности) = много кликов.
// Мы сбалансируем это стоимостью апгрейдов.

const state = {
    name: 'Бомж',
    money: 0,
    level: 1,
    clickPower: 1,
    incomePerSec: 0,
    upgrades: [
        { id: 1, name: 'Картонная коробка', cost: 10, income: 1, bought: 0 },
        { id: 2, name: 'Пластиковая бутылка', cost: 50, income: 5, bought: 0 },
        { id: 3, name: 'Собака-поводырь', cost: 200, income: 20, bought: 0 },
        { id: 4, name: 'Старый "Жигуль"', cost: 1000, income: 100, bought: 0 },
        { id: 5, name: 'Ларек с шаурмой', cost: 5000, income: 500, bought: 0 },
        { id: 6, name: 'Первый Биткоин', cost: 20000, income: 2000, bought: 0 }
    ]
};

// Элементы DOM
const registrationModal = document.getElementById('registrationModal');
const gameScreen = document.getElementById('gameScreen');
const playerNameEl = document.getElementById('playerName');
const moneyEl = document.getElementById('money');
const levelEl = document.getElementById('level');
const incomeEl = document.getElementById('income');
const tapBtn = document.getElementById('tapBtn');
const characterEl = document.getElementById('character');
const upgradesContainer = document.getElementById('upgradesContainer');
const playerNameInput = document.getElementById('playerNameInput');
const startBtn = document.getElementById('startBtn');

// --- Загрузка сохранений ---
function loadGame() {
    const saved = localStorage.getItem('bumToMillion');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(state, data);
        // Проверка на финальный уровень
        if (state.level > 6) state.level = 6;
    }
    render();
}

// --- Сохранение игры ---
function saveGame() {
    localStorage.setItem('bumToMillion', JSON.stringify(state));
}

// --- Рендер интерфейса ---
function render() {
    playerNameEl.textContent = state.name;
    moneyEl.textContent = state.money.toLocaleString();
    levelEl.textContent = state.level;
    incomeEl.textContent = state.incomePerSec.toLocaleString();

    // Обновляем картинки персонажа (можно заменить на свои URL)
    const sprites = [
        '🧟‍♂️', // 1: Бомж
        '🚶‍♂️', // 2: Прохожий
        '🧥',    // 3: Менеджер
        '💼',    // 4: Директор
        '🤑',    // 5: Мажор
        '👑'     // 6: Миллионер
    ];
    characterEl.textContent = sprites[state.level - 1];

    // Рендерим апгрейды
    upgradesContainer.innerHTML = '';
    state.upgrades.forEach(upg => {
        const canAfford = state.money >= upg.cost;
        const upgradeEl = document.createElement('div');
        upgradeEl.className = 'upgrade';
        upgradeEl.innerHTML = `
            <div>
                <strong>${upg.name}</strong><br>
                <small>Приносит $${upg.income}/сек</small><br>
                <small>Куплено: ${upg.bought}</small>
            </div>
            <div>
                <small>Цена:</small><br>
                <strong>$${upg.cost.toLocaleString()}</strong><br>
                <button ${!canAfford ? 'disabled' : ''}>Купить</button>
            </div>
        `;
        upgradeEl.querySelector('button').addEventListener('click', () => buyUpgrade(upg.id));
        upgradesContainer.appendChild(upgradeEl);
    });

    saveGame();
}

// --- Покупка апгрейда ---
function buyUpgrade(id) {
    const upg = state.upgrades.find(u => u.id === id);
    if (state.money >= upg.cost) {
        state.money -= upg.cost;
        upg.bought++;
        state.incomePerSec += upg.income;
        
        // Звук или вибрация (опционально)
        // navigator.vibrate(50); 
        
        checkLevelUp();
        render();
    }
}

// --- Клик по кнопке ---
tapBtn.addEventListener('click', () => {
    state.money += state.clickPower;
    // Эффект нажатия
    characterEl.style.transform = 'scale(0.95)';
    setTimeout(() => characterEl.style.transform = 'scale(1)', 100);
    render();
});

// --- Проверка уровня ---
function checkLevelUp() {
    const thresholds = [0, 100, 500, 2000, 10000, 50000, 200000]; // 6 уровней
    if (state.money >= thresholds[state.level + 1] && state.level < 6) {
        state.level++;
        state.clickPower += 1; // С каждым уровнем клик становится чуть мощнее
        // Здесь можно добавить alert(`Ты достиг уровня ${state.level}!`);
    }
}

// --- Пассивный доход (каждую секунду) ---
setInterval(() => {
    if (state.incomePerSec > 0) {
        state.money += state.incomePerSec;
        render();
    }
}, 1000);

// --- Регистрация ---
startBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        state.name = name;
        registrationModal.style.display = 'none';
        gameScreen.style.display = 'block';
        render();
    } else {
        alert('У бомжа должно быть имя!');
    }
});

// --- Автосохранение при закрытии ---
window.addEventListener('beforeunload', saveGame);

// --- Инициализация ---
loadGame();
