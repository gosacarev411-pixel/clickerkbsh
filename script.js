let score = 0;
let maxEnergy = 1000;
let energy = 1000;
let profitPerClick = 0.5;
let energyCost = 1;

let isRegenerating = false;
let regenerationTimeLeft = 30 * 60;
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

coinEl.addEventListener('click', (e) => {
    if (!isRegenerating && energy >= energyCost) {
        score += profitPerClick;
        energy -= energyCost;
        updateUI();
        createFloatingText(e.clientX, e.clientY, `+${profitPerClick}`);

        if (energy < energyCost) {
            energy = 0;
            startRegenerationTimer();
        }
    }
});

function startRegenerationTimer() {
    isRegenerating = true;
    regenerationTimeLeft = 30 * 60;
    updateUI();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        regenerationTimeLeft--;
        updateUI();

        if (regenerationTimeLeft <= 0) {
            clearInterval(timerInterval);
            energy = maxEnergy;
            isRegenerating = false;
            updateUI();
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

    document.body.appendChild(el);

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
