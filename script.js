let score = parseFloat(localStorage.getItem('hc_score')) || 0;
let profitPerHour = parseInt(localStorage.getItem('hc_profit_hour')) || 0;
let profitPerClick = parseInt(localStorage.getItem('hc_profit_click')) || 1;

let maxEnergy = 500;
let energy = localStorage.getItem('hc_energy') !== null ? parseFloat(localStorage.getItem('hc_energy')) : 500;
let energyCost = 1;

// Стоимость улучшений
let mining1Cost = parseInt(localStorage.getItem('hc_m1_cost')) || 50;
let mining2Cost = parseInt(localStorage.getItem('hc_m2_cost')) || 500;

// Элементы интерфейса
const scoreEl = document.getElementById('score');
const profitPerHourVal = document.getElementById('profit-per-hour-val');
const profitPerClickVal = document.getElementById('profit-per-click-val');
const energyVal = document.getElementById('energy-val');
const energyCurrent = document.getElementById('energy-current');
const energyMax = document.getElementById('energy-max');
const energyProgress = document.getElementById('energy-progress');
const coinEl = document.getElementById('coin');

function saveData() {
    localStorage.setItem('hc_score', score);
    localStorage.setItem('hc_profit_hour', profitPerHour);
    localStorage.setItem('hc_profit_click', profitPerClick);
    localStorage.setItem('hc_energy', energy);
    localStorage.setItem('hc_m1_cost', mining1Cost);
    localStorage.setItem('hc_m2_cost', mining2Cost);
}

function updateUI() {
    if (scoreEl) scoreEl.textContent = Math.floor(score);
    if (profitPerHourVal) profitPerHourVal.textContent = profitPerHour + ' 🪙';
    if (profitPerClickVal) profitPerClickVal.textContent = '+' + profitPerClick;
    if (energyVal) energyVal.textContent = Math.floor(energy) + '/' + maxEnergy;
    if (energyCurrent) energyCurrent.textContent = Math.floor(energy);
    if (energyMax) energyMax.textContent = maxEnergy;

    let percent = (energy / maxEnergy) * 100;
    if (energyProgress) energyProgress.style.width = percent + '%';
}

// Клик по монете/бутылке
if (coinEl) {
    coinEl.addEventListener('pointerdown', (e) => {
        if (energy >= energyCost) {
            score += profitPerClick;
            energy -= energyCost;
            updateUI();
            saveData();

            showFloatingText(e.clientX, e.clientY, '+' + profitPerClick);
            if (energy < 0) energy = 0;
        }
    });
}

// Анимация всплывающего числа при клике
function showFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = '#ffa502';
    el.style.fontSize = '22px';
    el.style.fontWeight = 'bold';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.5s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);
    setTimeout(() => {
        el.style.top = (y - 60) + 'px';
        el.style.opacity = '0';
    }, 20);
    setTimeout(() => el.remove(), 550);
}

// Пассивный доход и восстановление энергии каждую секунду
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 3);
    }
    if (profitPerHour > 0) {
        score += profitPerHour / 3600;
    }
    updateUI();
    saveData();
}, 1000);

// Покупка улучшений (Шахты)
const buyM1 = document.getElementById('buy-mining-1');
if (buyM1) {
    buyM1.addEventListener('click', () => {
        if (score >= mining1Cost) {
            score -= mining1Cost;
            profitPerHour += 10;
            mining1Cost = Math.floor(mining1Cost * 1.5);
            buyM1.querySelector('.card-price').textContent = mining1Cost + ' 🪙';
            updateUI();
            saveData();
            alert('Успешно куплено!');
        } else {
            alert('Недостаточно монет!');
        }
    });
}

const buyM2 = document.getElementById('buy-mining-2');
if (buyM2) {
    buyM2.addEventListener('click', () => {
        if (score >=


mining2Cost) {
            score -= mining2Cost;
            profitPerHour += 100;
            mining2Cost = Math.floor(mining2Cost * 1.5);
            buyM2.querySelector('.card-price').textContent = mining2Cost + ' 🪙';
            updateUI();
            saveData();
            alert('Успешно куплено!');
        } else {
            alert('Недостаточно монет!');
        }
    });
}

// Переключение нижнего меню (вкладки)
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) targetScreen.classList.add('active');
    });
});

updateUI();
