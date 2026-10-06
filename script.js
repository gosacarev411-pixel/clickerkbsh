// Загружаем сохраненные данные или ставим значения по умолчанию
let score = parseFloat(localStorage.getItem('hamster_score')) || 0.0;
let maxEnergy = 500;
let energy = localStorage.getItem('hamster_energy') !== null ? parseFloat(localStorage.getItem('hamster_energy')) : 500;
let profitPerClick = 0.00001;
let energyCost = 1;

let isRegenerating = localStorage.getItem('hamster_isRegenerating') === 'true';
let regenerationTimeLeft = parseInt(localStorage.getItem('hamster_timeLeft')) || (30 * 60);
let timerInterval = null;

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
    localStorage.setItem('hamster_timeLeft', regenerationTimeLeft);
}

// Если при перезагрузке приложения процесс восстановления уже шел, возобновляем таймер
if (isRegenerating) {
    startRegenerationTimer(false); // передаем false, чтобы не сбрасывать время заново
} else {
    updateUI();
}

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

function startRegenerationTimer(resetTime = true) {
    isRegenerating = true;
    if (resetTime) {
        regenerationTimeLeft = 30 * 60;
    }
    updateUI();
    saveGameData();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        regenerationTimeLeft--;
        saveGameData();
        updateUI();

        if (regenerationTimeLeft <= 0) {
            clearInterval(timerInterval);
            energy = maxEnergy;
            isRegenerating = false;
            regenerationTimeLeft = 30 * 60;
            updateUI();
            saveGameData();
        }
    }, 1000);
}

function updateUI() {
    scoreEl.textContent = score.toFixed(1);
    energyTextEl.textContent = `${Math.floor(energy)} / ${maxEnergy}`;
    const energyPercent = (energy / maxEnergy) * 100;
    energyProgressEl.style.width = `${energyPercent}%`;

    if (isRegenerating) {
        const minutes = Math.floor(regenerationTimeLeft / 60);
        const seconds = regenerationTimeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplayEl.textContent = `Восстановление энергии: ${formattedTime}`;
        timerDisplayEl.style.display = 'block';
    } else {
        timerDisplayEl.style.display = 'none';
    }
}

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

    document


.body.appendChild(el);

    setTimeout(() => {
        el.style.top = `${y - 60}px`;
        el.style.opacity = '0';
    }, 20);

    setTimeout(() => {
        el.remove();
    }, 680);
}

buyBoostBtn.addEventListener('click', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        alert('Запрос на оплату отправлен!');
    } else {
        alert('Покупка доступна только внутри приложения Telegram.');
    }
});
