// Состояние игры
let state = {
    coins: 0,
    tapLevel: 1,
    incomePerSec: 0,
    upgrades: [
        { id: 'binance', name: 'Binance', cost: 10, income: 1, owned: 0 },
        { id: 'bybit', name: 'Bybit', cost: 50, income: 5, owned: 0 },
        { id: 'okx', name: 'OKX', cost: 200, income: 20, owned: 0 },
        { id: 'kucoin', name: 'KuCoin', cost: 1000, income: 100, owned: 0 }
    ]
};

// Элементы DOM
const coinsEl = document.getElementById('coins');
const perSecondEl = document.getElementById('per-second');
const tapLevelEl = document.getElementById('tap-level');
const upgradesDiv = document.getElementById('upgrades');
const tapEffectEl = document.getElementById('tap-effect');

// Функция обновления интерфейса
function updateUI() {
    coinsEl.textContent = Math.floor(state.coins);
    perSecondEl.textContent = state.incomePerSec;
    tapLevelEl.textContent = state.tapLevel + 'x';

    // Перерисовываем кнопки улучшений
    upgradesDiv.innerHTML = '';
    state.upgrades.forEach(upg => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.textContent = `${upg.name} (${upg.income}/sec) - ${upg.cost} монет`;
        btn.onclick = () => buyUpgrade(upg.id);
        
        if (state.coins < upg.cost) {
            btn.disabled = true;
        }
        
        upgradesDiv.appendChild(btn);
    });
}

// Функция тапа по хомяку
function tapCoin() {
    state.coins += state.tapLevel;
    // Анимация +1
    tapEffectEl.style.opacity = '1';
    tapEffectEl.style.transform = 'translateY(0) scale(1)';
    setTimeout(() => {
        tapEffectEl.style.opacity = '0';
        tapEffectEl.style.transform = 'translateY(-50px) scale(1.5)';
    }, 10);
    updateUI();
}

// Покупка улучшения
function buyUpgrade(id) {
    const upg = state.upgrades.find(u => u.id === id);
    if (state.coins >= upg.cost) {
        state.coins -= upg.cost;
        upg.owned++;
        upg.cost = Math.floor(upg.cost * 1.5); // Увеличиваем цену на 50%
        state.incomePerSec += upg.income;
        updateUI();
    }
}

// Автосбор дохода каждую секунду
setInterval(() => {
    state.coins += state.incomePerSec;
    updateUI();
}, 1000);

// Сохранение в localStorage
function saveGame() {
    localStorage.setItem('coinKombatSave', JSON.stringify(state));
    alert('Игра сохранена!');
}

function loadGame() {
    const data = localStorage.getItem('coinKombatSave');
    if (data) {
        state = JSON.parse(data);
        // Восстанавливаем функции в объектах (JSON их удаляет)
        state.upgrades.forEach(upg => {
            // Пересчитываем стоимость при загрузке (если она не сохранялась)
            // Здесь для простоты считаем, что цена хранится в сейве
            updateUI();
        });
        updateUI();
        alert('Игра загружена!');
    }
}

// Инициализация
updateUI();
