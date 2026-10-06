// --- ИГРОВАЯ ЛОГИКА HAMSTER KOMBAT (ВЕРСИЯ С БУТЫЛКОЙ) ---

let score = parseFloat(localStorage.getItem('bottle_score')) || 0;
let profitPerHour = parseInt(localStorage.getItem('bottle_profit_hour')) || 0;
let profitPerClick = parseInt(localStorage.getItem('bottle_profit_click')) || 1;

let maxEnergy = 500;
let energy = localStorage.getItem('bottle_energy') !== null ? parseFloat(localStorage.getItem('bottle_energy')) : 500;
let energyCost = 1;

let clickUpgradeCost = parseInt(localStorage.getItem('bottle_click_cost')) || 100;
let miningUpgradeCost = parseInt(localStorage.getItem('bottle_mining_cost')) || 50;

// DOM элементы
const scoreEl = document.getElementById('score');
const profitPerHourEl = document.getElementById('profit-per-hour');
const coinEl = document.getElementById('coin');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');
const upgradeClickCostEl = document.getElementById('upgrade-click-cost');
const upgradeMiningCostEl = document.getElementById('upgrade-mining-cost');

function saveGameData() {
    localStorage.setItem('bottle_score', score);
    localStorage.setItem('bottle_profit_hour', profitPerHour);
    localStorage.setItem('bottle_profit_click', profitPerClick);
    localStorage.setItem('bottle_energy', energy);
    localStorage.setItem('bottle_click_cost', clickUpgradeCost);
    localStorage.setItem('bottle_mining_cost', miningUpgradeCost);
}

function updateUI() {
    if (scoreEl) scoreEl.textContent = Math.floor(score);
    if (profitPerHourEl) profitPerHourEl.textContent = '+' + profitPerHour;
    if (energyTextEl) energyTextEl.textContent = Math.floor(energy) + ' / ' + maxEnergy;
    
    const energyPercent = (energy / maxEnergy) * 100;
    if (energyProgressEl) energyProgressEl.style.width = energyPercent + '%';

    if (upgradeClickCostEl) upgradeClickCostEl.textContent = 'Цена: ' + clickUpgradeCost + ' 🪙';
    if (upgradeMiningCostEl) upgradeMiningCostEl.textContent = 'Цена: ' + miningUpgradeCost + ' 🪙';
}

// Клик по бутылке с поддержкой мультитача (несколько пальцев)
if (coinEl) {
    coinEl.addEventListener('pointerdown', (e) => {
        if (energy >= energyCost) {
            score += profitPerClick;
            energy -= energyCost;
            updateUI();
            saveGameData();

            createFloatingText(e.clientX, e.clientY, '+' + profitPerClick);

            if (energy < 0) energy = 0;
        }
    });
}

// Эффект всплывающего числа при клике
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = '#00cec9';
    el.style.fontSize = '20px';
    el.style.fontWeight = 'bold';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);
    setTimeout(() => {
        el.style.top = (y - 70) + 'px';
        el.style.opacity = '0';
    }, 20);
    setTimeout(() => el.remove(), 650);
}

// Восстановление энергии и пассивный доход каждую секунду
setInterval(() => {
    // Восстановление энергии (по 5 энергии в секунду)
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 5);
    }

    // Пассивный доход в секунду (profitPerHour / 3600)
    if (profitPerHour > 0) {
        score += profitPerHour / 3600;
    }

    updateUI();
    saveGameData();
}, 1000);

// Покупка улучшения клика
const buyClickBtn = document.getElementById('buy-click-upgrade');
if (buyClickBtn) {
    buyClickBtn.addEventListener('click', () => {
        if (score >= clickUpgradeCost) {
            score -= clickUpgradeCost;
            profitPerClick += 1;
            clickUpgradeCost = Math.floor(clickUpgradeCost * 1.6);
            updateUI();
            saveGameData();
            alert('Успешно! Си


ла клика увеличена.');
        } else {
            alert('Недостаточно монет!');
        }
    });
}

// Покупка пассивного дохода (шахты)
const buyMiningBtn = document.getElementById('buy-mining-upgrade');
if (buyMiningBtn) {
    buyMiningBtn.addEventListener('click', () => {
        if (score >= miningUpgradeCost) {
            score -= miningUpgradeCost;
            profitPerHour += 10;
            miningUpgradeCost = Math.floor(miningUpgradeCost * 1.6);
            updateUI();
            saveGameData();
            alert('Успешно! Доход в час увеличен.');
        } else {
            alert('Недостаточно монет!');
        }
    });
}

// Навигация по вкладкам снизу
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.classList.add('active');
    });
});

// Инициализация при запуске
updateUI();
