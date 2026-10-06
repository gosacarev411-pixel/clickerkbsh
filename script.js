// Основные игровые переменные
let score = parseFloat(localStorage.getItem('hamster_score')) || 0;
let donateBalance = parseInt(localStorage.getItem('hamster_donate')) || 0;
let maxEnergy = 500;
let profitPerClick = parseFloat(localStorage.getItem('hamster_profit')) || 0.000000001;
let miningPower = parseFloat(localStorage.getItem('hamster_mining')) || 0;
let energyCost = 1;

let clickUpgradeCost = parseFloat(localStorage.getItem('hamster_click_cost')) || 1.0;
let miningUpgradeCost = parseFloat(localStorage.getItem('hamster_mining_cost')) || 5.0;

// Скины (6 штук)
const skinsData = [
    { id: 0, name: 'Классическая', price: 0, img: '', icon: '🍾' },
    { id: 1, name: 'Золотая бутылка', price: 50, img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { id: 2, name: 'Неоновая кола', price: 100, img: 'https://cdn-icons-png.flaticon.com/512/2738/2738245.png' },
    { id: 3, name: 'Энергетик', price: 200, img: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png' },
    { id: 4, name: 'Космический зелей', price: 350, img: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' },
    { id: 5, name: 'Алмазный сосуд', price: 500, img: 'https://cdn-icons-png.flaticon.com/512/4208/4208753.png' }
];

let ownedSkins = JSON.parse(localStorage.getItem('hamster_owned_skins')) || [0];
let currentSkinId = parseInt(localStorage.getItem('hamster_current_skin')) || 0;

let isRegenerating = localStorage.getItem('hamster_isRegenerating') === 'true';
let energy = localStorage.getItem('hamster_energy') !== null ? parseFloat(localStorage.getItem('hamster_energy')) : 500;

let regenerationTimeLeft = 30 * 60;
let timerInterval = null;
const TOTAL_REGEN_TIME = 30 * 60;

// Фоновый таймер
let savedEndTime = localStorage.getItem('hamster_endTime');
if (isRegenerating && savedEndTime) {
    let currentTime = Math.floor(Date.now() / 1000);
    let timeLeft = parseInt(savedEndTime) - currentTime;

    if (timeLeft <= 0) {
        energy = maxEnergy;
        isRegenerating = false;
        localStorage.removeItem('hamster_endTime');
    } else {
        regenerationTimeLeft = timeLeft;
        energy = 0;
    }
}

// DOM элементы
const scoreEl = document.getElementById('score');
const donateBalanceEl = document.getElementById('donate-balance');
const coinEl = document.getElementById('coin');
const coinSkinImg = document.getElementById('coin-skin-img');
const coinDefaultIcon = document.getElementById('coin-default-icon');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');

let timerDisplayEl = document.getElementById('regeneration-timer');
if (!timerDisplayEl) {
    timerDisplayEl = document.createElement('div');
    timerDisplayEl.id = 'regeneration-timer';
    energyTextEl.parentNode.parentNode.insertBefore(timerDisplayEl, energyTextEl.parentNode.nextSibling);
}

function saveGameData() {
    localStorage.setItem('hamster_score', score);
    localStorage.setItem('hamster_donate', donateBalance);
    localStorage.setItem('hamster_energy', energy);
    localStorage.setItem('hamster_profit', profitPerClick);
    localStorage.setItem('hamster_mining', miningPower);
    localStorage.setItem('hamster_click_cost', clickUpgradeCost);
    localStorage.setItem('hamster_mining_cost', miningUpgradeCost);
    localStorage.setItem('hamster_isRegenerating', isRegenerating);
    localStorage.setItem('hamster_owned_skins', JSON.stringify(ownedSkins));
    localStorage.setItem('hamster_current_skin', currentSkinId);
}

if (isRegenerating) {
    startRegenerationTimer(false);
} else {
    updateUI();
}

// Клик по монете
coinEl.addEventListener('click', (e) => {
    if (!isRegenerating && energy >= energyCost) {
        score += profitPerClick;
        energy -= energyCost;
        updateUI();
        saveGameData();
        createFloatingText(e.clientX, e.clientY, `+${profitPerClick.toFixed(9)}`);

        if (energy < energyCost) {
            energy = 0;
            start


RegenerationTimer(true);
        }
    }
});

// Пассивный майнинг каждую секунду
setInterval(() => {
    if (miningPower > 0) {
        score += miningPower;
        updateUI();
        saveGameData();
    }
}, 1000);

// Таймер восстановления энергии
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
    scoreEl.textContent = score.toFixed(8);
    donateBalanceEl.textContent = donateBalance;
    energyTextEl.textContent = `${Math.floor(energy)} / ${maxEnergy}`;
    const energyPercent = (energy / maxEnergy) * 100;
    energyProgressEl.style.width = `${energyPercent}%`;

    if (isRegenerating) {
        if (regenerationTimeLeft < 0) regenerationTimeLeft = 0;
        const minutes = Math.floor(regenerationTimeLeft / 60);
        const seconds = regenerationTimeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplayEl.textContent = `Восстановление: ${formattedTime}`;
        timerDisplayEl.style.display = 'block';
    } else {
        timerDisplayEl.style.display = 'none';
    }

    updateSkinDisplay();
    updateShopUI();
    renderSkins();
    renderTopList();
}

function updateSkinDisplay() {
    const skin = skinsData.find(s => s.id === currentSkinId);
    if (skin && skin.img) {
        coinSkinImg.src = skin.img;
        coinSkinImg.style.display = 'block';
        coinDefaultIcon.style.display = 'none';
    } else {
        coinSkinImg.style.display = 'none';
        coinDefaultIcon.style.display = 'block';
        coinDefaultIcon.textContent = skin ? skin.icon : '🍾';
    }
}

// Анимация текста при клике
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#00cec9';
    el.style.fontSize = '18px';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);
    setTimeout(() => {
        el.style.top = `${y - 50}px`;
        el.style.opacity = '0';
    }, 20);
    setTimeout(() => el.remove(), 650);
}

// Магазин улучшений
document.getElementById('buy-click-upgrade').addEventListener('click', () => {
    if (score >= clickUpgradeCost) {
        score -= clickUpgradeCost;
        profitPerClick += 0.000000001;
        clickUpgradeCost *= 1.5;
        updateUI();
        saveGameData();
    } else {
        alert('Недостаточно монет!');
    }
});

document.getElementById('buy-mining-upgrade').addEventListener('click', () => {
    if (score >= miningUpgradeCost) {
        score -= miningUpgradeCost;
        miningPower += 0.000000001;
        miningUpgradeCost *= 1.5;
        updateUI();
        saveGameData();
    } else {
        alert('Недостаточно монет!');
    }
});

f



unction updateShopUI() {
    document.getElementById('upgrade-click-cost').textContent = `Цена: ${clickUpgradeCost.toFixed(2)} 🪙`;
    document.getElementById('upgrade-mining-cost').textContent = `Цена: ${miningUpgradeCost.toFixed(2)} 🪙`;
}

// Рендер скинов
function renderSkins() {
    const container = document.getElementById('skins-container');
    container.innerHTML = '';

    skinsData.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const isEquipped = currentSkinId === skin.id;

        const card = document.createElement('div');
        card.className = 'skin-card';
        card.innerHTML = `
            <img src="${skin.img || 'https://cdn-icons-png.flaticon.com/512/2738/2738245.png'}" alt="${skin.name}">
            <h4>${skin.name}</h4>
            <button class="skin-action-btn ${isEquipped ? 'equipped' : ''}">
                ${isEquipped ? 'Надето' : (isOwned ? 'Надеть' : `Купить (${skin.price} 💎)`)}
            </button>
        `;

        card.querySelector('button').addEventListener('click', () => {
            if (isOwned) {
                currentSkinId = skin.id;
                updateUI();
                saveGameData();
            } else {
                if (donateBalance >= skin.price) {
                    donateBalance -= skin.price;
                    ownedSkins.push(skin.id);
                    currentSkinId = skin.id;
                    updateUI();
                    saveGameData();
                } else {
                    alert('Недостаточно кристаллов 💎 в кошельке!');
                }
            }
        });

        container.appendChild(card);
    });
}

// Донат кнопки
document.getElementById('donate-100-btn').addEventListener('click', () => {
    donateBalance += 100;
    updateUI();
    saveGameData();
    alert('Успешно куплено 100 кристаллов 💎!');
});

document.getElementById('donate-500-btn').addEventListener('click', () => {
    donateBalance += 500;
    updateUI();
    saveGameData();
    alert('Успешно куплено 500 кристаллов 💎!');
});

// Топ игроков
function renderTopList() {
    const container = document.getElementById('top-list-container');
    const fakePlayers = [
        { name: 'CryptoKing', score: 12.5 },
        { name: 'Satoshi_N', score: 8.2 },
        { name: 'TelegramUser', score: 5.1 },
        { name: 'BottleMaster', score: 3.4 },
        { name: 'Вы (Игрок)', score: score }
    ];

    fakePlayers.sort((a, b) => b.score - a.score);

    container.innerHTML = '';
    fakePlayers.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'top-item';
        item.innerHTML = `<span>#${index + 1} ${p.name}</span> <span>${p.score.toFixed(4)} 🪙</span>`;
        container.appendChild(item);
    });
}

// Переключение экранов по нижнему меню
const navButtons = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        screens.forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

// Динамический космический фон (звезды)
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawSpace() {
    ctx.fillStyle = '#0b091a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.
confer.biz - Confer Business Names (Naming Agency)
skin.name


globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });

    requestAnimationFrame(drawSpace);
}
drawSpace();
