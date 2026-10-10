// Инициализация Telegram SDK
const tg = window.Telegram.WebApp;
tg.expand();

// --- Глобальные переменные состояния ---
let state = {
    coins: 0,
    energy: 100,
    maxEnergy: 100,
    hunger: 100,
    maxHunger: 100,
    tapPower: 1,
    energyRegenRate: 1, // в секунду
    lastWheelSpin: 0,
    lastSave: 0,
    hungerDecayRate: 0.1, // в секунду
    lastHungerTick: Date.now()
};

// --- ЭФФЕКТЫ ДЛЯ ГОДА ИГРЫ (Математика удержания) ---
// 1. Экспоненциальная инфляция цен
function getCost(baseCost, level) {
    // Формула: Цена = База * (1.15 ^ Уровень)
    return Math.floor(baseCost * Math.pow(1.15, level));
}

// 2. Асимптотический прирост урона (убывающая полезность)
function getTapPower(basePower, level) {
    // Формула: Урон = База * (1 - e^(-0.05 * Уровень))
    // Это не даст игроку уйти в бесконечный отрыв, сохраняя ценность каждого нового уровня
    return Math.floor(basePower * (1 - Math.exp(-0.05 * level)));
}

// 3. Мягкий потолок энергии
function getMaxEnergy(base, level) {
    // Логарифмический рост, чтобы игрок не мог накопить бесконечную энергию за пару дней
    return Math.floor(base + 20 * Math.log(level + 1));
}

// Глобальные данные магазина
const shopItems = [
    { id: 'tap_upgrade', name: 'Железный палец', cost: 50 },
    // Остальные товары...
];

document.addEventListener('DOMContentLoaded', () => {
    let state;
    
    // Загрузка состояния из LocalStorage при загрузке страницы
    const loadState = () => {
        try {
            const data = localStorage.getItem('TapMaster');
            if (data) return JSON.parse(data);
            else return {};
        } catch(e) {}
        
        return {}; // Возвращаем пустой объект по умолчанию
    };

    // Сохранение состояния каждые 3 секунды
    setInterval(() => saveState(), 3000);

    // Инициализация игры
    state = loadState();
    updateUI();
});

function openShop() {
    // Проверка существования массива товаров
    if (!Array.isArray(shopItems)) return; 

    // Рендеринг товаров
    const container = document.getElementById('shop-items');
    container.innerHTML = '';

    for (let item of shopItems) {
        const el = document.createElement('div');
        el.className = 'item';
        el.textContent = `${item.name} — ${item.cost}`;
        container.appendChild(el);
    }
}

// --- Функции UI ---
function updateUI() {
    document.getElementById('coins').innerText = `Монеты: ${state.coins}`;
    document.getElementById('energy').innerText = `Энергия: ${state.energy}/${state.maxEnergy}`;
    document.getElementById('hunger').innerText = `Сытость: ${state.hunger}/${state.maxHunger}`;
    document.getElementById('tap-value').innerText = `+${state.tapPower}`;
}

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    shopItems.forEach(item => {
        const el = document.createElement('div');
        el.className = 'item';
        
        let actionText = '';
        if (item.type === 'power' || item.type === 'energy') {
            actionText = `Ур. ${item.level} — Купить за ${getCost(item.cost, item.level)}`;
        } else {
            actionText = `Купить за ${item.cost}`;
        }

        el.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>${item.desc}</small>
            </div>
            <button onclick="buyItem('${item.id}')">${actionText}</button>
        `;
        container.appendChild(el);
    });
}

// --- Игровая логика ---
function tap() {
    if (state.energy <= 0) {
        showToast('Недостаточно энергии!');
        return;
    }
    state.energy -= 1;
    state.coins += state.tapPower;
    updateUI();
    saveGame();
}

function buyItem(id) {
    const item = shopItems.find(i => i.id === id);
    if (!item) return;

    let cost = item.cost;
    if (item.type === 'power' || item.type === 'energy') {
        cost = getCost(item.cost, item.level);
    }

    if (state.coins >= cost) {
        state.coins -= cost;
        if (item.type === 'power') {
            item.level++;
            state.tapPower = getTapPower(item.baseValue, item.level);
        }
        if (item.type === 'energy') {
            item.level++;
            state.maxEnergy = getMaxEnergy(item.baseValue, item.level);
            if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
        }
        if (item.type === 'hunger') {
            state.hunger = Math.min(state.maxHunger, state.hunger + item.value);
        }
        showToast('Успешно!');
        updateUI();
        renderShop();
        saveGame();
    } else {
        showToast('Недостаточно монет');
    }
}

// Колесо Фортуны (раз в сутки)
function spinWheel() {
    const now = Date.now();
    const last = state.lastWheelSpin;
    const diff = 24 * 60 * 60 * 1000 - (now - last);

    if (now - last < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        showToast(`Следующий спин через ${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        return;
    }

    state.lastWheelSpin = now;
    const rewards = [
        { type: 'coins', value: Math.floor(Math.random() * 500) + 100 },
        { type: 'energy', value: Math.floor(Math.random() * 30) + 20 },
        { type: 'hunger', value: Math.floor(Math.random() * 30) + 20 },
        { type: 'lucky', value: 'Редкий буст x2 на 1 час' }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (reward.type === 'coins') state.coins += reward.value;
    if (reward.type === 'energy') state.energy = Math.min(state.maxEnergy, state.energy + reward.value);
    if (reward.type === 'hunger') state.hunger = Math.min(state.maxHunger, state.hunger + reward.value);

    showToast(`Вы получили: ${reward.value} ${reward.type}`);
    updateUI();
    saveGame();
}

// --- Математика времени (Голод и Энергия) ---
function gameLoop() {
    const now = Date.now();
    const delta = (now - state.lastHungerTick) / 1000; // в секундах

    // Расход сытости
    state.hunger = Math.max(0, state.hunger - (state.hungerDecayRate * delta));
    
    // Если голоден — энергия не восстанавливается
    if (state.hunger > 0) {
        state.energy = Math.min(state.maxEnergy, state.energy + (state.energyRegenRate * delta));
    }

    state.lastHungerTick = now;

    // Обновление таймера колеса
    const wheelTimer = document.getElementById('wheel-timer');
    const diff = state.lastWheelSpin + 24 * 60 * 60 * 1000 - now;
    if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        wheelTimer.innerText = `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        wheelTimer.innerText = 'ГОТОВО';
    }

    updateUI();

    // Автосохранение раз в 10 секунд
    if (now - state.lastSave > 10000) {
        saveGame();
        state.lastSave = now;
    }
}

// --- Сохранение и загрузка ---
function saveGame() {
    localStorage.setItem('tapmaster_state', JSON.stringify(state));
}

function loadGame() {
    const data = localStorage.getItem('tapmaster_state');
    if (data) {
        state = JSON.parse(data);
        // Пересчитываем динамические значения при загрузке
        state.tapPower = getTapPower(shopItems[0].baseValue, shopItems[0].level);
        state.maxEnergy = getMaxEnergy(shopItems[1].baseValue, shopItems[1].level);
    }
}

// --- Вспомогательные функции ---
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function openShop() {
    document.getElementById('shopModal').style.display = 'block';
    renderShop();
}
function closeShop() {
    document.getElementById('shopModal').style.display = 'none';
}
function openCasino() {
    showToast('Казино в разработке. Ставь все на зеро!');
}

// --- Инициализация ---
document.getElementById('tapBtn').addEventListener('click', tap);
loadGame();
updateUI();
renderShop();
setInterval(gameLoop, 1000); // 1 раз в секунду
