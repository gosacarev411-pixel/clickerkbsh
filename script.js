// Загружаем сохраненные данные или ставим значения по умолчанию
let score = parseFloat(localStorage.getItem('hamster_score')) || 0;
let maxEnergy = 500;
let profitPerClick = 0.0001;
let energyCost = 1;

let isRegenerating = localStorage.getItem('hamster_isRegenerating') === 'true';
let energy = localStorage.getItem('hamster_energy') !== null ? parseFloat(localStorage.getItem('hamster_energy')) : 500;

let regenerationTimeLeft = 30 * 60; // 30 минут в секундах
let timerInterval = null;

const TOTAL_REGEN_TIME = 30 * 60;

// Проверяем фоновое время при запуске приложения
let savedEndTime = localStorage.getItem('hamster_endTime');
if (isRegenerating && savedEndTime) {
    let currentTime = Math.floor(Date.now() / 1000);
    let timeLeft = parseInt(savedEndTime) - currentTime;

    if (timeLeft <= 0) {
        // Если время вышло, пока приложение было закрыто
        energy = maxEnergy;
        isRegenerating = false;
        localStorage.removeItem('hamster_endTime');
    } else {
        // Если таймер еще идет
        regenerationTimeLeft = timeLeft;
        energy = 0;
    }
}

const scoreEl = document.getElementById('score');
const coinEl = document.getElementById('coin');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');
const buyBoostBtn = document.getElementById('buy-boost-btn');

let timerDisplayEl = document.getElementById('regeneration-timer');
if (!timerDisplayEl) {
    timerDisplayEl = document.createElement('div');
    timerDisplayEl.id = 'regeneration-timer';
    timerDisplayEl.style.color = '#ff4757';
    timerDisplayEl.style.fontSize = '18px';
    timerDisplayEl.style.fontWeight = 'bold';
    timerDisplayEl.style.marginTop = '10px';
    timerDisplayEl.style.textAlign = 'center';
    energyTextEl.parentNode.appendChild(timerDisplayEl);
}

// Функция сохранения данных в память браузера
function saveGameData() {
    localStorage.setItem('hamster_score', score);
    localStorage.setItem('hamster_energy', energy);
    localStorage.setItem('hamster_isRegenerating', isRegenerating);
}

// Запуск или возобновление таймера
if (isRegenerating) {
    startRegenerationTimer(false);
} else {
    updateUI();
}

// Клик по хомяку
coinEl.addEventListener('click', (e) => {
    if (!isRegenerating && energy >= energyCost) {
        score += profitPerClick;
        energy -= energyCost;
        updateUI();
        saveGameData();
        createFloatingText(e.clientX, e.clientY, `+${profitPerClick}`);

        if (energy < energyCost) {
            energy = 0;
            startRegenerationTimer(true);
        }
    }
});

function startRegenerationTimer(createNew = true) {
    isRegenerating = true;
    
    if (createNew) {
        regenerationTimeLeft = TOTAL_REGEN_TIME;
        let endTime = Math.floor(Date.now() / 1000) + TOTAL_REGEN_TIME;
        localStorage.setItem('hamster_endTime', endTime);
    }
    
    updateUI();
    saveGameData();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        let savedEndTime = localStorage.getItem('hamster_endTime');
        if (savedEndTime) {
            let currentTime = Math.floor(Date.now() / 1000);
            regenerationTimeLeft = parseInt(savedEndTime) - currentTime;
        } else {
            regenerationTimeLeft--;
        }

        updateUI();

        if (regenerationTimeLeft <= 0) {
            clearInterval(timerInterval);
            energy = maxEnergy;
            isRegenerating = false;
            regenerationTimeLeft = TOTAL_REGEN_TIME;
            localStorage.removeItem('hamster_endTime');
            updateUI();
            saveGameData();
        }
    }, 1000);
}

// Обновление интерфейса
function updateUI() {
    scoreEl.textContent = score.toFixed(4);
    energyTextEl.textContent = `${Math.floor(energy)} / ${maxEnergy}`;
    const energyPercent = (energy / maxEnergy) * 100;
    energyProgressEl.style.width = `${energyPercent}%`;

    i


f (isRegenerating) {
        if (regenerationTimeLeft < 0) regenerationTimeLeft = 0;
        const minutes = Math.floor(regenerationTimeLeft / 60);
        const seconds = regenerationTimeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplayEl.textContent = `Восстановление энергии: ${formattedTime}`;
        timerDisplayEl.style.display = 'block';
    } else {
        timerDisplayEl.style.display = 'none';
    }
}

// Анимация всплывающего текста при клике
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
