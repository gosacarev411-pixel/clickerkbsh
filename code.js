// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Глобальный объект состояния
let state = {
    coins: 0, // Обычные монеты
    tapPower: 1, // Усилитель тапа
    energy: 100, // Энергия
    cooling: 100, // Охлаждение (сытость)
    cyberCoins: 0, // Валюта доната
    lastWheelSpin: 0, // Таймер колеса
};

// Товары в магазине
const shopItems = [
    { type: 'power', name: 'Железный чип', cost: 50, effect: '+1 к силе' },
    { type: 'food', name: 'Хакерский энергетик', cost: 30, effect: '+20 охлаждения' },
];

// Загрузка данных из LocalStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', () => loadState());

function loadState() {
    const savedData = localStorage.getItem('TapMaster');
    if (savedData) {
        try {
            state = JSON.parse(savedData);
        } catch(e) {}
    }
    updateUI(); // Отрисовка интерфейса
}

function saveState() {
    localStorage.setItem('TapMaster', JSON.stringify(state));
}

// Основной геймплей
function tap() {
    if (state.energy <= 0 || state.cooling <= 0) return;
    state.coins += state.tapPower;
    state.energy--;
    updateUI();
    saveState();
}

// Магазин
function openShop() {
    showModal();
    renderShop();
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-window').style.display = 'none';
}

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    
    for (let item of shopItems) {
        let btnText = 'Купить';
        if (item.type === 'power') {
            btnText = `Ур. ${Math.floor(state.tapPower)} → Купить`;
        }

        const el = `
            <div class="item">
                <strong>${item.name}</strong><br>
                <small>${item.effect} (${item.cost})</small>
                <button onclick="buyItem('${item.type}')"
                        ${state.coins >= item.cost ? '' : 'disabled'}
                >${btnText}</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', el);
    }
}

function buyItem(type) {
    switch (type) {
        case 'power':
            if (state.coins >= 50) {
                state.coins -= 50;
                state.tapPower++;
            }
            break;
        case 'food':
            if (state.coins >= 30 && state.cooling < 100) {
                state.coins -= 30;
                state.cooling = Math.min(100, state.cooling + 20);
            }
            break;
    }
    updateUI();
    saveState();
}

// Колесо Фортуны
function spinWheel() {
    const now = Date.now();
    const diffMs = now - state.lastWheelSpin;
    const secondsLeft = Math.max(0, 24 * 60 * 60 * 1000 - diffMs);

    if (secondsLeft > 0) {
        const hours = Math.floor(secondsLeft / (1000 * 60 * 60));
        const mins = Math.floor((secondsLeft % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((secondsLeft % (1000 * 60)) / 1000);
        document.getElementById('wheel-timer').textContent =
            `${hours.toString().padStart(2,'0')}:` +
            `${mins.toString().padStart(2,'0')}:` +
            `${secs.toString().padStart(2,'0')}`;
        alert('Колесо еще крутится!');
        return;
    }

    // Логика приза
    const rewards = [50, 100, 200, 300, 500, 1000, 2000, 5000];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    state.coins += reward;
    state.lastWheelSpin = now;

    alert(`Вы выиграли ${reward} монет!`);
    updateUI();
    saveState();
}

// ✅ Реализация казино
function openCasino() {
    showCasino();
    // Переключаемся на первый режим
    document.querySelectorAll('.game-mode').forEach(el => el.classList.remove('active'));
    document.getElementById('slot-game').classList.add('active');
}

function closeCasino() {
    hideCasino();
}

// Блокируем кнопку доступа к казино
function updateUI() {
    document.getElementById('coins').textContent = formatNumber(state.coins);
    document.getElementById('energy-value').textContent = state.energy;
    document.getElementById('energy-bar').value = state.energy;
    document.getElementById('cooling-value').textContent = state.cooling;
    document.getElementById('cooling-bar').value = state.cooling;
    document.getElementById('cyber-coins').textContent = state.cyberCoins;

    // Управление кнопкой казино
    const casinoBtnContainer = document.getElementById('casino-btn-container');
    if (state.cyberCoins > 0) {
        casinoBtnContainer.innerHTML = `<button class="card" onclick="openCasino()">🎲 Казино</button>`;
    } else {
        casinoBtnContainer.textContent = 'Нет доступа к казино';
    }

    // Активация кнопок ставок
    document.querySelectorAll('#modal-casino button').forEach(btn => {
        const betAmount = Number(btn.dataset.amount);
        btn.disabled = (betAmount > state.cyberCoins);
    });
}

// Вспомогательные функции
function formatNumber(n) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function showModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-window').style.display = 'flex';
}
function hideModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-window').style.display = 'none';
}

function showCasino() {
    document.getElementById('modal-casino-overlay').style.display = 'block';
    document.getElementById('modal-casino').style.display = 'flex';
}
function hideCasino() {
    document.getElementById('modal-casino-overlay').style.display = 'none';
    document.getElementById('modal-casino').style.display = 'none';
}

// 🔥 Казино: логика режимов

// Переключение между играми
document.querySelectorAll('.mode-switcher a').forEach(link => {
    link.onclick = e => {
        e.preventDefault();
        const target = link.dataset.target;
        document.querySelectorAll('.game-mode').forEach(el => el.classList.remove('active'));
        document.querySelector(target).classList.add('active');
    };
});

// Нейронная сеть (слоты)
const slotIcons = ['chip.png','matrix.png','neuron.png'];

function playSlots(betAmount) {
    if (!confirm(`Ставите ${betAmount}x кибермонет. Продолжить?`)) return;

    state.cyberCoins -= betAmount;
    updateUI();

    // Генерация комбинации
    const reels = [];
    for(let i = 0; i < 3; i++) {
        reels.push(slotIcons[Math.floor(Math.random() * slotIcons.length)]);
    }

    // Рисуем слоты
    const ctx = document.getElementById('slots-canvas').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const iconSize = 100;
    for(let i = 0; i < 3; i++) {
        const img = new Image();
        img.src = reels[i]; // Тебе нужно положить эти картинки рядом с файлами
        img.onload = () => {
            ctx.drawImage(img, i*(iconSize+10), 20, iconSize, iconSize);
        };
    }

    // Выигрыш
    const isWin = reels[0] === reels[1] && reels[1] === reels[2];
    if (isWin) {
        const winMultiplier = [2, 5, 10][reels[0].indexOf('chip')] || 2;
        const winnings = betAmount * 100 * winMultiplier;
        state.coins += winnings;
        alert(`Джекпот! x${winMultiplier}. Вы выиграли ${formatNumber(winnings)} монет.`);
    } else {
        alert('Не повезло.');
    }
    updateUI();
}

// Матрица случайности (Рулетка)
function playRoulette(betAmount) {
    if (!confirm(`Ставите ${betAmount}x кибермонет. Продолжить?`)) return;

    state.cyberCoins -= betAmount;
    updateUI();

    // Анимация вращения
    const wheel = document.querySelector('.segments');
    wheel.style.animationDuration = '3s'; // Скорость
    wheel.style.animationName = ''; // Очищаем для перезапуска
    void wheel.offsetWidth; // Принудительный рефлоу
    wheel.style.animationName = 'spin';

    setTimeout(() => {
        // Генерируем выигрыш после остановки анимации
        const segments = Array.from(document.querySelectorAll('.segment'));
        const randomIndex = Math.floor(Math.random() * segments.length);
        const multiplier = parseInt(segments[randomIndex].classList[1].substring(1)); // Извлекаем множитель из класса

        const winnings = betAmount * 100 * multiplier;
        state.coins += winnings;
        alert(`Ваше число выпало! x${multiplier}. Вы выиграли ${formatNumber(winnings)} монет.`);
        updateUI();
    }, 3000);
}

// Бинарный код (Блиц-игра)
function startBlitzGame(betAmount) {
    if (!confirm(`Ставите ${betAmount}x кибермонет. Продолжить?`)) return;

    state.cyberCoins -= betAmount;
    updateUI();

    // Создаем бесконечный поток кода
    const codeEl = document.getElementById('binary-code');
    codeEl.textContent = generateBinaryCode(1000);

    // Задача: поймать паттерн
    const pattern = '11111';
    const input = prompt(`Найдите последовательность "${pattern}" в потоке бинарного кода выше. Введите её позицию (от 1):`);
    if (input !== null) {
        const pos = parseInt(input);
        const codeStr = codeEl.textContent;
        if (pos > 0 && codeStr.includes(pattern, pos - 1)) {
            const winnings = betAmount * 100 * 5;
            state.coins += winnings;
            alert(`Верно! Вы выиграли ${formatNumber(winnings)} монет.`);
        } else {
            alert('Ошибка поиска.');
        }
        updateUI();
    }
}

function generateBinaryCode(length) {
    let str = '';
    while(str.length < length) {
        str += Math.round(Math.random()).toString();
    }
    return str;
}
