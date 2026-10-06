let score = 0;
let maxEnergy = 1000;
let energy = 1000;
let profitPerClick = 1;
let energyCost = 1;

const scoreEl = document.getElementById('score');
const coinEl = document.getElementById('coin');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');
const buyBoostBtn = document.getElementById('buy-boost-btn');

// Клик по хомяку
coinEl.addEventListener('click', (e) => {
    if (energy >= energyCost) {
        score += profitPerClick;
        energy -= energyCost;
        updateUI();
        createFloatingText(e.clientX, e.clientY, `+${profitPerClick}`);
    }
});

// Автовосстановление энергии (5 ед. в секунду)
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 5);
        updateUI();
    }
}, 1000);

// Обновление интерфейса
function updateUI() {
    scoreEl.textContent = score.toFixed(1);
    energyTextEl.textContent = `${energy} / ${maxEnergy}`;
    const energyPercent = (energy / maxEnergy) * 100;
    energyProgressEl.style.width = `${energyPercent}%`;
}

// Анимация всплывающего плюсика
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#fff';
    el.style.fontSize = '24px';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);

    setTimeout(() => {
        el.style.top = `${y - 60}px`;
        el.style.opacity = '0';
    }, 20);

    setTimeout(() => {
        el.remove();
    }, 680);
}

// Обработка нажатия на кнопку покупки бонуса
buyBoostBtn.addEventListener('click', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        alert('Запрос на оплату отправлен!');
    } else {
        alert('Покупка доступна только внутри приложения Telegram.');
    }
});